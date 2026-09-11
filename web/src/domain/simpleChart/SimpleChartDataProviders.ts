export type SimpleChartDataProviders = {
    readonly ipfPath: string;
    readonly ipfAuthHeader: string;
    readonly feedPath: string;
    readonly feedAuthHeader: string;
    readonly schedulePath: string;
    readonly dataDelay?: number;
};

const DXLINK_DEMO_TOKEN =
    "ZHh3ZWJkZW1vLHByb2QsLDE4NDc3OTYxOTMsMTc4NDcyNDE5MyxkeGNoYXJ0LWFwcA.U6QPgzpsj-UT8kpnhfqZ0hlsL3ZmcpNeM7EM3ZErxFw";

// Simple chart needs IPF + Feed + Schedule. IPF/Schedule -> local mock BFF; Feed
// -> public dxFeed developer demo WS (same token as PriceChart / other widgets).
export const simpleChartDataProviders: SimpleChartDataProviders = {
    ipfPath: "/api/dxfeed/ipf",
    ipfAuthHeader: "",
    feedPath: "wss://tools.dxfeed.com/dxlink-dxwebdemo",
    feedAuthHeader: DXLINK_DEMO_TOKEN,
    schedulePath: "/api/dxfeed/schedule",
};
