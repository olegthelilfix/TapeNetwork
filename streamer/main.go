// tape-streamer — Go HTTP video streaming service (pre-transcode model)
//
// A background worker prepares HLS renditions AHEAD of client requests. On
// startup (and on a rescan interval) the scanner walks VIDEOS_DIR, and any
// video without a finished HLS cache is queued to a bounded worker pool that
// transcodes it into multiple quality tiers (360p/720p/1080p, skipping tiers
// above the source resolution). FFmpeg NEVER runs on the request path: HTTP
// handlers only serve what is already prepared, and answer "not ready" for
// videos still pending/transcoding.
//
// Cache layout:
//   HLS_CACHE_DIR/<file>/<quality>/index.m3u8 + seg-*.ts
//   HLS_CACHE_DIR/<file>/.ready          — completion marker (tiers list, JSON)
//
// Environment variables:
//   VIDEOS_DIR          – source video directory              (default /data/videos)
//   HLS_CACHE_DIR       – HLS segment cache root               (default /data/hls-cache)
//   PORT                – HTTP listen port                     (default 8082)
//   SEGMENT_DURATION    – seconds per HLS segment              (default 6)
//   CORS_ORIGINS        – comma-separated allowed origins      (default *)
//   MAX_CONCURRENT      – parallel FFmpeg transcodes           (default 2)
//   TRANSCODE_TIMEOUT   – per-file transcode ceiling, duration (default 30m)
//   RESCAN_INTERVAL     – how often to rescan VIDEOS_DIR        (default 1m)

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
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
	CORSOrigins      string
	MaxConcurrent    int
	TranscodeTimeout time.Duration
	RescanInterval   time.Duration
	X264Preset       string
}

