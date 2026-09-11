export type EconomicCalendarDataProviders = {
    readonly ipfPath: string;
    readonly ipfAuthHeader: string;
    readonly fundamentalsPath: string;
    readonly fundamentalsAuthHeader: string;
};

// The economic-calendar widget needs IPF (instrument lookup, reused from the
// heatmap mock) + Fundamentals (the actual calendar events). Both point at the
// local mock BFF under src/app/api/dxfeed/** until real dxFeed credentials
// arrive. The widget appends "/EconomicCalendar/recent/calendar" to
// fundamentalsPath itself, so fundamentalsPath is just the base.
// ipfAuthHeader/fundamentalsAuthHeader are required by the widget's zod schema
// (z.string(), not optional) even though the mock ignores them.
export const economicCalendarDataProviders: EconomicCalendarDataProviders = {
    ipfPath: "/api/dxfeed/ipf",
    ipfAuthHeader: "",
    fundamentalsPath: "/api/dxfeed/fundamentals",
    fundamentalsAuthHeader: "",
};
