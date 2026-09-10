// Framework-free seed data shared by the mock dxFeed BFF routes
// (src/services/server/dxfeedMock) and the Heatmap component's initial
// `state.symbols` — kept here (not server-only) because the client needs the
// symbol list too, and none of this is real secret data.
//
// Morningstar sector/industry codes below are the real codes shipped inside
// @dx-display/data-display-rules-core (sector = first 3 digits, industryGroup =
// first 5, industry = full code). Using real codes — not made-up ones — is what
// lets the heatmap's built-in "group by sector" feature resolve human labels
// instead of showing "Unknown".
export type MockInstrumentSeed = {
    readonly symbol: string;
    readonly description: string;
    readonly industryCode: string;
    readonly marketCapUsd: number;
    readonly changePercent1d: number;
};

export const HEATMAP_TRADING_HOURS_ID = "US_EQUITY_REGULAR";

export const MOCK_INSTRUMENTS: readonly MockInstrumentSeed[] = [
    // Technology (311)
    { symbol: "AAPL", description: "Apple Inc.", industryCode: "31120030", marketCapUsd: 3_400_000_000_000, changePercent1d: 0.8 },
    { symbol: "MSFT", description: "Microsoft Corp.", industryCode: "31110020", marketCapUsd: 3_100_000_000_000, changePercent1d: 0.5 },
    { symbol: "NVDA", description: "NVIDIA Corp.", industryCode: "31130020", marketCapUsd: 3_000_000_000_000, changePercent1d: 2.1 },
    { symbol: "AVGO", description: "Broadcom Inc.", industryCode: "31130020", marketCapUsd: 800_000_000_000, changePercent1d: 1.8 },
    { symbol: "ORCL", description: "Oracle Corp.", industryCode: "31110030", marketCapUsd: 450_000_000_000, changePercent1d: 0.6 },
    { symbol: "ADBE", description: "Adobe Inc.", industryCode: "31110020", marketCapUsd: 230_000_000_000, changePercent1d: -0.9 },
    { symbol: "CRM", description: "Salesforce Inc.", industryCode: "31110020", marketCapUsd: 260_000_000_000, changePercent1d: 0.4 },
    { symbol: "NOW", description: "ServiceNow Inc.", industryCode: "31110030", marketCapUsd: 170_000_000_000, changePercent1d: 1.0 },
    { symbol: "TXN", description: "Texas Instruments Inc.", industryCode: "31130020", marketCapUsd: 160_000_000_000, changePercent1d: -0.2 },
    { symbol: "INTC", description: "Intel Corp.", industryCode: "31130020", marketCapUsd: 100_000_000_000, changePercent1d: -2.4 },
    { symbol: "QCOM", description: "Qualcomm Inc.", industryCode: "31130020", marketCapUsd: 180_000_000_000, changePercent1d: 0.7 },

    // Financial Services (103)
    { symbol: "JPM", description: "JPMorgan Chase & Co.", industryCode: "10320010", marketCapUsd: 600_000_000_000, changePercent1d: 0.3 },
    { symbol: "BAC", description: "Bank of America Corp.", industryCode: "10320020", marketCapUsd: 320_000_000_000, changePercent1d: 0.1 },
    { symbol: "WFC", description: "Wells Fargo & Co.", industryCode: "10320020", marketCapUsd: 220_000_000_000, changePercent1d: -0.4 },
    { symbol: "C", description: "Citigroup Inc.", industryCode: "10320010", marketCapUsd: 140_000_000_000, changePercent1d: 0.2 },
    { symbol: "GS", description: "Goldman Sachs Group Inc.", industryCode: "10330010", marketCapUsd: 170_000_000_000, changePercent1d: 0.9 },
    { symbol: "MS", description: "Morgan Stanley", industryCode: "10330010", marketCapUsd: 190_000_000_000, changePercent1d: 0.5 },
    { symbol: "SCHW", description: "Charles Schwab Corp.", industryCode: "10330010", marketCapUsd: 140_000_000_000, changePercent1d: -0.6 },
    { symbol: "BLK", description: "BlackRock Inc.", industryCode: "10310010", marketCapUsd: 140_000_000_000, changePercent1d: 0.3 },

    // Healthcare (206)
    { symbol: "JNJ", description: "Johnson & Johnson", industryCode: "20620010", marketCapUsd: 380_000_000_000, changePercent1d: 0.2 },
    { symbol: "PFE", description: "Pfizer Inc.", industryCode: "20620010", marketCapUsd: 160_000_000_000, changePercent1d: -0.5 },
    { symbol: "MRK", description: "Merck & Co.", industryCode: "20620010", marketCapUsd: 260_000_000_000, changePercent1d: 0.4 },
    { symbol: "ABBV", description: "AbbVie Inc.", industryCode: "20620020", marketCapUsd: 330_000_000_000, changePercent1d: 0.6 },
    { symbol: "AMGN", description: "Amgen Inc.", industryCode: "20610010", marketCapUsd: 160_000_000_000, changePercent1d: -0.3 },
    { symbol: "GILD", description: "Gilead Sciences Inc.", industryCode: "20610010", marketCapUsd: 110_000_000_000, changePercent1d: 0.8 },
    { symbol: "VRTX", description: "Vertex Pharmaceuticals Inc.", industryCode: "20610010", marketCapUsd: 120_000_000_000, changePercent1d: 1.1 },
    { symbol: "MDT", description: "Medtronic plc", industryCode: "20650010", marketCapUsd: 110_000_000_000, changePercent1d: -0.2 },
    { symbol: "ABT", description: "Abbott Laboratories", industryCode: "20650020", marketCapUsd: 190_000_000_000, changePercent1d: 0.3 },
    { symbol: "ISRG", description: "Intuitive Surgical Inc.", industryCode: "20650010", marketCapUsd: 180_000_000_000, changePercent1d: 1.4 },

    // Communication Services (308)
    { symbol: "GOOGL", description: "Alphabet Inc. Class A", industryCode: "30830010", marketCapUsd: 2_100_000_000_000, changePercent1d: -0.3 },
    { symbol: "META", description: "Meta Platforms Inc.", industryCode: "30830010", marketCapUsd: 1_400_000_000_000, changePercent1d: -1.1 },
    { symbol: "DIS", description: "Walt Disney Co.", industryCode: "30820040", marketCapUsd: 200_000_000_000, changePercent1d: 0.5 },
    { symbol: "NFLX", description: "Netflix Inc.", industryCode: "30820040", marketCapUsd: 300_000_000_000, changePercent1d: 1.6 },
    { symbol: "T", description: "AT&T Inc.", industryCode: "30810010", marketCapUsd: 160_000_000_000, changePercent1d: 0.1 },
    { symbol: "VZ", description: "Verizon Communications Inc.", industryCode: "30810010", marketCapUsd: 170_000_000_000, changePercent1d: -0.2 },

    // Consumer Cyclical (102)
    { symbol: "AMZN", description: "Amazon.com Inc.", industryCode: "10280050", marketCapUsd: 1_900_000_000_000, changePercent1d: 1.2 },
    { symbol: "TSLA", description: "Tesla Inc.", industryCode: "10200020", marketCapUsd: 800_000_000_000, changePercent1d: 3.2 },
    { symbol: "HD", description: "Home Depot Inc.", industryCode: "10280030", marketCapUsd: 380_000_000_000, changePercent1d: 0.4 },
    { symbol: "LOW", description: "Lowe's Companies Inc.", industryCode: "10280030", marketCapUsd: 140_000_000_000, changePercent1d: 0.2 },
    { symbol: "MCD", description: "McDonald's Corp.", industryCode: "10270010", marketCapUsd: 210_000_000_000, changePercent1d: -0.3 },
    { symbol: "SBUX", description: "Starbucks Corp.", industryCode: "10270010", marketCapUsd: 90_000_000_000, changePercent1d: -1.5 },

    // Energy (309)
    { symbol: "XOM", description: "Exxon Mobil Corp.", industryCode: "30910030", marketCapUsd: 480_000_000_000, changePercent1d: 0.9 },
    { symbol: "CVX", description: "Chevron Corp.", industryCode: "30910030", marketCapUsd: 290_000_000_000, changePercent1d: 0.6 },
    { symbol: "COP", description: "ConocoPhillips", industryCode: "30910020", marketCapUsd: 130_000_000_000, changePercent1d: -0.4 },
    { symbol: "SLB", description: "Schlumberger NV", industryCode: "30910060", marketCapUsd: 60_000_000_000, changePercent1d: -1.0 },

    // Industrials (310)
    { symbol: "BA", description: "Boeing Co.", industryCode: "31010010", marketCapUsd: 110_000_000_000, changePercent1d: -0.8 },
    { symbol: "LMT", description: "Lockheed Martin Corp.", industryCode: "31010010", marketCapUsd: 110_000_000_000, changePercent1d: 0.3 },
    { symbol: "RTX", description: "RTX Corp.", industryCode: "31010010", marketCapUsd: 150_000_000_000, changePercent1d: 0.5 },
    { symbol: "DAL", description: "Delta Air Lines Inc.", industryCode: "31080020", marketCapUsd: 35_000_000_000, changePercent1d: 1.2 },
    { symbol: "UAL", description: "United Airlines Holdings Inc.", industryCode: "31080020", marketCapUsd: 20_000_000_000, changePercent1d: 0.9 },
];

