import { describe, expect, it } from "vitest";

import type { StreamerVideo } from "./StreamVideoField.types";
import { buildVideoOptions } from "./streamVideoOptions";

const video = (name: string, status: StreamerVideo["status"]): StreamerVideo => ({ name, status });

describe("buildVideoOptions", () => {
  it("orders ready videos first, then by preparation progress, then by name", () => {
    const options = buildVideoOptions(
      [
        video("z-ready.mp4", "ready"),
        video("a-failed.mp4", "failed"),
        video("m-pending.mp4", "pending"),
        video("a-ready.mp4", "ready"),
        video("b-transcoding.mp4", "transcoding"),
      ],
      null,
    );

    expect(options.map((o) => o.value)).toEqual([
      "a-ready.mp4",
      "z-ready.mp4",
      "b-transcoding.mp4",
      "m-pending.mp4",
      "a-failed.mp4",
    ]);
  });

  it("labels each option with its status", () => {
    const [option] = buildVideoOptions([video("clip.mp4", "ready")], null);
    expect(option).toEqual({ value: "clip.mp4", label: "clip.mp4 — ready" });
  });

  it("keeps the current value visible when the streamer does not list it", () => {
    const options = buildVideoOptions([video("known.mp4", "ready")], "legacy-url.m3u8");
    expect(options[0]).toEqual({ value: "legacy-url.m3u8", label: "legacy-url.m3u8 — (not on streamer)" });
    expect(options.map((o) => o.value)).toContain("known.mp4");
  });

  it("does not duplicate the current value when it is already listed", () => {
    const options = buildVideoOptions([video("known.mp4", "ready")], "known.mp4");
    expect(options).toHaveLength(1);
    expect(options[0].value).toBe("known.mp4");
  });

  it("returns an empty list when there are no videos and no value", () => {
    expect(buildVideoOptions([], null)).toEqual([]);
  });
});