func loadConfig() config {
	return config{
		VideosDir:        envOrDefault("VIDEOS_DIR", "/data/videos"),
		HLSCacheDir:      envOrDefault("HLS_CACHE_DIR", "/data/hls-cache"),
		Port:             envOrDefault("PORT", "8082"),
		SegmentDuration:  envOrDefaultInt("SEGMENT_DURATION", 6),
		CORSOrigins:      envOrDefault("CORS_ORIGINS", "*"),
		MaxConcurrent:    envOrDefaultInt("MAX_CONCURRENT", 2),
		TranscodeTimeout: envOrDefaultDuration("TRANSCODE_TIMEOUT", 2*time.Hour),
		RescanInterval:   envOrDefaultDuration("RESCAN_INTERVAL", time.Minute),
		X264Preset:       envOrDefault("X264_PRESET", "veryfast"),
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

// envOrDefaultDuration accepts either a bare integer (seconds) or a Go duration
// string like "30m". Falls back to def with a warning on an unparseable value.
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

var safeSegment = regexp.MustCompile(`^[A-Za-z0-9][A-Za-z0-9._-]*$`)

func isSafeSegment(s string) bool {
	return s != "" && !strings.Contains(s, "..") && safeSegment.MatchString(s)
}

var videoExts = map[string]bool{
	".mp4": true, ".mkv": true, ".avi": true, ".mov": true,
	".webm": true, ".flv": true, ".wmv": true, ".ts": true, ".m4v": true,
}

// ---------------------------------------------------------------------------
// Quality tiers
// ---------------------------------------------------------------------------

type quality struct {
	Name         string
	Width        int
	Height       int
	VideoBitrate string
	AudioBitrate string
	Bandwidth    int
}

var qualities = []quality{
	{Name: "720p", Width: 1280, Height: 720, VideoBitrate: "2500k", AudioBitrate: "128k", Bandwidth: 2628000},
}

// ---------------------------------------------------------------------------
// Video probe (ffprobe)
// ---------------------------------------------------------------------------

type probeResult struct {
	Width  int
	Height int
}

func probeVideo(ctx context.Context, path string) (*probeResult, error) {
	cmd := exec.CommandContext(ctx, "ffprobe",
		"-v", "error",
		"-select_streams", "v:0",
		"-show_entries", "stream=width,height",
		"-of", "json",
		path,
	)
	out, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("ffprobe failed: %w", err)
	}
	var data struct {
		Streams []struct {
			Width  int `json:"width"`
			Height int `json:"height"`
		} `json:"streams"`
	}
	if err := json.Unmarshal(out, &data); err != nil {
		return nil, fmt.Errorf("ffprobe JSON parse: %w", err)
	}
	if len(data.Streams) == 0 {
		return nil, fmt.Errorf("no video stream found in %s", path)
	}
	return &probeResult{Width: data.Streams[0].Width, Height: data.Streams[0].Height}, nil
}

// ---------------------------------------------------------------------------
// Preparation registry — status of each video's HLS renditions
// ---------------------------------------------------------------------------

type status string

const (
	statusPending     status = "pending"     // discovered, queued, not started
	statusTranscoding status = "transcoding" // FFmpeg running
	statusReady       status = "ready"       // renditions complete on disk
	statusFailed      status = "failed"      // transcode errored
)

type videoState struct {
	Status    status    `json:"status"`
	Tiers     []string  `json:"tiers,omitempty"` // quality names produced
	Error     string    `json:"error,omitempty"`
	UpdatedAt time.Time `json:"updated_at"`
}

// readyMarker is what the .ready file holds — the tiers actually produced.
type readyMarker struct {
	Tiers     []string  `json:"tiers"`
	Completed time.Time `json:"completed"`
}

type registry struct {
	mu sync.RWMutex
	m  map[string]*videoState
}

func newRegistry() *registry { return &registry{m: make(map[string]*videoState)} }

func (r *registry) get(name string) (videoState, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	st, ok := r.m[name]
	if !ok {
		return videoState{}, false
	}
	return *st, true
}

func (r *registry) set(name string, st status, tiers []string, errMsg string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.m[name] = &videoState{Status: st, Tiers: tiers, Error: errMsg, UpdatedAt: time.Now()}
}

func (r *registry) snapshot() map[string]videoState {
	r.mu.RLock()
	defer r.mu.RUnlock()
	out := make(map[string]videoState, len(r.m))
	for k, v := range r.m {
		out[k] = *v
	}
	return out
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

type server struct {
	cfg   config
	reg   *registry
	queue chan string
}

func newServer(cfg config) *server {
	if cfg.MaxConcurrent < 1 {
		cfg.MaxConcurrent = 1
	}
	return &server{
		cfg:   cfg,
		reg:   newRegistry(),
		queue: make(chan string, 1024),
	}
}

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
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Range, Content-Type")
}

// ---------------------------------------------------------------------------
// Background preparation: scanner + worker pool
// ---------------------------------------------------------------------------

// startWorkers launches MaxConcurrent workers draining the queue.
func (s *server) startWorkers(ctx context.Context, wg *sync.WaitGroup) {
	for i := 0; i < s.cfg.MaxConcurrent; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			for {
				select {
				case <-ctx.Done():
					return
				case name, ok := <-s.queue:
					if !ok {
						return
					}
					s.prepare(ctx, name)
				}
			}
		}(i)
	}
}

// startScanner scans VIDEOS_DIR on startup and every RescanInterval, enqueuing
// any video that is not already ready/queued/in-flight.
func (s *server) startScanner(ctx context.Context, wg *sync.WaitGroup) {
	wg.Add(1)
	go func() {
		defer wg.Done()
		s.scan()
		ticker := time.NewTicker(s.cfg.RescanInterval)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				s.scan()
				s.cleanupOrphans()
			}
		}
	}()
}

// scan lists source videos and enqueues those needing preparation.
func (s *server) scan() {
	entries, err := os.ReadDir(s.cfg.VideosDir)
	if err != nil {
		log.Printf("[tape-streamer] scan ReadDir %s: %v", s.cfg.VideosDir, err)
		return
	}
	for _, e := range entries {
		if e.IsDir() || !videoExts[strings.ToLower(filepath.Ext(e.Name()))] {
			continue
		}
		name := e.Name()
		if !isSafeSegment(name) {
			continue // names that cannot be addressed via URL are skipped
		}

		// Already known? Only (re)enqueue if we've never seen it.
		if st, ok := s.reg.get(name); ok {
			_ = st
			continue
		}

		// If a completed cache already exists on disk (e.g. after restart),
		// adopt it as ready without re-transcoding.
		if tiers, ok := s.readMarker(name); ok {
			s.reg.set(name, statusReady, tiers, "")
			continue
		}

		// New / unprepared → mark pending and enqueue.
		s.reg.set(name, statusPending, nil, "")
		select {
		case s.queue <- name:
			log.Printf("[tape-streamer] queued %s for preparation", name)
		default:
			log.Printf("[tape-streamer] queue full, will retry %s next scan", name)
			// Roll back so the next scan re-enqueues it.
			s.reg.mu.Lock()
			delete(s.reg.m, name)
			s.reg.mu.Unlock()
		}
	}
}

