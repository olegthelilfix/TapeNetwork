// tape-streamer — Go HTTP video streaming service
//
// Serves video files from VIDEOS_DIR as adaptive HLS streams. On first request
// for a given file, FFmpeg transcodes the source into multiple quality tiers
// (360p/720p/1080p, skipping qualities above the source resolution). Segments
// are cached in HLS_CACHE_DIR and served on subsequent requests without
// re-transcoding. A background goroutine cleans up stale caches.
//
// Environment variables:
//   VIDEOS_DIR          – source video directory              (default /data/videos)
//   HLS_CACHE_DIR       – HLS segment cache root               (default /data/hls-cache)
//   PORT                – HTTP listen port                     (default 8082)
//   SEGMENT_DURATION    – seconds per HLS segment              (default 6)
//   CACHE_MAX_AGE       – cache eviction age; int seconds or a
//                         Go duration string like "24h"        (default 24h)
//   CORS_ORIGINS        – comma-separated allowed origins      (default *)
//   MAX_CONCURRENT      – max simultaneous FFmpeg transcodes   (default 2)
//   TRANSCODE_TIMEOUT   – per-file transcode ceiling, duration (default 15m)

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"
)

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

type config struct {
	VideosDir        string
	HLSCacheDir      string
	Port             string
	SegmentDuration  int
	CacheMaxAge      time.Duration
	CORSOrigins      string
	MaxConcurrent    int
	TranscodeTimeout time.Duration
}

func loadConfig() config {
	return config{
		VideosDir:        envOrDefault("VIDEOS_DIR", "/data/videos"),
		HLSCacheDir:      envOrDefault("HLS_CACHE_DIR", "/data/hls-cache"),
		Port:             envOrDefault("PORT", "8082"),
		SegmentDuration:  envOrDefaultInt("SEGMENT_DURATION", 6),
		CacheMaxAge:      envOrDefaultDuration("CACHE_MAX_AGE", 24*time.Hour),
		CORSOrigins:      envOrDefault("CORS_ORIGINS", "*"),
		MaxConcurrent:    envOrDefaultInt("MAX_CONCURRENT", 2),
		TranscodeTimeout: envOrDefaultDuration("TRANSCODE_TIMEOUT", 15*time.Minute),
	}
}

func envOrDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func envOrDefaultInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
		log.Printf("[tape-streamer] WARN: %s=%q is not an integer, using default %d", key, v, def)
	}
	return def
}

// envOrDefaultDuration accepts either a bare integer (interpreted as seconds)
// or a Go duration string like "24h" / "15m". Falls back to def with a warning
// on an unparseable value, so a typo never silently changes behavior.
func envOrDefaultDuration(key string, def time.Duration) time.Duration {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	if n, err := strconv.Atoi(v); err == nil {
		return time.Duration(n) * time.Second
	}
	if d, err := time.ParseDuration(v); err == nil {
		return d
	}
	log.Printf("[tape-streamer] WARN: %s=%q is not seconds or a duration, using default %s", key, v, def)
	return def
}

// ---------------------------------------------------------------------------
// Path-segment validation (defense against traversal + ffmpeg arg injection)
// ---------------------------------------------------------------------------

// safeSegment allows only characters legitimately used in our filenames,
// quality tiers, and segment names: alphanumerics, dot, hyphen, underscore.
// This rejects "..", "/", leading "-", URL-encoded traversal, etc.
var safeSegment = regexp.MustCompile(`^[A-Za-z0-9][A-Za-z0-9._-]*$`)

func isSafeSegment(s string) bool {
	return s != "" && !strings.Contains(s, "..") && safeSegment.MatchString(s)
}

// ---------------------------------------------------------------------------
// Quality tiers
// ---------------------------------------------------------------------------

type quality struct {
	Name         string // e.g. "360p"
	Width        int
	Height       int
	VideoBitrate string // e.g. "800k"
	AudioBitrate string // e.g. "96k"
	Bandwidth    int    // bits/s for master playlist
}

var qualities = []quality{
	{Name: "360p", Width: 640, Height: 360, VideoBitrate: "800k", AudioBitrate: "96k", Bandwidth: 896000},
	{Name: "720p", Width: 1280, Height: 720, VideoBitrate: "2500k", AudioBitrate: "128k", Bandwidth: 2628000},
	{Name: "1080p", Width: 1920, Height: 1080, VideoBitrate: "5000k", AudioBitrate: "192k", Bandwidth: 5192000},
}

