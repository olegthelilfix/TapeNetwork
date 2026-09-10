package net.tape.service.dxfeed;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Framework-free instrument seed + deterministic secondary metrics for the mock dxFeed data services
 * ({@link DxfeedIpfService}, {@link DxfeedScannerService}).
 *
 * <p>The seed is loaded from the IPF resource {@code /dxfeed/instruments.ipf} (columns after
 * {@code TYPE}: SYMBOL, DESCRIPTION, MORNINGSTAR_INDUSTRY_CODE, MARKET_CAP, CHANGE_1D — the last three
 * are custom fields the heatmap's Scanner needs). The seven secondary metrics are derived per symbol
 * with a seeded {@link Random}; the exact values don't matter (the widget reads this backend, not the
 * old TS mock), only that they're stable per symbol.
 *
 * <p>Morningstar sector/industry codes in the resource are the real codes (sector = first 3 digits,
 * industryGroup = first 5, industry = full code) so the heatmap's "group by sector" resolves labels.
 */
public final class DxfeedInstruments {

    private DxfeedInstruments() {
    }

    public static final String HEATMAP_TRADING_HOURS_ID = "US_EQUITY_REGULAR";

    private static final String SEED_RESOURCE = "/dxfeed/instruments.ipf";

    /** Instrument reference seed (framework-free). */
    public record InstrumentSeed(
        String symbol,
        String description,
        String industryCode,
        long marketCapUsd,
        double changePercent1d) {
    }

    /** Deterministic per-symbol secondary metrics (RNG-derived; stable across requests). */
    public record DerivedMetrics(
        long volume,
        long avgVolume30d,
        double pcfRatio,
        double pbRatio,
        double psRatio,
        double dividendYieldPercent,
        double eps) {
    }

    /** Seed + derived metrics. */
    public record ResolvedInstrument(InstrumentSeed seed, DerivedMetrics metrics) {
    }

    /** Loaded once from {@link #SEED_RESOURCE} on class init. */
    public static final List<InstrumentSeed> MOCK_INSTRUMENTS = loadSeed();

    private static List<InstrumentSeed> loadSeed() {
        List<InstrumentSeed> seeds = new ArrayList<>();
        try (InputStream in = DxfeedInstruments.class.getResourceAsStream(SEED_RESOURCE)) {
            if (in == null) {
                throw new IllegalStateException("Missing seed resource: " + SEED_RESOURCE);
            }
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (!line.startsWith("STOCK,")) {
                        continue; // skip the #header, # comments and the ##COMPLETE footer
                    }
                    // TYPE,SYMBOL,DESCRIPTION,MORNINGSTAR_INDUSTRY_CODE,MARKET_CAP,CHANGE_1D
                    String[] f = line.split(",", -1);
                    seeds.add(new InstrumentSeed(
                        f[1], f[2], f[3], Long.parseLong(f[4].trim()), Double.parseDouble(f[5].trim())));
                }
            }
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to load " + SEED_RESOURCE, e);
        }
        return List.copyOf(seeds);
    }

    public static DerivedMetrics deriveMetrics(InstrumentSeed seed) {
        Random random = new Random(seed.symbol().hashCode());
        long volume = Math.round(5_000_000 + random.nextDouble() * 45_000_000);

        return new DerivedMetrics(
            volume,
            Math.round(volume * (0.8 + random.nextDouble() * 0.4)),
            round2(8 + random.nextDouble() * 20),
            round2(1 + random.nextDouble() * 12),
            round2(1 + random.nextDouble() * 10),
            round2(random.nextDouble() * 3),
            round2(1 + random.nextDouble() * 12));
    }

    public static List<ResolvedInstrument> resolveInstruments() {
        return MOCK_INSTRUMENTS.stream()
            .map(seed -> new ResolvedInstrument(seed, deriveMetrics(seed)))
            .toList();
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