export const DEFAULT_HEATMAP_SYMBOLS: readonly string[] = MOCK_INSTRUMENTS.map((instrument) => instrument.symbol);

// Deterministic per-symbol PRNG (FNV-1a seed + mulberry32) so secondary metrics
// stay stable across requests without hand-authoring ~50 rows of fake decimals.
const hashSeed = (value: string): number => {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
};

const mulberry32 = (seed: number): (() => number) => {
    let state = seed;
    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

export type DerivedMetrics = {
    readonly volume: number;
    readonly avgVolume30d: number;
    readonly pcfRatio: number;
    readonly pbRatio: number;
    readonly psRatio: number;
    readonly dividendYieldPercent: number;
    readonly eps: number;
};

export const deriveMetrics = (seed: MockInstrumentSeed): DerivedMetrics => {
    const random = mulberry32(hashSeed(seed.symbol));
    const volume = Math.round(5_000_000 + random() * 45_000_000);

    return {
        volume,
        avgVolume30d: Math.round(volume * (0.8 + random() * 0.4)),
        pcfRatio: Number((8 + random() * 20).toFixed(2)),
        pbRatio: Number((1 + random() * 12).toFixed(2)),
        psRatio: Number((1 + random() * 10).toFixed(2)),
        dividendYieldPercent: Number((random() * 3).toFixed(2)),
        eps: Number((1 + random() * 12).toFixed(2)),
    };
};

export type ResolvedInstrument = MockInstrumentSeed & DerivedMetrics;

export const resolveInstruments = (): readonly ResolvedInstrument[] => {
    return MOCK_INSTRUMENTS.map((seed) => ({ ...seed, ...deriveMetrics(seed) }));
};
