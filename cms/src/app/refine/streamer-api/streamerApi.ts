import type { ListVideos, StreamerVideo, UploadVideo } from "@/ui/StreamVideoField";

import { streamerUrl } from "../apiConfig";

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

/** List the source videos the streamer knows about (GET /videos). */
export const listVideos: ListVideos = async () => {
  const res = await fetch(`${streamerUrl}/videos`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Streamer /videos failed: ${res.status}`);
  const body: unknown = await res.json();
  if (!Array.isArray(body)) return [];
  return body.map(toVideo).filter((v): v is StreamerVideo => v !== null);
};

/**
 * Upload a new source video (POST /videos, multipart "file"). The streamer stores
 * it and begins preparing HLS renditions; the returned video starts as pending.
 */
export const uploadVideo: UploadVideo = async (file) => {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${streamerUrl}/videos`, { method: "POST", body: form });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Upload failed: ${res.status}`);
  }
  const video = toVideo(await res.json());
  if (!video) throw new Error("Unexpected upload response from streamer");
  return video;
};
