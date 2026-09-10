import { afterEach, describe, expect, it, vi } from "vitest";

import { listVideos, uploadVideo } from "./streamerApi";

// uploadVideo now goes through the backend admin API (axios apiClient), not the
// streamer directly; listVideos still reads the streamer over fetch.
const post = vi.fn();
vi.mock("../data-provider", () => ({ apiClient: { post: (...args: unknown[]) => post(...args) } }));

const mockFetch = (impl: (url: string, init?: RequestInit) => Response | Promise<Response>) => {
  const spy = vi.fn(impl);
  vi.stubGlobal("fetch", spy);
  return spy;
};

const json = (body: unknown, ok = true, status = 200): Response =>
  ({ ok, status, json: async () => body, text: async () => JSON.stringify(body) }) as Response;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  post.mockReset();
});

describe("streamerApi.listVideos", () => {
  it("requests /videos and maps the response", async () => {
    const fetchSpy = mockFetch(() =>
      json([{ name: "a.mp4", status: "ready", tiers: ["720p"], size: 10 }]),
    );

    const videos = await listVideos();

    expect(fetchSpy.mock.calls[0][0]).toMatch(/\/videos$/);
    expect(videos).toEqual([{ name: "a.mp4", status: "ready", tiers: ["720p"], size: 10 }]);
  });

  it("drops malformed entries and tolerates a non-array body", async () => {
    mockFetch(() => json([{ name: "ok.mp4", status: "pending" }, { status: "no-name" }, 42]));
    expect(await listVideos()).toEqual([{ name: "ok.mp4", status: "pending" }]);

    mockFetch(() => json({ not: "an array" }));
    expect(await listVideos()).toEqual([]);
  });

  it("throws when the streamer responds with an error", async () => {
    mockFetch(() => json({}, false, 500));
    await expect(listVideos()).rejects.toThrow(/500/);
  });
});

describe("streamerApi.uploadVideo", () => {
  it("POSTs the file as multipart to the backend proxy and returns the created video", async () => {
    post.mockResolvedValue({ data: { name: "clip.mp4", status: "pending" } });

    const result = await uploadVideo(new File(["data"], "clip.mp4", { type: "video/mp4" }));

    const [path, body] = post.mock.calls[0];
    expect(path).toBe("/videos/stream/upload");
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("file")).toBeInstanceOf(File);
    expect(result).toEqual({ name: "clip.mp4", status: "pending" });
  });

  it("surfaces the streamer's error text forwarded by the backend", async () => {
    post.mockRejectedValue({ response: { status: 409, data: "a video with this name already exists" } });
    await expect(uploadVideo(new File(["x"], "dup.mp4"))).rejects.toThrow(/already exists/);
  });
});
