// Seed macro events for the mock economic-calendar Fundamentals feed. Kept small
// and generic (major US/EU/UK/JP prints) — the mock generator below spreads these
// across the requested date range so the widget always has something to show
// until real dxFeed Fundamentals credentials are wired in.
//
// Shape mirrors @dx-display/data-api EconomicCalendarEvent (input form): srcTime
// is epoch-ms, importance is LOW|MEDIUM|HIGH, ext.previous is optional.

export type Importance = "LOW" | "MEDIUM" | "HIGH";

export type MockEconomicEventSeed = {
    /** Human event name, e.g. "CPI (YoY)". */
    readonly subType: string;
    /** ISO country code, e.g. "US". */
    readonly countryCode: string;
    readonly importance: Importance;
    /** Latest released value (display string, unit included). */
    readonly actual: string;
    /** Market consensus / forecast (display string). */
    readonly consensus: string;
    /** Previous period's value (display string). */
    readonly previous: string;
    /** Hour of day (ET-ish, local mock) the print lands at. */
    readonly hour: number;
    /** Which day offsets from "today" this event recurs on (0 = today). */
    readonly dayOffsets: readonly number[];
};

export const MOCK_ECONOMIC_EVENTS: readonly MockEconomicEventSeed[] = [
    {
        subType: "CPI (YoY)",
        countryCode: "US",
        importance: "HIGH",
        actual: "3.1%",
        consensus: "3.2%",
        previous: "3.4%",
        hour: 8,
        dayOffsets: [0, 30],
    },
    {
        subType: "Initial Jobless Claims",
        countryCode: "US",
        importance: "MEDIUM",
        actual: "221K",
        consensus: "218K",
        previous: "217K",
        hour: 8,
        dayOffsets: [0, 7, 14, 21, 28],
    },
    {
        subType: "Fed Interest Rate Decision",
        countryCode: "US",
        importance: "HIGH",
        actual: "5.50%",
        consensus: "5.50%",
        previous: "5.50%",
        hour: 14,
        dayOffsets: [1, 15],
    },
    {
        subType: "Nonfarm Payrolls",
        countryCode: "US",
        importance: "HIGH",
        actual: "216K",
        consensus: "175K",
        previous: "173K",
        hour: 8,
        dayOffsets: [2, 30],
    },
    {
        subType: "Retail Sales (MoM)",
        countryCode: "US",
        importance: "MEDIUM",
        actual: "0.6%",
        consensus: "0.4%",
        previous: "0.3%",
        hour: 8,
        dayOffsets: [3, 24],
    },
    {
        subType: "ECB Interest Rate Decision",
        countryCode: "EU",
        importance: "HIGH",
        actual: "4.50%",
        consensus: "4.50%",
        previous: "4.50%",
        hour: 7,
        dayOffsets: [1, 22],
    },
    {
        subType: "HICP Inflation (YoY)",
        countryCode: "EU",
        importance: "MEDIUM",
        actual: "2.4%",
        consensus: "2.5%",
        previous: "2.6%",
        hour: 5,
        dayOffsets: [4, 25],
    },
    {
        subType: "GDP Growth Rate (QoQ)",
        countryCode: "GB",
        importance: "MEDIUM",
        actual: "0.2%",
        consensus: "0.1%",
        previous: "0.0%",
        hour: 2,
        dayOffsets: [5, 26],
    },
    {
        subType: "BoJ Interest Rate Decision",
        countryCode: "JP",
        importance: "HIGH",
        actual: "0.10%",
        consensus: "0.10%",
        previous: "-0.10%",
        hour: 3,
        dayOffsets: [6, 27],
    },
    {
        subType: "Unemployment Rate",
        countryCode: "DE",
        importance: "LOW",
        actual: "5.9%",
        consensus: "5.9%",
        previous: "5.9%",
        hour: 3,
        dayOffsets: [2, 16, 29],
    },
];
