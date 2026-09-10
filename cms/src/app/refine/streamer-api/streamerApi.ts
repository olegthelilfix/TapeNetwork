import type { ListVideos, StreamerVideo, UploadVideo } from "@/ui/StreamVideoField";

import { streamerUrl } from "../apiConfig";
import { apiClient } from "../data-provider";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toVideo = (value: unknown): StreamerVideo | null => {
  if (!isRecord(value) || typeof value.name !== "string") return null;
  const status = typeof value.status === "string" ? value.status : "unknown";
  return {
    name: value.name,
    status: status as StreamerVideo["status"],
    tiers: Array.isArray(value.tiers) ? (value.tiers as string[]) : undefined,
    size: typeof value.size === "number" ? value.size : undefined,
    error: typeof value.error === "string" ? value.error : undefined,
  };
};

/** List the source videos the streamer knows about (public read-only GET /videos). */
export const listVideos: ListVideos = async () => {
  const res = await fetch(`${streamerUrl}/videos`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Streamer /videos failed: ${res.status}`);
  const body: unknown = await res.json();
  if (!Array.isArray(body)) return [];
  return body.map(toVideo).filter((v): v is StreamerVideo => v !== null);
};

/**
 * Upload a new source video through the backend admin API (`POST /videos/stream/upload`),
 * which authenticates the request with the editor/admin JWT and proxies it to the streamer
 * on the internal network. The streamer's own upload endpoint is not publicly reachable, so
 * this is the only write path. The returned video starts as `pending` while HLS prepares.
 */
export const uploadVideo: UploadVideo = async (file) => {
  const form = new FormData();
  form.append("file", file);
  try {
    // No explicit Content-Type: let the browser set multipart/form-data with its boundary.
    const res = await apiClient.post<unknown>("/videos/stream/upload", form);
    const video = toVideo(res.data);
    if (!video) throw new Error("Unexpected upload response from the streamer");
    return video;
  } catch (error) {
    // Surface the streamer's pass-through message (e.g. "unsupported video extension",
    // "a video with this name already exists") when the backend forwarded its error body.
    const data = isRecord(error) && isRecord(error.response) ? error.response.data : undefined;
    const message =
      typeof data === "string" && data.length > 0
        ? data
        : error instanceof Error
          ? error.message
          : "Upload failed";
    throw new Error(message);
  }
};
