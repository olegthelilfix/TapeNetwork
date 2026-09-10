import type { StreamerVideo } from "./StreamVideoField.types";

export type StreamVideoOption = {
    readonly value: string;
    readonly label: string;
};

/** Ready videos first, then in-progress, then problematic; ties broken by name. */
export const STATUS_RANK: Record<StreamerVideo["status"], number> = {
  ready: 0,
  transcoding: 1,
  pending: 2,
  unknown: 3,
  failed: 4,
};

export const optionLabel = (v: StreamerVideo): string => `${v.name} — ${v.status}`;

/**
 * Build the dropdown options from the streamer's videos: sorted by readiness then
 * name, and — so an editor never loses their current binding — the currently
 * selected value is kept visible (flagged) even when the streamer doesn't list it.
 */
export const buildVideoOptions = (
  videos: readonly StreamerVideo[],
  value: string | null | undefined,
): StreamVideoOption[] => {
  const sorted = [...videos].sort(
    (a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || a.name.localeCompare(b.name),
  );
  const options: StreamVideoOption[] = sorted.map((v) => ({ value: v.name, label: optionLabel(v) }));
  if (value && !sorted.some((v) => v.name === value)) {
    options.unshift({ value, label: `${value} — (not on streamer)` });
  }
  return options;
};
