package net.tape.service.dxfeed;

import java.util.List;

/**
 * Framework-free seed data + deterministic secondary metrics for the mock dxFeed data services
 * ({@link DxfeedIpfService}, {@link DxfeedScannerService}). Ported as-is from the web BFF mock
 * {@code web/src/domain/heatmap/mockInstruments.ts} so the backend serves byte-compatible data
 * (Step 0 keeps the PRNG mock; real dxFeed sources come later).
 *
 * <p>Morningstar sector/industry codes are the real codes (sector = first 3 digits, industryGroup
 * = first 5, industry = full code) so the heatmap's "group by sector" resolves human labels.
 */
public final class DxfeedInstruments {

    private DxfeedInstruments() {
    }

    public static final String HEATMAP_TRADING_HOURS_ID = "US_EQUITY_REGULAR";

    /** Instrument reference seed (framework-free). */
    public record InstrumentSeed(
        String symbol,
        String description,
        String industryCode,
        long marketCapUsd,
        double changePercent1d) {
    }

    /** Deterministic per-symbol secondary metrics (PRNG-derived; stable across requests). */
    public record DerivedMetrics(
        long volume,
        long avgVolume30d,
        double pcfRatio,
        double pbRatio,
        double psRatio,
        double dividendYieldPercent,
        double eps) {
    }

    /** Seed + derived metrics (mirror of the TS {@code ResolvedInstrument = seed & metrics}). */
    public record ResolvedInstrument(InstrumentSeed seed, DerivedMetrics metrics) {
    }

    public static final List<InstrumentSeed> MOCK_INSTRUMENTS = List.of(
        // Technology (311)
        new InstrumentSeed("AAPL", "Apple Inc.", "31120030", 3_400_000_000_000L, 0.8),
        new InstrumentSeed("MSFT", "Microsoft Corp.", "31110020", 3_100_000_000_000L, 0.5),
        new InstrumentSeed("NVDA", "NVIDIA Corp.", "31130020", 3_000_000_000_000L, 2.1),
        new InstrumentSeed("AVGO", "Broadcom Inc.", "31130020", 800_000_000_000L, 1.8),
        new InstrumentSeed("ORCL", "Oracle Corp.", "31110030", 450_000_000_000L, 0.6),
        new InstrumentSeed("ADBE", "Adobe Inc.", "31110020", 230_000_000_000L, -0.9),
        new InstrumentSeed("CRM", "Salesforce Inc.", "31110020", 260_000_000_000L, 0.4),
        new InstrumentSeed("NOW", "ServiceNow Inc.", "31110030", 170_000_000_000L, 1.0),
        new InstrumentSeed("TXN", "Texas Instruments Inc.", "31130020", 160_000_000_000L, -0.2),
        new InstrumentSeed("INTC", "Intel Corp.", "31130020", 100_000_000_000L, -2.4),
        new InstrumentSeed("QCOM", "Qualcomm Inc.", "31130020", 180_000_000_000L, 0.7),

        // Financial Services (103)
        new InstrumentSeed("JPM", "JPMorgan Chase & Co.", "10320010", 600_000_000_000L, 0.3),
        new InstrumentSeed("BAC", "Bank of America Corp.", "10320020", 320_000_000_000L, 0.1),
        new InstrumentSeed("WFC", "Wells Fargo & Co.", "10320020", 220_000_000_000L, -0.4),
        new InstrumentSeed("C", "Citigroup Inc.", "10320010", 140_000_000_000L, 0.2),
        new InstrumentSeed("GS", "Goldman Sachs Group Inc.", "10330010", 170_000_000_000L, 0.9),
        new InstrumentSeed("MS", "Morgan Stanley", "10330010", 190_000_000_000L, 0.5),
        new InstrumentSeed("SCHW", "Charles Schwab Corp.", "10330010", 140_000_000_000L, -0.6),
        new InstrumentSeed("BLK", "BlackRock Inc.", "10310010", 140_000_000_000L, 0.3),

        // Healthcare (206)
        new InstrumentSeed("JNJ", "Johnson & Johnson", "20620010", 380_000_000_000L, 0.2),
        new InstrumentSeed("PFE", "Pfizer Inc.", "20620010", 160_000_000_000L, -0.5),
        new InstrumentSeed("MRK", "Merck & Co.", "20620010", 260_000_000_000L, 0.4),
        new InstrumentSeed("ABBV", "AbbVie Inc.", "20620020", 330_000_000_000L, 0.6),
        new InstrumentSeed("AMGN", "Amgen Inc.", "20610010", 160_000_000_000L, -0.3),
        new InstrumentSeed("GILD", "Gilead Sciences Inc.", "20610010", 110_000_000_000L, 0.8),
        new InstrumentSeed("VRTX", "Vertex Pharmaceuticals Inc.", "20610010", 120_000_000_000L, 1.1),
        new InstrumentSeed("MDT", "Medtronic plc", "20650010", 110_000_000_000L, -0.2),
        new InstrumentSeed("ABT", "Abbott Laboratories", "20650020", 190_000_000_000L, 0.3),
        new InstrumentSeed("ISRG", "Intuitive Surgical Inc.", "20650010", 180_000_000_000L, 1.4),

        // Communication Services (308)
        new InstrumentSeed("GOOGL", "Alphabet Inc. Class A", "30830010", 2_100_000_000_000L, -0.3),
        new InstrumentSeed("META", "Meta Platforms Inc.", "30830010", 1_400_000_000_000L, -1.1),
        new InstrumentSeed("DIS", "Walt Disney Co.", "30820040", 200_000_000_000L, 0.5),
        new InstrumentSeed("NFLX", "Netflix Inc.", "30820040", 300_000_000_000L, 1.6),
        new InstrumentSeed("T", "AT&T Inc.", "30810010", 160_000_000_000L, 0.1),
        new InstrumentSeed("VZ", "Verizon Communications Inc.", "30810010", 170_000_000_000L, -0.2),

        // Consumer Cyclical (102)
        new InstrumentSeed("AMZN", "Amazon.com Inc.", "10280050", 1_900_000_000_000L, 1.2),
        new InstrumentSeed("TSLA", "Tesla Inc.", "10200020", 800_000_000_000L, 3.2),
        new InstrumentSeed("HD", "Home Depot Inc.", "10280030", 380_000_000_000L, 0.4),
        new InstrumentSeed("LOW", "Lowe's Companies Inc.", "10280030", 140_000_000_000L, 0.2),
        new InstrumentSeed("MCD", "McDonald's Corp.", "10270010", 210_000_000_000L, -0.3),
        new InstrumentSeed("SBUX", "Starbucks Corp.", "10270010", 90_000_000_000L, -1.5),

        // Energy (309)
        new InstrumentSeed("XOM", "Exxon Mobil Corp.", "30910030", 480_000_000_000L, 0.9),
        new InstrumentSeed("CVX", "Chevron Corp.", "30910030", 290_000_000_000L, 0.6),
        new InstrumentSeed("COP", "ConocoPhillips", "30910020", 130_000_000_000L, -0.4),
        new InstrumentSeed("SLB", "Schlumberger NV", "30910060", 60_000_000_000L, -1.0),

        // Industrials (310)
        new InstrumentSeed("BA", "Boeing Co.", "31010010", 110_000_000_000L, -0.8),
        new InstrumentSeed("LMT", "Lockheed Martin Corp.", "31010010", 110_000_000_000L, 0.3),
        new InstrumentSeed("RTX", "RTX Corp.", "31010010", 150_000_000_000L, 0.5),
        new InstrumentSeed("DAL", "Delta Air Lines Inc.", "31080020", 35_000_000_000L, 1.2),
        new InstrumentSeed("UAL", "United Airlines Holdings Inc.", "31080020", 20_000_000_000L, 0.9));

