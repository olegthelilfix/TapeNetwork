# tape-streamer — HLS video-streaming service

A homegrown service for segmenting and serving video over the HLS protocol. It watches a folder of video files, **pre-segments them in the background ahead of time** into HLS segments via FFmpeg, caches the result, and serves it to clients over HTTP.

## What this is

The service solves one problem: take a regular video file (mp4, mkv, avi) and serve it to the browser as an adaptive HLS stream with multiple qualities.

**Model — pre-transcode, not on-request:**
1. On startup (and every `RESCAN_INTERVAL`) a scanner walks `VIDEOS_DIR`.
2. Every video without a ready cache is queued to a worker pool (`MAX_CONCURRENT`).
3. Workers segment the file into `.ts` segments at multiple qualities, generate `.m3u8`, and write a `.ready` marker.
4. FFmpeg **never runs on the request path** — HTTP only serves what's already prepared.

Preparation statuses: `pending` → `transcoding` → `ready` (or `failed`). While a video isn't `ready`, playlist requests get `202 Accepted` with `Retry-After`; on error — `503`.

After a restart, videos that are already ready (with a `.ready` marker) are not re-transcoded.

## API

| Method | Endpoint | Description |
|-------|----------|----------|
| `GET` | `/health` | Service health check. Returns `200 OK`. |
| `GET` | `/videos` | List of video files in `VIDEOS_DIR` with preparation status (`pending`/`transcoding`/`ready`/`failed`) and the list of ready qualities. |
| `GET` | `/status` | Full registry of preparation statuses (ops/debug). |
| `GET` | `/stream/{name}/master.m3u8` | Master playlist. `200` if ready; `202` if still preparing; `503` if preparation failed; `404` if the file doesn't exist. |
| `GET` | `/stream/{name}/{quality}/index.m3u8` | Segment playlist for a given quality (`360p`, `720p`, `1080p`). |
| `GET` | `/stream/{name}/{quality}/seg-{n}.ts` | A single `.ts` segment numbered `{n}`. |

## Environment variables

| Variable | Default | Description |
|------------|-------------|----------|
| `VIDEOS_DIR` | `/data/videos` | Path to the folder with source video files. |
| `HLS_CACHE_DIR` | `/data/hls-cache` | Path to the folder for storing segmented HLS output. |
| `PORT` | `8082` | Port the service listens on. |
| `SEGMENT_DURATION` | `6` | Duration of a single segment, in seconds. |
| `CORS_ORIGINS` | `*` | Allowed CORS origins (comma-separated). |
| `MAX_CONCURRENT` | `2` | Number of background workers = max concurrent FFmpeg processes. Limits CPU/memory load. |
| `X264_PRESET` | `veryfast` | libx264 preset (`ultrafast`…`veryslow`). Faster = less CPU and larger files. On a weak CPU, use `ultrafast`. |
| `TRANSCODE_TIMEOUT` | `2h` | Maximum time to prepare a single file. Once it elapses, FFmpeg is aborted and the video is marked `failed`. Accepts seconds or a duration string. |
| `RESCAN_INTERVAL` | `1m` | How often to rescan `VIDEOS_DIR` for new files and clean up orphaned cache entries. |

## Quality

The service generates a **single** quality variant:

| Quality | Resolution | Video bitrate | Audio bitrate |
|----------|-----------|---------------|---------------|
| `720p` | 1280×720 | 2500 kbps | 128 kbps |

If the source is below 720p, the tier is still used (FFmpeg does not upscale — it just encodes at the target bitrate). The list of qualities is defined by `qualities` in `main.go` — add entries there if you need adaptive bitrate.

Qualities that exceed the source file's resolution are skipped automatically.

## Transcoding performance

Software encoding with `libx264` is CPU-bound. Speed shows up in the logs as `speed=Nx` (real time = `1.0x`). On a weak/burstable VM (e.g. GCP `e2-medium` — 2 shared vCPUs), `speed` can drop to `0.07x`, and preparing a long video may not finish within the timeout.

Levers:
- **`X264_PRESET=ultrafast`** — the biggest speed win (several times over), at the cost of file size. Fine for an experimental setup.
- **Fewer tiers** — each rendition is encoded separately; 3 tiers = 3× the work. You can trim the quality list in `qualities` (in code).
- **`TRANSCODE_TIMEOUT`** — the work happens off the request path, so you can be generous with it (default `2h`).
- **A more powerful VM** — the only real fix for real-time encoding of multiple renditions; on `e2-medium`, multi-threaded H.264 is inherently slow. There's no hardware acceleration (NVENC/QSV) on `e2`.

## Running locally

Requirements: Go 1.23+, FFmpeg on `$PATH`.

```bash
export VIDEOS_DIR=./my-videos
go run .
```

The service will start on `http://localhost:8082`.

## Docker

```bash
docker build -t tape-streamer .
docker run -p 8082:8082 -v /path/to/videos:/data/videos tape-streamer
```

FFmpeg is already included in the image. The cache is stored inside the container at `/data/hls-cache` — mount a volume if you want it to persist across restarts:

```bash
docker run -p 8082:8082 \
  -v /path/to/videos:/data/videos \
  -v /path/to/cache:/data/hls-cache \
  tape-streamer
```

## Integrating with the site

Example with [hls.js](https://github.com/video-dev/hls.js):

```html
<video id="player" controls></video>
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<script>
  const video = document.getElementById('player');
  const src = 'http://localhost:8082/stream/video.mp4/master.m3u8';

  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(src);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari — native HLS support
    video.src = src;
  }
</script>
```

## Architecture

Preparation and serving are separated: FFmpeg lives in the background, HTTP only serves what's ready.

```
        BACKGROUND (on startup + every RESCAN_INTERVAL)       HTTP (request path)
  ┌───────────────┐                                    ┌──────────────────────┐
  │ Scanner       │  finds new/                         │ GET .../master.m3u8  │
  │ walks         │  not-yet-ready videos                └──────────┬───────────┘
  │ VIDEOS_DIR    │────────────┐                                  │
  └───────────────┘            ▼                            video status?
                        ┌──────────────┐                 ┌────────┼─────────┐
                        │ Queue        │              ready   pending/     failed
                        └──────┬───────┘                 │   transcoding      │
                               ▼                          ▼        ▼           ▼
                   ┌────────────────────────┐        serve     202 "still    503
                   │ Worker pool             │        playlist  preparing,   "error"
                   │ (MAX_CONCURRENT × FFmpeg)│           from cache  retry"
                   │ → .ts + .m3u8 + .ready  │
                   └────────────────────────┘
```

The `.ready` marker (JSON with the list of ready qualities) is written atomically after all tiers finish preparing successfully. On restart, the service adopts videos with the marker as `ready` and doesn't re-transcode them; a half-segmented cache left over from an interrupted attempt is cleaned up and queued again.

## Cache cleanup

On every rescan (`RESCAN_INTERVAL`), the service removes the cache for videos **whose source has disappeared** from `VIDEOS_DIR` (orphaned directories). Ready videos with an existing source are kept indefinitely — in the pre-transcode model, that's the whole point.

To force re-preparation, delete the relevant folder in `HLS_CACHE_DIR` (or the whole cache) and restart the service / wait for the next rescan.
