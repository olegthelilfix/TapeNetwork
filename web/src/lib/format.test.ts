import { describe, it, expect } from "vitest";
import { mediaUrl, formatDate } from "./format";

describe("mediaUrl", () => {
  it("normalizes stored relative paths to a root-served URL", () => {
    expect(mediaUrl("uploads/x.png")).toBe("/uploads/x.png");
    expect(mediaUrl("/uploads/x.png")).toBe("/uploads/x.png");
  });
  it("passes absolute URLs through unchanged", () => {
    expect(mediaUrl("https://cdn.example/x.png")).toBe("https://cdn.example/x.png");
    expect(mediaUrl("http://localhost:8080/uploads/x.png")).toBe("http://localhost:8080/uploads/x.png");
  });
  it("is null-safe", () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl(undefined)).toBeNull();
  });
});

describe("formatDate", () => {
  it("formats ISO instants (month + year, day is timezone-dependent)", () => {
    expect(formatDate("2026-08-03T13:30:00Z")).toMatch(/^Aug \d{1,2}, 2026$/);
  });
  it("is null-safe and rejects garbage", () => {
    expect(formatDate(null)).toBeNull();
    expect(formatDate("not-a-date")).toBeNull();
  });
});
