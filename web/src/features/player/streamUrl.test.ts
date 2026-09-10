import { afterEach, describe, expect, it } from "vitest";

import { resolveStreamUrl } from "./streamUrl";

const ORIGINAL = process.env.NEXT_PUBLIC_STREAMER_URL;

afterEach(() => {
  process.env.NEXT_PUBLIC_STREAMER_URL = ORIGINAL;
});

describe("resolveStreamUrl", () => {
  it("returns null for missing / blank input", () => {
    expect(resolveStreamUrl(null)).toBeNull();
    expect(resolveStreamUrl(undefined)).toBeNull();
    expect(resolveStreamUrl("   ")).toBeNull();
  });

  it("passes absolute URLs through verbatim", () => {
    const url = "http://34.13.255.70:8082/stream/demo.mp4/master.m3u8";
    expect(resolveStreamUrl(url)).toBe(url);
  });

  it("expands a stream name against the configured streamer base", () => {
    process.env.NEXT_PUBLIC_STREAMER_URL = "http://streamer.example:8082/";
    expect(resolveStreamUrl("demo.mp4")).toBe(
      "http://streamer.example:8082/stream/demo.mp4/master.m3u8",
    );
  });

  it("url-encodes the stream name", () => {
    process.env.NEXT_PUBLIC_STREAMER_URL = "http://localhost:8082";
    expect(resolveStreamUrl("a b.mp4")).toBe(
      "http://localhost:8082/stream/a%20b.mp4/master.m3u8",
    );
  });
});
