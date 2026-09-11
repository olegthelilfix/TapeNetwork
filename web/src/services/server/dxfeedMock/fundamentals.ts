import "server-only";

import { MOCK_ECONOMIC_EVENTS } from "@/domain/economicCalendar";

// Mirrors the on-the-wire EconomicCalendarEvent (input form) that
// @dx-display/data-api parses with `z.array(EconomicCalendarEvent).parse(data)`
// from GET {fundamentalsPath}/EconomicCalendar/recent/calendar.
export type EconomicCalendarEventDto = {
    readonly name: "EconomicCalendar";
    readonly eventTime: number; // epoch ms
    readonly srcTime: number; // epoch ms
    readonly dxSymbol: string;
    readonly source: string;
    readonly sid: string;
    readonly countryCode: string;
    readonly subType: string;
    readonly actual: string;
    readonly consensus: string;
    readonly importance: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
    readonly ext: { readonly previous?: string };
};

export type FundamentalsCalendarQuery = {
    /** yyyymmdd, inclusive lower bound. */
    readonly fromYmd?: string;
    /** yyyymmdd, inclusive upper bound. */
    readonly toYmd?: string;
    /** ISO country codes to keep; empty/undefined = all. */
    readonly countryCodes?: readonly string[];
};

const MS_PER_DAY = 86_400_000;

// yyyymmdd (number or string) -> UTC midnight epoch ms.
const ymdToEpoch = (ymd: string): number => {
    const year = Number(ymd.slice(0, 4));
    const month = Number(ymd.slice(4, 6));
    const day = Number(ymd.slice(6, 8));
    return Date.UTC(year, month - 1, day);
};

const startOfUtcDay = (ms: number): number => ms - (ms % MS_PER_DAY);

/**
 * Build the mock economic-calendar events overlapping [fromYmd, toYmd],
 * optionally filtered by country. Deterministic given "today" (UTC day).
 */
export const buildEconomicCalendar = (query: FundamentalsCalendarQuery = {}): EconomicCalendarEventDto[] => {
    const today = startOfUtcDay(Date.now());
    const from = query.fromYmd ? ymdToEpoch(query.fromYmd) : today;
    const to = query.toYmd ? ymdToEpoch(query.toYmd) + MS_PER_DAY - 1 : today + 30 * MS_PER_DAY;
    const countries = query.countryCodes && query.countryCodes.length > 0 ? new Set(query.countryCodes) : null;

    const events: EconomicCalendarEventDto[] = [];

    for (const seed of MOCK_ECONOMIC_EVENTS) {
        if (countries && !countries.has(seed.countryCode)) {
            continue;
        }
        for (const dayOffset of seed.dayOffsets) {
            const eventTime = today + dayOffset * MS_PER_DAY + seed.hour * 3_600_000;
            if (eventTime < from || eventTime > to) {
                continue;
            }
            const sid = `${seed.countryCode}:${seed.subType}:${eventTime}`;
            events.push({
                name: "EconomicCalendar",
                eventTime,
                srcTime: eventTime,
                dxSymbol: `ECON:${seed.countryCode}`,
                source: "mock",
                sid,
                countryCode: seed.countryCode,
                subType: seed.subType,
                actual: seed.actual,
                consensus: seed.consensus,
                importance: seed.importance,
                ext: { previous: seed.previous },
            });
        }
    }

    return events.sort((a, b) => a.eventTime - b.eventTime);
};
