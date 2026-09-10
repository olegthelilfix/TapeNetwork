export type HeatmapDataProviders = {
    readonly ipfPath: string;
    readonly ipfAuthHeader: string;
    readonly scannerPath: string;
    readonly scannerAuthHeader: string;
    readonly schedulePath: string;
};

// Points at the local mock BFF routes (src/app/api/dxfeed/**) that stand in
// for dxFeed's IPF/Scanner/Schedule services until a demo account is issued.
// ipfAuthHeader/scannerAuthHeader are required by the widget's own provider
// schema (zod z.string(), not optional) even though the mock ignores them —
// swap these paths and fill in real header values once credentials arrive.
export const heatmapDataProviders: HeatmapDataProviders = {
    ipfPath: "/api/dxfeed/ipf",
    ipfAuthHeader: "",
    scannerPath: "/api/dxfeed/scanner",
    scannerAuthHeader: "",
    schedulePath: "/api/dxfeed/schedule",
};
