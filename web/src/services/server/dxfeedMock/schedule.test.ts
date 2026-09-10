import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => {
    return {};
});

import { HEATMAP_TRADING_HOURS_ID } from "@/domain/heatmap";

import { buildScheduleResponse } from "./schedule";

describe("buildScheduleResponse", () => {
    // 2026-09-07 is a Monday, 2026-09-13 is a Sunday.
    const start = Date.UTC(2026, 8, 7);
    const stop = Date.UTC(2026, 8, 13);

    it("returns one entry per requested schedule id", () => {
        const result = buildScheduleResponse({ schedules: [HEATMAP_TRADING_HOURS_ID], start, stop });

        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty(HEATMAP_TRADING_HOURS_ID);
    });

    it("marks weekends as holidays with a single NO_TRADING session", () => {
        const result = buildScheduleResponse({ schedules: [HEATMAP_TRADING_HOURS_ID], start, stop });
        const days = result[0]?.[HEATMAP_TRADING_HOURS_ID]?.schedule.days ?? [];
        const sunday = days.find((day) => day.id === "2026-09-13");

        expect(sunday?.isHoliday).toBe("true");
        expect(sunday?.sessions).toHaveLength(1);
        expect(sunday?.sessions[0]?.type).toBe("NO_TRADING");
    });

    it("gives weekdays pre-market, regular, and after-market sessions", () => {
        const result = buildScheduleResponse({ schedules: [HEATMAP_TRADING_HOURS_ID], start, stop });
        const days = result[0]?.[HEATMAP_TRADING_HOURS_ID]?.schedule.days ?? [];
        const monday = days.find((day) => day.id === "2026-09-07");

        expect(monday?.isHoliday).toBe("false");
        expect(monday?.sessions.map((session) => session.type)).toEqual(["PRE_MARKET", "REGULAR", "AFTER_MARKET"]);
        expect(monday?.sessions[1]?.startTime).toBe("2026-09-07 09:30:00-05:00");
    });
});
