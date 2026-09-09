"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ChangeEvent, FC } from "react";

import styles from "./VideoPlayer.module.css";

export type VideoPlayerProps = {
  /**
   * Resolved HLS master-playlist URL (`.m3u8`) or a progressive source.
   * `null` means no stream is available — the player shows a poster and, when
   * the viewer tries to play, a clear "can't play right now" message.
   */
  readonly src: string | null;
  /** Poster image shown before playback and in the no-stream / error state. */
  readonly poster?: string | null;
  readonly isLive?: boolean;
  readonly title?: string;
};

type Status = "idle" | "loading" | "ready" | "error";

const isHlsSource = (src: string): boolean => /\.m3u8(\?|#|$)/i.test(src);

const canPlayNativeHls = (video: HTMLVideoElement): boolean =>
  video.canPlayType("application/vnd.apple.mpegurl") !== "";

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

/**
 * Real HLS video player. Uses native HLS where the browser supports it
 * (Safari / iOS), otherwise lazy-loads `hls.js`. SSR-safe: all setup runs in an
 * effect on the client. Custom, keyboard-accessible controls (play/pause, mute,
 * seek, fullscreen) so playback is testable and themed to the site.
 *
 * When no stream is available (`src === null`) it renders a poster with a play
 * button; pressing it surfaces a "can't play right now" message instead of a
 * broken player. A fatal load error surfaces the same message.
 */
export const VideoPlayer: FC<VideoPlayerProps> = ({ src, poster, isLive = false, title }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasStream = Boolean(src);

  const [status, setStatus] = useState<Status>(hasStream ? "loading" : "idle");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Attach the source (native HLS / hls.js / progressive) once per src.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setStatus("loading");
    let disposed = false;
    let cleanup = () => {};

    const markReady = () => {
      if (!disposed) setStatus("ready");
    };
    const markError = () => {
      if (!disposed) setStatus("error");
    };

    if (!isHlsSource(src) || canPlayNativeHls(video)) {
      video.src = src;
      video.addEventListener("loadedmetadata", markReady);
      video.addEventListener("error", markError);
      cleanup = () => {
        video.removeEventListener("loadedmetadata", markReady);
        video.removeEventListener("error", markError);
        video.removeAttribute("src");
        video.load();
      };
    } else {
      import("hls.js")
        .then(({ default: Hls }) => {
          if (disposed) return;
          if (!Hls.isSupported()) {
            markError();
            return;
          }
          const hls = new Hls({ enableWorker: true, lowLatencyMode: isLive });
          let recovered = false;
          hls.on(Hls.Events.MANIFEST_PARSED, markReady);
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (!data.fatal) return;
            // Try to recover transient network / media errors before giving up.
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR && !recovered) {
              recovered = true;
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !recovered) {
              recovered = true;
              hls.recoverMediaError();
            } else {
              markError();
            }
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          cleanup = () => hls.destroy();
        })
        .catch(markError);
    }

    return () => {
      disposed = true;
      cleanup();
    };
  }, [src, isLive]);

  // Mirror media element state into React so controls reflect reality.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setCurrentTime(video.currentTime);
    const onDuration = () => setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    const onVolume = () => setIsMuted(video.muted);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("durationchange", onDuration);
    video.addEventListener("volumechange", onVolume);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("durationchange", onDuration);
      video.removeEventListener("volumechange", onVolume);
    };
  }, [src]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => setStatus("error"));
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  }, []);

  const onSeek = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Number(event.target.value);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    } else {
      void wrap.requestFullscreen?.().catch(() => {});
    }
  }, []);

  // No stream: pressing play surfaces the "unavailable" message.
  const requestUnavailable = useCallback(() => setStatus("error"), []);

  return (
    <div ref={wrapRef} className={styles.wrap} data-status={status} data-testid="video-player">
      {hasStream ? (
        <>
          <video
            ref={videoRef}
            className={styles.video}
            playsInline
            preload="metadata"
            poster={poster ?? undefined}
            onClick={togglePlay}
            data-testid="video-element"
            aria-label={title ? `Video player: ${title}` : "Video player"}
          />

          {status !== "error" && (
            <div className={styles.controls} data-testid="player-controls">
              <button
                type="button"
                className={styles.ctrlBtn}
                onClick={togglePlay}
                data-testid="btn-playpause"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? "❚❚" : "▶"}
              </button>
              <button
                type="button"
                className={styles.ctrlBtn}
                onClick={toggleMute}
                data-testid="btn-mute"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? "🔇" : "🔊"}
              </button>
              <input
                type="range"
                className={styles.seek}
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(currentTime, duration || 0)}
                onChange={onSeek}
                data-testid="seek"
                aria-label="Seek"
                disabled={isLive || duration === 0}
              />
              <span className={styles.time} data-testid="time-label">
                {isLive ? "● LIVE" : `${formatTime(currentTime)} / ${formatTime(duration)}`}
              </span>
              <button
                type="button"
                className={styles.ctrlBtn}
                onClick={toggleFullscreen}
                data-testid="btn-fullscreen"
                aria-label="Fullscreen"
              >
                ⛶
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {poster && (
            // eslint-disable-next-line @next/next/no-img-element -- fills the poster frame; not part of LCP-critical content
            <img className={styles.poster} src={poster} alt="" />
          )}
          <button
            type="button"
            className={styles.bigPlay}
            onClick={requestUnavailable}
            data-testid="play-button"
            aria-label="Play"
          >
            ▶
          </button>
        </>
      )}

      {status === "loading" && (
        <div className={styles.overlay} role="status" aria-live="polite">
          <span className={styles.spinner} aria-hidden />
          <span className={styles.overlayText}>Loading stream…</span>
        </div>
      )}

      {status === "error" && (
        <div className={styles.overlay} role="alert" data-testid="player-error">
          <span className={styles.overlayText}>
            This video can’t be played right now. Please check back shortly.
          </span>
        </div>
      )}
    </div>
  );
};
