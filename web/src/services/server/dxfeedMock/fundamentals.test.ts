import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => {
    return {};
});

import { buildEconomicCalendar } from "./fundamentals";

const MS_PER_DAY = 86_400_000;
const ymd = (ms: number): string => {
    const d = new Date(ms);
    return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
};

describe("buildEconomicCalendar", () => {
    it("returns EconomicCalendar events sorted by time within the default 30-day window", () => {
        const events = buildEconomicCalendar();

        expect(events.length).toBeGreaterThan(0);
        expect(events.every((e) => e.name === "EconomicCalendar")).toBe(true);
        const times = events.map((e) => e.eventTime);
        expect([...times].sort((a, b) => a - b)).toEqual(times);
    });

    it("carries the display fields the widget renders (actual/consensus/importance/previous)", () => {
        const [first] = buildEconomicCalendar();

        expect(first).toBeDefined();
        expect(typeof first?.actual).toBe("string");
        expect(typeof first?.consensus).toBe("string");
        expect(["LOW", "MEDIUM", "HIGH", "UNKNOWN"]).toContain(first?.importance);
        expect(typeof first?.ext.previous).toBe("string");
    });

    it("filters by country code", () => {
        const usOnly = buildEconomicCalendar({ countryCodes: ["US"] });

        expect(usOnly.length).toBeGreaterThan(0);
        expect(usOnly.every((e) => e.countryCode === "US")).toBe(true);
    });

    it("restricts events to the requested date range", () => {
        const today = Date.now() - (Date.now() % MS_PER_DAY);
        const events = buildEconomicCalendar({ fromYmd: ymd(today), toYmd: ymd(today) });

        expect(events.every((e) => e.eventTime >= today && e.eventTime < today + MS_PER_DAY)).toBe(true);
    });
});
