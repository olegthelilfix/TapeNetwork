export type CorporateCardDataProviders = {
    readonly ipfPath: string;
    readonly ipfAuthHeader: string;
    readonly feedPath: string;
    readonly feedAuthHeader: string;
    readonly fundamentalsPath: string;
    readonly fundamentalsAuthHeader: string;
    readonly schedulePath: string;
    readonly scannerPath: string;
    readonly scannerAuthHeader: string;
    readonly dataDelay?: number;
};

// Corporate Card needs IPF + Feed + Fundamentals + Schedule + Scanner. All the
// HTTP ones point at the local mock BFF (src/app/api/dxfeed/**); the feed is the
// public dxFeed developer demo WS with its public token (same as PriceChart /
// Summer Fox AI) so the price-history panel gets live candles.
const DXLINK_DEMO_TOKEN =
    "ZHh3ZWJkZW1vLHByb2QsLDE4NDc3OTYxOTMsMTc4NDcyNDE5MyxkeGNoYXJ0LWFwcA.U6QPgzpsj-UT8kpnhfqZ0hlsL3ZmcpNeM7EM3ZErxFw";

export const corporateCardDataProviders: CorporateCardDataProviders = {
    ipfPath: "/api/dxfeed/ipf",
    ipfAuthHeader: "",
    feedPath: "wss://tools.dxfeed.com/dxlink-dxwebdemo",
    feedAuthHeader: DXLINK_DEMO_TOKEN,
    fundamentalsPath: "/api/dxfeed/fundamentals",
    fundamentalsAuthHeader: "",
    schedulePath: "/api/dxfeed/schedule",
    scannerPath: "/api/dxfeed/scanner",
    scannerAuthHeader: "",
};