    /** 32-bit FNV-1a seed (matches the TS {@code hashSeed}); returned as the raw 32 bits. */
    private static int hashSeed(String value) {
        int hash = 0x811C9DC5; // 2166136261 as int32
        for (int i = 0; i < value.length(); i += 1) {
            hash ^= value.charAt(i);
            hash *= 0x01000193; // 16777619 (Math.imul == low 32 bits of the product)
        }
        return hash;
    }

    /** Stateful mulberry32 PRNG (matches the TS closure); each {@link #next()} yields [0,1). */
    private static final class Mulberry32 {
        private int state;

        Mulberry32(int seed) {
            this.state = seed;
        }

        double next() {
            state += 0x6D2B79F5;
            int t = state ^ (state >>> 15);
            t = t * (state | 1);
            t = (t + (t ^ (t >>> 7)) * (t | 61)) ^ t;
            long u = (t ^ (t >>> 14)) & 0xFFFFFFFFL;
            return u / 4294967296.0;
        }
    }

    /** {@code Number(x.toFixed(2))} — round to 2 decimals. */
    private static double toFixed2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    public static DerivedMetrics deriveMetrics(InstrumentSeed seed) {
        Mulberry32 random = new Mulberry32(hashSeed(seed.symbol()));
        long volume = Math.round(5_000_000 + random.next() * 45_000_000);

        return new DerivedMetrics(
            volume,
            Math.round(volume * (0.8 + random.next() * 0.4)),
            toFixed2(8 + random.next() * 20),
            toFixed2(1 + random.next() * 12),
            toFixed2(1 + random.next() * 10),
            toFixed2(random.next() * 3),
            toFixed2(1 + random.next() * 12));
    }

    public static List<ResolvedInstrument> resolveInstruments() {
        return MOCK_INSTRUMENTS.stream()
            .map(seed -> new ResolvedInstrument(seed, deriveMetrics(seed)))
            .toList();
    }
}
