export type NewsDataProviders = {
    readonly newsPath: string;
    readonly newsAuthHeader: string;
    readonly ipfPath: string;
    readonly ipfAuthHeader: string;
    readonly schedulePath: string;
};

// News widget needs News + IPF + Schedule; all point at the local mock BFF.
export const newsDataProviders: NewsDataProviders = {
    newsPath: "/api/dxfeed/news",
    newsAuthHeader: "",
    ipfPath: "/api/dxfeed/ipf",
    ipfAuthHeader: "",
    schedulePath: "/api/dxfeed/schedule",
};
