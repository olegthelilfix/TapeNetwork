const DEFAULT_STREAMER_URL = "http://localhost:8082";

/**
 * Base URL of the `tape-streamer` HLS service, as reachable from the browser.
 * Configured via `NEXT_PUBLIC_STREAMER_URL`; falls back to the local compose port.
 */
export const streamerBaseUrl = (): string =>
  (process.env.NEXT_PUBLIC_STREAMER_URL ?? DEFAULT_STREAMER_URL).replace(/\/+$/, "");

const isAbsoluteUrl = (value: string): boolean => /^https?:\/\//i.test(value);

/**
 * Resolve a player's `videoUrl` into a playable HLS master-playlist URL.
 *
 * - `null` / empty  → `null` (no stream available; caller shows a fallback).
 * - an absolute URL → used verbatim (already a full `.m3u8`/`.mp4`).
 * - anything else    → treated as a stream *name* on the streamer service and
 *   expanded to `${STREAMER}/stream/{name}/master.m3u8`.
 */
export const resolveStreamUrl = (videoUrl: string | null | undefined): string | null => {
  const value = videoUrl?.trim();
  if (!value) return null;
  if (isAbsoluteUrl(value)) return value;
  return `${streamerBaseUrl()}/stream/${encodeURIComponent(value)}/master.m3u8`;
};