// readMarker returns the produced tiers if the video has a completed cache.
func (s *server) readMarker(name string) ([]string, bool) {
	markerPath := filepath.Join(s.cfg.HLSCacheDir, name, ".ready")
	b, err := os.ReadFile(markerPath)
	if err != nil {
		return nil, false
	}
	var m readyMarker
	if err := json.Unmarshal(b, &m); err != nil || len(m.Tiers) == 0 {
		return nil, false
	}
	return m.Tiers, true
}

// prepare transcodes one video into all applicable tiers, then writes the
// .ready marker. Bounded by the worker pool; honors TranscodeTimeout.
func (s *server) prepare(ctx context.Context, name string) {
	s.reg.set(name, statusTranscoding, nil, "")
	srcPath := filepath.Join(s.cfg.VideosDir, name)

	tctx, cancel := context.WithTimeout(ctx, s.cfg.TranscodeTimeout)
	defer cancel()

	probe, err := probeVideo(tctx, srcPath)
	if err != nil {
		s.fail(name, fmt.Sprintf("probe: %v", err))
		return
	}

	var applicable []quality
	for _, q := range qualities {
		if q.Width <= probe.Width && q.Height <= probe.Height {
			applicable = append(applicable, q)
		}
	}
	if len(applicable) == 0 {
		applicable = []quality{qualities[0]} // very low-res source
	}

	videoDir := filepath.Join(s.cfg.HLSCacheDir, name)
	// Clear any partial cache from a prior aborted attempt.
	os.RemoveAll(videoDir)

	var produced []string
	for _, q := range applicable {
		if err := s.transcodeTier(tctx, name, srcPath, q); err != nil {
			os.RemoveAll(videoDir) // don't leave a half-done cache
			if tctx.Err() == context.DeadlineExceeded {
				s.fail(name, fmt.Sprintf("timed out after %s on %s", s.cfg.TranscodeTimeout, q.Name))
			} else if ctx.Err() != nil {
				// server shutting down — leave as transcoding, next start retries
				log.Printf("[tape-streamer] %s @ %s cancelled (shutdown)", name, q.Name)
			} else {
				s.fail(name, fmt.Sprintf("ffmpeg %s: %v", q.Name, err))
			}
			return
		}
		produced = append(produced, q.Name)
	}

	// Write completion marker atomically.
	marker := readyMarker{Tiers: produced, Completed: time.Now()}
	if b, err := json.Marshal(marker); err == nil {
		tmp := filepath.Join(videoDir, ".ready.tmp")
		if err := os.WriteFile(tmp, b, 0o644); err == nil {
			os.Rename(tmp, filepath.Join(videoDir, ".ready"))
		}
	}

	s.reg.set(name, statusReady, produced, "")
	log.Printf("[tape-streamer] ready: %s (%s)", name, strings.Join(produced, ", "))
}

func (s *server) transcodeTier(ctx context.Context, name, srcPath string, q quality) error {
	qDir := filepath.Join(s.cfg.HLSCacheDir, name, q.Name)
	if err := os.MkdirAll(qDir, 0o755); err != nil {
		return fmt.Errorf("mkdir: %w", err)
	}
	segPattern := filepath.Join(qDir, "seg-%d.ts")
	indexPath := filepath.Join(qDir, "index.m3u8")
	log.Printf("[tape-streamer] transcoding %s @ %s", name, q.Name)

	cmd := exec.CommandContext(ctx, "ffmpeg",
		"-nostdin",
		"-i", srcPath,
		"-vf", fmt.Sprintf("scale=%d:%d", q.Width, q.Height),
		"-c:v", "libx264",
		"-preset", s.cfg.X264Preset,
		"-threads", "0",
		"-b:v", q.VideoBitrate,
		"-c:a", "aac",
		"-b:a", q.AudioBitrate,
		"-f", "hls",
		"-hls_time", strconv.Itoa(s.cfg.SegmentDuration),
		"-hls_list_size", "0",
		"-hls_segment_filename", segPattern,
		indexPath,
	)
	if out, err := cmd.CombinedOutput(); err != nil {
		log.Printf("[tape-streamer] ffmpeg %s %s failed: %v\n%s", name, q.Name, err, string(out))
		return err
	}
	return nil
}