// ---------------------------------------------------------------------------
// Video probe (ffprobe)
// ---------------------------------------------------------------------------

type probeResult struct {
	Width    int
	Height   int
	Duration float64
}

func probeVideo(ctx context.Context, path string) (*probeResult, error) {
	cmd := exec.CommandContext(ctx, "ffprobe",
		"-v", "error",
		"-select_streams", "v:0",
		"-show_entries", "stream=width,height,duration",
		"-of", "json",
		path,
	)
	out, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("ffprobe failed: %w", err)
	}

	var data struct {
		Streams []struct {
			Width    int    `json:"width"`
			Height   int    `json:"height"`
			Duration string `json:"duration"`
		} `json:"streams"`
	}
	if err := json.Unmarshal(out, &data); err != nil {
		return nil, fmt.Errorf("ffprobe JSON parse: %w", err)
	}
	if len(data.Streams) == 0 {
		return nil, fmt.Errorf("no video stream found in %s", path)
	}

	s := data.Streams[0]
	dur, _ := strconv.ParseFloat(s.Duration, 64)
	return &probeResult{Width: s.Width, Height: s.Height, Duration: dur}, nil
}

// ---------------------------------------------------------------------------
// Transcoding lock map — one mutex per source filename, prunable
// ---------------------------------------------------------------------------

type lockMap struct {
	mu    sync.Mutex
	locks map[string]*sync.Mutex
}

func newLockMap() *lockMap {
	return &lockMap{locks: make(map[string]*sync.Mutex)}
}

// get returns a per-filename mutex. Safe for concurrent access.
func (lm *lockMap) get(filename string) *sync.Mutex {
	lm.mu.Lock()
	defer lm.mu.Unlock()
	if m, ok := lm.locks[filename]; ok {
		return m
	}
	m := &sync.Mutex{}
	lm.locks[filename] = m
	return m
}

