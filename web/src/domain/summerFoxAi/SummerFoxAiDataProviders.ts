export type SummerFoxAiDataProviders = {
    readonly reportPath: string;
    readonly reportAuthHeader: string;
    readonly ipfPath: string;
    readonly ipfAuthHeader: string;
    readonly schedulePath: string;
    readonly feedPath: string;
    readonly feedAuthHeader: string;
    readonly fundamentalsPath: string;
    readonly fundamentalsAuthHeader: string;
};

// Summer Fox AI needs five providers. Report/IPF/Schedule/Fundamentals point at
// the local mock BFF (src/app/api/dxfeed/**); the report mock supplies the
// AI-style analysis text. The Feed provider is a dxLink WebSocket for live quote
// context — pointed at the same public developer demo endpoint the PriceChart
// widget uses, so it needs no mock. Auth headers are required by the widget's
// zod schema (z.string()) even though the mocks ignore them.
export const summerFoxAiDataProviders: SummerFoxAiDataProviders = {
    reportPath: "/api/dxfeed/report",
    reportAuthHeader: "",
    // IPF enabled: getSymbolProfile resolves the symbol as a STOCK, which
    // satisfies the widget's instrType===Stock gate — without it, Founded /
    // Sector / Industry / Employees / Website / description stay blank even with
    // the fundamentals snapshot mocks.
    ipfPath: "/api/dxfeed/ipf",
    ipfAuthHeader: "",
    schedulePath: "/api/dxfeed/schedule",
    // dxLink feed for the live quote context in the center block. Points at
    // dxFeed's public developer demo WS with its public demo token (same as the
    // PriceChart widget). An empty feedPath makes the client dial a relative
    // ws://<origin> URL and fail ("Unable to connect"), so it must be a real URL.
    feedPath: "wss://tools.dxfeed.com/dxlink-dxwebdemo",
    feedAuthHeader:
        "ZHh3ZWJkZW1vLHByb2QsLDE4NDc3OTYxOTMsMTc4NDcyNDE5MyxkeGNoYXJ0LWFwcA.U6QPgzpsj-UT8kpnhfqZ0hlsL3ZmcpNeM7EM3ZErxFw",
    fundamentalsPath: "/api/dxfeed/fundamentals",
    fundamentalsAuthHeader: "",
};