func (s *server) fail(name, msg string) {
	s.reg.set(name, statusFailed, nil, msg)
	log.Printf("[tape-streamer] FAILED %s: %s", name, msg)
}

// cleanupOrphans removes cache dirs whose source video no longer exists.
func (s *server) cleanupOrphans() {
	entries, err := os.ReadDir(s.cfg.HLSCacheDir)
	if err != nil {
		return
	}
	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		name := e.Name()
		if _, err := os.Stat(filepath.Join(s.cfg.VideosDir, name)); os.IsNotExist(err) {
			log.Printf("[tape-streamer] cleanup: source gone, removing cache for %s", name)
			os.RemoveAll(filepath.Join(s.cfg.HLSCacheDir, name))
			s.reg.mu.Lock()
			delete(s.reg.m, name)
			s.reg.mu.Unlock()
		}
	}
}

// ---------------------------------------------------------------------------
// HTTP handlers (serve-only — never transcode)
// ---------------------------------------------------------------------------

func (s *server) handleHealth(w http.ResponseWriter, r *http.Request) {
	s.addCORS(w, r)
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"status":"ok"}`))
}

type videoInfo struct {
	Name     string    `json:"name"`
	Size     int64     `json:"size"`
	Modified time.Time `json:"modified"`
	Status   status    `json:"status"`
	Tiers    []string  `json:"tiers,omitempty"`
	Error    string    `json:"error,omitempty"`
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
		if e.IsDir() || !videoExts[strings.ToLower(filepath.Ext(e.Name()))] {
			continue
		}
		info, err := e.Info()
		if err != nil {
			continue
		}
		vi := videoInfo{Name: e.Name(), Size: info.Size(), Modified: info.ModTime(), Status: "unknown"}
		if st, ok := s.reg.get(e.Name()); ok {
			vi.Status = st.Status
			vi.Tiers = st.Tiers
			vi.Error = st.Error
		}
		videos = append(videos, vi)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(videos)
}

// handleUpload accepts a multipart video upload (field "file"), stores it under
// VIDEOS_DIR, and enqueues it for preparation. Responds 202 with the stored name
// and status so the caller can then poll /videos or the master playlist.
func (s *server) handleUpload(w http.ResponseWriter, r *http.Request) {
	s.addCORS(w, r)

	// Stream large files: overflow beyond 32 MiB is buffered to temp files on disk.
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		http.Error(w, "invalid multipart form", http.StatusBadRequest)
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "missing file field", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Sanitise the client-provided name into a URL-addressable segment.
	name := sanitizeUploadName(header.Filename)
	if name == "" || !isSafeSegment(name) {
		http.Error(w, "unsupported or unsafe filename", http.StatusBadRequest)
		return
	}
	if !videoExts[strings.ToLower(filepath.Ext(name))] {
		http.Error(w, "unsupported video extension", http.StatusBadRequest)
		return
	}

	dest := filepath.Join(s.cfg.VideosDir, name)
	if _, err := os.Stat(dest); err == nil {
		http.Error(w, "a video with this name already exists", http.StatusConflict)
		return
	}

	// Write to a temp file first, then atomically rename so the scanner never sees
	// a half-written file.
	tmp, err := os.CreateTemp(s.cfg.VideosDir, ".upload-*")
	if err != nil {
		http.Error(w, "cannot create temp file", http.StatusInternalServerError)
		log.Printf("[tape-streamer] upload CreateTemp: %v", err)
		return
	}
	tmpName := tmp.Name()
	if _, err := io.Copy(tmp, file); err != nil {
		tmp.Close()
		os.Remove(tmpName)
		http.Error(w, "failed to store upload", http.StatusInternalServerError)
		log.Printf("[tape-streamer] upload copy: %v", err)
		return
	}
	tmp.Close()
	if err := os.Rename(tmpName, dest); err != nil {
		os.Remove(tmpName)
		http.Error(w, "failed to store upload", http.StatusInternalServerError)
		log.Printf("[tape-streamer] upload rename: %v", err)
		return
	}
	log.Printf("[tape-streamer] uploaded %s (%d bytes), enqueuing", name, header.Size)

	// Pick it up now instead of waiting for the next rescan.
	s.scan()

	st, _ := s.reg.get(name)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(videoInfo{Name: name, Size: header.Size, Status: st.Status, Tiers: st.Tiers})
}

// sanitizeUploadName reduces a client filename to a safe, URL-addressable segment:
// base name only, spaces/odd chars → underscore, collapsed, lower-cased extension kept.
func sanitizeUploadName(filename string) string {
	name := filepath.Base(strings.TrimSpace(filename))
	name = strings.ReplaceAll(name, " ", "_")
	// Drop anything outside the safe set.
	name = regexp.MustCompile(`[^A-Za-z0-9._-]`).ReplaceAllString(name, "")
	name = strings.TrimLeft(name, ".-")
	return name
}

// handleStatus returns the full preparation registry (ops/debug view).
func (s *server) handleStatus(w http.ResponseWriter, r *http.Request) {
	s.addCORS(w, r)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(s.reg.snapshot())
}

// writeNotReady emits a 202/503 depending on preparation status.
func (s *server) writeNotReady(w http.ResponseWriter, name string, st videoState) {
	w.Header().Set("Content-Type", "application/json")
	switch st.Status {
	case statusFailed:
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]string{"status": "failed", "error": st.Error})
	default: // pending / transcoding
		w.Header().Set("Retry-After", "15")
		w.WriteHeader(http.StatusAccepted)
		json.NewEncoder(w).Encode(map[string]string{"status": string(st.Status), "message": "video is being prepared, retry shortly"})
	}
}

func (s *server) handleMaster(w http.ResponseWriter, r *http.Request, name string) {
	s.addCORS(w, r)

	st, known := s.reg.get(name)
	if !known {
		// Not in registry — is the source even there?
		if _, err := os.Stat(filepath.Join(s.cfg.VideosDir, name)); os.IsNotExist(err) {
			http.Error(w, "video not found", http.StatusNotFound)
			return
		}
		// Source exists but not scanned yet — treat as pending.
		s.writeNotReady(w, name, videoState{Status: statusPending})
		return
	}
	if st.Status != statusReady {
		s.writeNotReady(w, name, st)
		return
	}

	// Ready — build the master playlist from tiers on disk.
	var buf strings.Builder
	buf.WriteString("#EXTM3U\n")
	for _, q := range qualities {
		if _, err := os.Stat(filepath.Join(s.cfg.HLSCacheDir, name, q.Name, "index.m3u8")); err != nil {
			continue
		}
		buf.WriteString(fmt.Sprintf(
			"#EXT-X-STREAM-INF:BANDWIDTH=%d,RESOLUTION=%dx%d,NAME=\"%s\"\n",
			q.Bandwidth, q.Width, q.Height, q.Name))
		buf.WriteString(fmt.Sprintf("%s/index.m3u8\n", q.Name))
	}
	w.Header().Set("Content-Type", "application/vnd.apple.mpegurl")
	w.Header().Set("Cache-Control", "no-cache")
	w.Write([]byte(buf.String()))
}

func (s *server) handleQualityPlaylist(w http.ResponseWriter, r *http.Request, name, qual string) {
	s.addCORS(w, r)
	indexPath := filepath.Join(s.cfg.HLSCacheDir, name, qual, "index.m3u8")
	if _, err := os.Stat(indexPath); os.IsNotExist(err) {
		http.Error(w, "playlist not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/vnd.apple.mpegurl")
	w.Header().Set("Cache-Control", "no-cache")
	http.ServeFile(w, r, indexPath)
}

func (s *server) handleSegment(w http.ResponseWriter, r *http.Request, name, qual, segFile string) {
	s.addCORS(w, r)
	segPath := filepath.Join(s.cfg.HLSCacheDir, name, qual, segFile)
	if _, err := os.Stat(segPath); os.IsNotExist(err) {
		http.Error(w, "segment not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "video/MP2T")
	http.ServeFile(w, r, segPath)
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

func (s *server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		s.addCORS(w, r)
		w.WriteHeader(http.StatusNoContent)
		return
	}
	path := strings.TrimPrefix(r.URL.Path, "/")
	switch {
	case path == "health":
		s.handleHealth(w, r)
	case path == "videos":
		if r.Method == http.MethodPost {
			s.handleUpload(w, r)
		} else {
			s.handleVideos(w, r)
		}
	case path == "status":
		s.handleStatus(w, r)
	case strings.HasPrefix(path, "stream/"):
		s.routeStream(w, r, strings.TrimPrefix(path, "stream/"))
	default:
		http.NotFound(w, r)
	}
}

func (s *server) routeStream(w http.ResponseWriter, r *http.Request, sub string) {
	parts := strings.SplitN(sub, "/", 3)
	if len(parts) < 2 {
		http.NotFound(w, r)
		return
	}
	name := parts[0]
	if !isSafeSegment(name) {
		http.Error(w, "invalid filename", http.StatusBadRequest)
		return
	}
	switch {
	case len(parts) == 2 && parts[1] == "master.m3u8":
		s.handleMaster(w, r, name)
	case len(parts) == 3 && strings.HasSuffix(parts[2], "index.m3u8"):
		if !isSafeSegment(parts[1]) {
			http.Error(w, "invalid quality", http.StatusBadRequest)
			return
		}
		s.handleQualityPlaylist(w, r, name, parts[1])
	case len(parts) == 3 && strings.HasPrefix(parts[2], "seg-") && strings.HasSuffix(parts[2], ".ts"):
		if !isSafeSegment(parts[1]) || !isSafeSegment(parts[2]) {
			http.Error(w, "invalid segment path", http.StatusBadRequest)
			return
		}
		s.handleSegment(w, r, name, parts[1], parts[2])
	default:
		http.NotFound(w, r)
	}
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

func main() {
	cfg := loadConfig()
	if err := os.MkdirAll(cfg.HLSCacheDir, 0o755); err != nil {
		log.Fatalf("[tape-streamer] cannot create HLS cache dir %s: %v", cfg.HLSCacheDir, err)
	}

	srv := newServer(cfg)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	var wg sync.WaitGroup
	srv.startWorkers(ctx, &wg)
	srv.startScanner(ctx, &wg)

	httpServer := &http.Server{Addr: ":" + cfg.Port, Handler: srv}

	log.Printf("[tape-streamer] starting on :%s", cfg.Port)
	log.Printf("[tape-streamer] videos dir : %s", cfg.VideosDir)
	log.Printf("[tape-streamer] HLS cache  : %s", cfg.HLSCacheDir)
	log.Printf("[tape-streamer] segment dur: %ds", cfg.SegmentDuration)
	log.Printf("[tape-streamer] workers    : %d", cfg.MaxConcurrent)
	log.Printf("[tape-streamer] x264 preset: %s", cfg.X264Preset)
	log.Printf("[tape-streamer] transcode  : %s ceiling", cfg.TranscodeTimeout)
	log.Printf("[tape-streamer] rescan     : every %s", cfg.RescanInterval)
	log.Printf("[tape-streamer] CORS       : %s", cfg.CORSOrigins)

	go func() {
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[tape-streamer] server error: %v", err)
		}
	}()

	<-ctx.Done()
	log.Printf("[tape-streamer] shutdown signal received, draining…")
	stop() // stop receiving signals; ctx cancellation propagates to workers/ffmpeg

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := httpServer.Shutdown(shutdownCtx); err != nil {
		log.Printf("[tape-streamer] graceful shutdown failed: %v", err)
	}
	wg.Wait() // let workers observe cancellation and exit
	log.Printf("[tape-streamer] stopped")
}