// prune drops entries whose mutex is currently free and whose filename is in
// the keep set. Called from the cache-cleanup goroutine so the map does not
// grow unboundedly as video content rotates.
func (lm *lockMap) prune(keep map[string]bool) {
	lm.mu.Lock()
	defer lm.mu.Unlock()
	for name, m := range lm.locks {
		if keep[name] {
			continue
		}
		// Only remove if not currently held (TryLock succeeds).
		if m.TryLock() {
			m.Unlock()
			delete(lm.locks, name)
		}
	}
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

type server struct {
	cfg   config
	locks *lockMap
	sem   chan struct{} // bounds concurrent FFmpeg processes
}

func newServer(cfg config) *server {
	if cfg.MaxConcurrent < 1 {
		cfg.MaxConcurrent = 1
	}
	return &server{
		cfg:   cfg,
		locks: newLockMap(),
		sem:   make(chan struct{}, cfg.MaxConcurrent),
	}
}

// addCORS sets CORS response headers based on configuration.
func (s *server) addCORS(w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	if s.cfg.CORSOrigins == "*" {
		w.Header().Set("Access-Control-Allow-Origin", "*")
	} else {
		for _, allowed := range strings.Split(s.cfg.CORSOrigins, ",") {
			if strings.TrimSpace(allowed) == origin {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				break
			}
		}
	}
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Range")
}

// ---------------------------------------------------------------------------
// GET /health
// ---------------------------------------------------------------------------

func (s *server) handleHealth(w http.ResponseWriter, r *http.Request) {
	s.addCORS(w, r)
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"status":"ok"}`))
}

// ---------------------------------------------------------------------------
// GET /videos — list source video files
// ---------------------------------------------------------------------------

type videoInfo struct {
	Name     string    `json:"name"`
	Size     int64     `json:"size"`
	Modified time.Time `json:"modified"`
}

func (s *server) handleVideos(w http.ResponseWriter, r *http.Request) {
	s.addCORS(w, r)

	entries, err := os.ReadDir(s.cfg.VideosDir)
	if err != nil {
		http.Error(w, "cannot read videos directory", http.StatusInternalServerError)
		log.Printf("[tape-streamer] ReadDir %s: %v", s.cfg.VideosDir, err)
		return
	}

	var videos []videoInfo
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		info, err := e.Info()
		if err != nil {
			continue
		}
		// Accept common video extensions.
		ext := strings.ToLower(filepath.Ext(e.Name()))
		switch ext {
		case ".mp4", ".mkv", ".avi", ".mov", ".webm", ".flv", ".wmv", ".ts", ".m4v":
			videos = append(videos, videoInfo{
				Name:     e.Name(),
				Size:     info.Size(),
				Modified: info.ModTime(),
			})
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(videos)
}

// ---------------------------------------------------------------------------
// GET /stream/{filename}/master.m3u8
// ---------------------------------------------------------------------------

func (s *server) handleMaster(w http.ResponseWriter, r *http.Request, filename string) {
	s.addCORS(w, r)

	srcPath := filepath.Join(s.cfg.VideosDir, filename)
	if _, err := os.Stat(srcPath); os.IsNotExist(err) {
		http.Error(w, "video not found", http.StatusNotFound)
		return
	}

	// Acquire per-file lock so only one FFmpeg run happens at a time.
	fileLock := s.locks.get(filename)

	// Check if transcoding is already in progress (non-blocking check).
	if !fileLock.TryLock() {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Retry-After", "10")
		w.WriteHeader(http.StatusAccepted)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "transcoding",
			"message": "transcoding in progress, retry shortly",
		})
		return
	}
	defer fileLock.Unlock()

	// If everything is already cached, skip probe/transcode entirely and just
	// serve the master playlist (fast path for the common case).
	if !s.allCached(filename) {
		if err := s.transcode(r.Context(), w, filename, srcPath); err != nil {
			return // transcode already wrote the error response
		}
	}

	s.writeMaster(w, filename)
}

// allCached reports whether at least one quality tier has a finished playlist.
func (s *server) allCached(filename string) bool {
	for _, q := range qualities {
		indexPath := filepath.Join(s.cfg.HLSCacheDir, filename, q.Name, "index.m3u8")
		if _, err := os.Stat(indexPath); err == nil {
			// Touch for cache-cleanup mtime tracking.
			now := time.Now()
			os.Chtimes(filepath.Dir(indexPath), now, now)
			return true
		}
	}
	return false
}

// transcode probes the source and runs FFmpeg for each applicable quality.
// It bounds concurrency with the server semaphore and enforces a per-file
// timeout via context. On error it writes the HTTP response and returns err.
func (s *server) transcode(ctx context.Context, w http.ResponseWriter, filename, srcPath string) error {
	// Bound the number of concurrent FFmpeg processes across the whole server.
	select {
	case s.sem <- struct{}{}:
		defer func() { <-s.sem }()
	case <-ctx.Done():
		http.Error(w, "client cancelled", http.StatusRequestTimeout)
		return ctx.Err()
	}

	// Enforce a transcode ceiling. Derived from the request context so a client
	// disconnect also cancels FFmpeg.
	ctx, cancel := context.WithTimeout(ctx, s.cfg.TranscodeTimeout)
	defer cancel()

	probe, err := probeVideo(ctx, srcPath)
	if err != nil {
		http.Error(w, "failed to probe video", http.StatusInternalServerError)
		log.Printf("[tape-streamer] probe %s: %v", filename, err)
		return err
	}

	// Determine which qualities to produce (skip those above source resolution).
	var applicable []quality
	for _, q := range qualities {
		if q.Width <= probe.Width && q.Height <= probe.Height {
			applicable = append(applicable, q)
		}
	}
	if len(applicable) == 0 {
		applicable = []quality{qualities[0]} // very low-res source
	}

	for _, q := range applicable {
		qDir := filepath.Join(s.cfg.HLSCacheDir, filename, q.Name)
		indexPath := filepath.Join(qDir, "index.m3u8")

		if _, err := os.Stat(indexPath); err == nil {
			now := time.Now()
			os.Chtimes(qDir, now, now)
			continue
		}

		if err := os.MkdirAll(qDir, 0o755); err != nil {
			http.Error(w, "cache dir error", http.StatusInternalServerError)
			log.Printf("[tape-streamer] mkdir %s: %v", qDir, err)
			return err
		}

		segPattern := filepath.Join(qDir, "seg-%d.ts")
		log.Printf("[tape-streamer] transcoding %s @ %s", filename, q.Name)

		cmd := exec.CommandContext(ctx, "ffmpeg",
			"-nostdin",
			"-i", srcPath,
			"-vf", fmt.Sprintf("scale=%d:%d", q.Width, q.Height),
			"-c:v", "libx264",
			"-b:v", q.VideoBitrate,
			"-c:a", "aac",
			"-b:a", q.AudioBitrate,
			"-f", "hls",
			"-hls_time", strconv.Itoa(s.cfg.SegmentDuration),
			"-hls_list_size", "0",
			"-hls_segment_filename", segPattern,
			indexPath,
		)

		stderr, err := cmd.CombinedOutput()
		if err != nil {
			// Clean the half-written dir so a retry starts fresh.
			os.RemoveAll(qDir)
			if ctx.Err() == context.DeadlineExceeded {
				http.Error(w, "transcoding timed out", http.StatusGatewayTimeout)
				log.Printf("[tape-streamer] ffmpeg %s %s timed out after %s", filename, q.Name, s.cfg.TranscodeTimeout)
			} else if ctx.Err() == context.Canceled {
				log.Printf("[tape-streamer] ffmpeg %s %s cancelled by client", filename, q.Name)
			} else {
				http.Error(w, "transcoding failed", http.StatusInternalServerError)
				log.Printf("[tape-streamer] ffmpeg %s %s failed: %v\n%s", filename, q.Name, err, string(stderr))
			}
			return err
		}
		log.Printf("[tape-streamer] done transcoding %s @ %s", filename, q.Name)
	}
	return nil
}

// writeMaster builds and writes the master playlist listing produced tiers.
func (s *server) writeMaster(w http.ResponseWriter, filename string) {
	var buf strings.Builder
	buf.WriteString("#EXTM3U\n")
	for _, q := range qualities {
		indexPath := filepath.Join(s.cfg.HLSCacheDir, filename, q.Name, "index.m3u8")
		if _, err := os.Stat(indexPath); err != nil {
			continue
		}
		buf.WriteString(fmt.Sprintf(
			"#EXT-X-STREAM-INF:BANDWIDTH=%d,RESOLUTION=%dx%d,NAME=\"%s\"\n",
			q.Bandwidth, q.Width, q.Height, q.Name,
		))
		buf.WriteString(fmt.Sprintf("%s/index.m3u8\n", q.Name))
	}

	w.Header().Set("Content-Type", "application/vnd.apple.mpegurl")
	w.Header().Set("Cache-Control", "no-cache")
	w.Write([]byte(buf.String()))
}

// ---------------------------------------------------------------------------
// GET /stream/{filename}/{quality}/index.m3u8
// ---------------------------------------------------------------------------

func (s *server) handleQualityPlaylist(w http.ResponseWriter, r *http.Request, filename, qual string) {
	s.addCORS(w, r)

	indexPath := filepath.Join(s.cfg.HLSCacheDir, filename, qual, "index.m3u8")
	if _, err := os.Stat(indexPath); os.IsNotExist(err) {
		http.Error(w, "playlist not found — request master.m3u8 first", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/vnd.apple.mpegurl")
	w.Header().Set("Cache-Control", "no-cache")
	http.ServeFile(w, r, indexPath)
}

// ---------------------------------------------------------------------------
// GET /stream/{filename}/{quality}/seg-{n}.ts
// ---------------------------------------------------------------------------

func (s *server) handleSegment(w http.ResponseWriter, r *http.Request, filename, qual, segFile string) {
	s.addCORS(w, r)

	segPath := filepath.Join(s.cfg.HLSCacheDir, filename, qual, segFile)
	if _, err := os.Stat(segPath); os.IsNotExist(err) {
		http.Error(w, "segment not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "video/MP2T")
	http.ServeFile(w, r, segPath)
}

// ---------------------------------------------------------------------------
// Router — parses /stream/{filename}/{...} paths manually (stdlib only)
// ---------------------------------------------------------------------------

func (s *server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Handle CORS preflight.
	if r.Method == http.MethodOptions {
		s.addCORS(w, r)
		w.WriteHeader(http.StatusNoContent)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/")

	switch {
	case path == "health":
		s.handleHealth(w, r)
		return

	case path == "videos":
		s.handleVideos(w, r)
		return

	case strings.HasPrefix(path, "stream/"):
		s.routeStream(w, r, strings.TrimPrefix(path, "stream/"))
		return

	default:
		http.NotFound(w, r)
	}
}

// routeStream dispatches /stream/... sub-paths.
// Expected shapes:
//
//	{filename}/master.m3u8
//	{filename}/{quality}/index.m3u8
//	{filename}/{quality}/seg-{n}.ts
func (s *server) routeStream(w http.ResponseWriter, r *http.Request, sub string) {
	parts := strings.SplitN(sub, "/", 3)

	if len(parts) < 2 {
		http.NotFound(w, r)
		return
	}

	filename := parts[0]

	// Validate EVERY path segment against a strict allowlist. This blocks
	// directory traversal (.., /, URL-encoded variants) and ffmpeg arg
	// injection (a leading '-') on the filename, quality, and segment names.
	if !isSafeSegment(filename) {
		http.Error(w, "invalid filename", http.StatusBadRequest)
		return
	}

	switch {
	// /stream/{filename}/master.m3u8
	case len(parts) == 2 && parts[1] == "master.m3u8":
		s.handleMaster(w, r, filename)

	// /stream/{filename}/{quality}/index.m3u8
	case len(parts) == 3 && strings.HasSuffix(parts[2], "index.m3u8"):
		qual := parts[1]
		if !isSafeSegment(qual) {
			http.Error(w, "invalid quality", http.StatusBadRequest)
			return
		}
		s.handleQualityPlaylist(w, r, filename, qual)

	// /stream/{filename}/{quality}/seg-{n}.ts
	case len(parts) == 3 && strings.HasPrefix(parts[2], "seg-") && strings.HasSuffix(parts[2], ".ts"):
		qual := parts[1]
		segFile := parts[2]
		if !isSafeSegment(qual) || !isSafeSegment(segFile) {
			http.Error(w, "invalid segment path", http.StatusBadRequest)
			return
		}
		s.handleSegment(w, r, filename, qual, segFile)

	default:
		http.NotFound(w, r)
	}
}

// ---------------------------------------------------------------------------
// Cache cleanup goroutine
// ---------------------------------------------------------------------------

func (s *server) startCacheCleanup(ctx context.Context) {
	ticker := time.NewTicker(1 * time.Hour)
	go func() {
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				s.cleanCache()
			case <-ctx.Done():
				return
			}
		}
	}()
}

func (s *server) cleanCache() {
	cutoff := time.Now().Add(-s.cfg.CacheMaxAge)

	entries, err := os.ReadDir(s.cfg.HLSCacheDir)
	if err != nil {
		log.Printf("[tape-streamer] cache cleanup ReadDir: %v", err)
		return
	}

	// Track which cache dirs survive, to prune orphaned lockMap entries.
	keep := make(map[string]bool)
	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		info, err := e.Info()
		if err != nil {
			continue
		}
		if info.ModTime().Before(cutoff) {
			dirPath := filepath.Join(s.cfg.HLSCacheDir, e.Name())
			log.Printf("[tape-streamer] cache cleanup: removing %s (age %s)", e.Name(), time.Since(info.ModTime()).Round(time.Minute))
			os.RemoveAll(dirPath)
		} else {
			keep[e.Name()] = true
		}
	}

	// Drop lock entries for files whose cache is gone (bounds map growth).
	s.locks.prune(keep)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

func main() {
	cfg := loadConfig()

	// Ensure cache directory exists.
	if err := os.MkdirAll(cfg.HLSCacheDir, 0o755); err != nil {
		log.Fatalf("[tape-streamer] cannot create HLS cache dir %s: %v", cfg.HLSCacheDir, err)
	}

	srv := newServer(cfg)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	srv.startCacheCleanup(ctx)

	httpServer := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: srv,
	}

	log.Printf("[tape-streamer] starting on :%s", cfg.Port)
	log.Printf("[tape-streamer] videos dir : %s", cfg.VideosDir)
	log.Printf("[tape-streamer] HLS cache  : %s", cfg.HLSCacheDir)
	log.Printf("[tape-streamer] segment dur: %ds", cfg.SegmentDuration)
	log.Printf("[tape-streamer] cache TTL  : %s", cfg.CacheMaxAge)
	log.Printf("[tape-streamer] max concur : %d", cfg.MaxConcurrent)
	log.Printf("[tape-streamer] transcode  : %s ceiling", cfg.TranscodeTimeout)
	log.Printf("[tape-streamer] CORS       : %s", cfg.CORSOrigins)

	// Serve until a shutdown signal arrives.
	go func() {
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[tape-streamer] server error: %v", err)
		}
	}()

	<-ctx.Done()
	log.Printf("[tape-streamer] shutdown signal received, draining…")

	// Give in-flight requests up to 30s to finish; context cancellation above
	// already signals running FFmpeg processes to terminate.
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := httpServer.Shutdown(shutdownCtx); err != nil {
		log.Printf("[tape-streamer] graceful shutdown failed: %v", err)
	}
	log.Printf("[tape-streamer] stopped")
}
