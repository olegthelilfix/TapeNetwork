import { describe, it, expect } from "vitest";
import { formatDate } from "./format";

describe("formatDate", () => {
  it("formats ISO instants (month + year, day is timezone-dependent)", () => {
    expect(formatDate("2026-08-03T13:30:00Z")).toMatch(/^Aug \d{1,2}, 2026$/);
  });
  it("is null-safe and rejects garbage", () => {
    expect(formatDate(null)).toBeNull();
    expect(formatDate("not-a-date")).toBeNull();
  });
});
