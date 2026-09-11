import "server-only";

// The Summer Fox AI "Fundamentals" panel reads several fundamentals event types,
// each fetched as GET {fundamentalsPath}/{segment}/recent/snapshot?symbols=SYM.
// The response envelope is a record keyed by symbol -> array of events. Every
// event needs the base fields (name/dxSymbol/source/sid/eventTime).
//
// Contract + field names reverse-engineered from @dx-display/data-api fundamentals
// event schemas and the data-points display sources.

type SnapshotEnvelope = Record<string, ReadonlyArray<Record<string, unknown>>>;

const COMPANY: Record<string, { name: string; founded: string; employees: number; url: string; desc: string; marketCap: number; pe: number }> = {
    AAPL: { name: "Apple Inc.", founded: "1976", employees: 164000, url: "https://www.apple.com", marketCap: 3_450_000_000_000, pe: 32.4, desc: "Apple Inc. designs, manufactures and markets smartphones, personal computers, tablets, wearables and accessories, and sells a variety of related services." },
    MSFT: { name: "Microsoft Corp.", founded: "1975", employees: 221000, url: "https://www.microsoft.com", marketCap: 3_100_000_000_000, pe: 35.1, desc: "Microsoft Corporation develops, licenses and supports software, services, devices and solutions worldwide." },
    NVDA: { name: "NVIDIA Corp.", founded: "1993", employees: 29600, url: "https://www.nvidia.com", marketCap: 3_000_000_000_000, pe: 55.2, desc: "NVIDIA Corporation provides graphics and compute-and-networking solutions, and is a leading supplier of AI accelerators." },
    TSLA: { name: "Tesla Inc.", founded: "2003", employees: 140473, url: "https://www.tesla.com", marketCap: 1_050_000_000_000, pe: 71.0, desc: "Tesla, Inc. designs, develops, manufactures and sells electric vehicles and energy generation and storage systems." },
    AVGO: { name: "Broadcom Inc.", founded: "1991", employees: 20000, url: "https://www.broadcom.com", marketCap: 800_000_000_000, pe: 40.3, desc: "Broadcom Inc. designs, develops and supplies semiconductor and infrastructure software solutions." },
};

// Morningstar sector/industry codes (rendered via the widget's own code->label map).
const SECTOR_CODE = "311"; // Technology
const INDUSTRY_CODE = "31167";

const info = (symbol: string) => COMPANY[symbol] ?? {
    name: symbol,
    founded: "2000",
    employees: 10000,
    url: `https://www.${symbol.toLowerCase()}.com`,
    marketCap: 100_000_000_000,
    pe: 20,
    desc: `${symbol} is a publicly traded company.`,
};

const base = (symbol: string, name: string) => ({
    name,
    dxSymbol: symbol,
    source: "DXFEED",
    sid: symbol,
    eventTime: Date.now(),
});

/** Fundamentals event-type path segment -> snapshot builder for one symbol. */
export const buildFundamentalsSnapshot = (segment: string, symbols: readonly string[]): SnapshotEnvelope => {
    const out: Record<string, Array<Record<string, unknown>>> = {};

    for (const symbol of symbols) {
        const c = info(symbol);
        let event: Record<string, unknown> | null = null;

        switch (segment) {
            case "company-profile":
                event = {
                    ...base(symbol, "CompanyProfile"),
                    companyName: c.name,
                    description: c.desc,
                    address: "",
                    email: "",
                    phone: "",
                    url: c.url,
                    ext: { totalEmployeeNumber: c.employees },
                };
                break;
            case "instrument-reference":
                event = {
                    ...base(symbol, "InstrumentReference"),
                    ext: { standardName: c.name, yearOfEstablishment: c.founded },
                    cid: "0C00001SS",
                    companyStatus: "ACTIVE",
                    cik: "0000320193",
                    countryCode: "USA",
                    subType: "COMMON",
                    rawSymbol: symbol,
                    srcExchange: "NAS",
                    currencyCode: "USD",
                    mic: "XNAS",
                    cusip: "037833100",
                    ipoDate: "1980-12-12",
                };
                break;
            case "asset-classification":
                event = {
                    ...base(symbol, "AssetClassification"),
                    sicCode: "3571",
                    naceCode: "26.20",
                    naicsCode: "334111",
                    cannaicsCode: "334111",
                    srcEconomySphereCode: "3",
                    srcIndustryCode: INDUSTRY_CODE,
                    srcIndustryGroupCode: "31166",
                    srcSectorCode: SECTOR_CODE,
                };
                break;
            case "instrument-daily-summary":
                event = {
                    ...base(symbol, "InstrumentDailySummary"),
                    enterpriseValue: c.marketCap,
                    marketCap: c.marketCap,
                    ymd: 20260911,
                    ext: {},
                };
                break;
            case "valuation-ratio":
                event = {
                    ...base(symbol, "ValuationRatio"),
                    forwardDividendYield: 0.5,
                    forwardPERatio: c.pe - 3,
                    normalizedPEGRatio: 2.1,
                    normalizedPERatio: c.pe,
                    payoutRatio: 0.15,
                    pbvRatio: 45.2,
                    pcfRatio: 26.0,
                    pfcfRatio: 30.1,
                    psRatio: 8.9,
                    trailingDividendYield: 0.48,
                    ymd: 20260911,
                    ext: {},
                };
                break;
            default:
                event = null;
        }

        out[symbol] = event ? [event] : [];
    }

    return out;
};
