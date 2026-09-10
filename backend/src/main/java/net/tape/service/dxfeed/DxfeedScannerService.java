package net.tape.service.dxfeed;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.regex.Pattern;

import net.tape.service.dxfeed.DxfeedInstruments.ResolvedInstrument;

/**
 * Mock dxFeed Scanner (screener snapshot) service — ported as-is from
 * {@code web/src/services/server/dxfeedMock/scanner.ts}. Answers the specific datapoint/filter
 * queries the heatmap builds; secondary metrics come from the PRNG in {@link DxfeedInstruments}
 * (real fundamentals are a later step).
 */
@Service
public class DxfeedScannerService {

    // Expression strings are the exact ones @dx-display/data-points builds for the heatmap's
    // group-by / size-by / color-by selectors.
    private static final Pattern CHANGE_RATIO_PATTERN = Pattern.compile("^change(FromClose|FromOpen)Ratio\\(");
    private static final Pattern GAP_RATIO_PATTERN = Pattern.compile("^gapRatio\\(");
    private static final Pattern VOLUME_AVG_PATTERN = Pattern.compile("^volumeAvg\\(");
    private static final Pattern VOLUME_PATTERN = Pattern.compile("^volume\\(");

    public record Datapoint(String name, String expr) {
    }

    public record FilterAlternative(String predicate, List<Object> args, Boolean not) {
    }

    public record Filter(int datapoint, Boolean not, List<FilterAlternative> alternatives) {
    }

    public record Options(Integer snapshotSize) {
    }

    public record SnapshotRequest(
        String instrumentCategory,
        List<Datapoint> datapoints,
        List<Filter> filters,
        Options options) {
    }

    public record Entry(String symbol, List<Object> outputs) {
    }

    public record SnapshotResponse(List<String> outputNames, List<Entry> entries) {
    }

    public SnapshotResponse buildSnapshot(SnapshotRequest request) {
        List<Datapoint> datapoints = request.datapoints() != null ? request.datapoints() : List.of();
        List<String> exprs = datapoints.stream()
            .map(datapoint -> datapoint.expr() != null ? datapoint.expr() : datapoint.name())
            .toList();
        List<Filter> filters = request.filters() != null ? request.filters() : List.of();

        List<ResolvedInstrument> instruments = DxfeedInstruments.resolveInstruments();

        // Small per-request wiggle on the "live" fields (± 0.3pp) so a fixed widget refresh still
        // shows movement, without needing a real feed.
        java.util.Map<String, Double> changeJitterBySymbol = new java.util.HashMap<>();
        for (ResolvedInstrument instrument : instruments) {
            changeJitterBySymbol.put(instrument.seed().symbol(), (Math.random() - 0.5) * 0.6);
        }

        Integer snapshotSize = request.options() != null ? request.options().snapshotSize() : null;

        List<Entry> entries = new ArrayList<>();
        for (ResolvedInstrument instrument : instruments) {
            if (!matchesFilters(instrument, filters, exprs)) {
                continue;
            }
            if (snapshotSize != null && entries.size() >= snapshotSize) {
                break;
            }
            double jitter = changeJitterBySymbol.getOrDefault(instrument.seed().symbol(), 0.0);
            List<Object> outputs = new ArrayList<>(exprs.size());
            for (String expr : exprs) {
                outputs.add(resolveDatapointValue(expr, instrument, jitter));
            }
            entries.add(new Entry(instrument.seed().symbol(), outputs));
        }

        return new SnapshotResponse(exprs, entries);
    }

    private static boolean matchesFilters(ResolvedInstrument instrument, List<Filter> filters, List<String> exprs) {
        for (Filter filter : filters) {
            int idx = filter.datapoint();
            String expr = idx >= 0 && idx < exprs.size() ? exprs.get(idx) : null;
            if (expr == null) {
                continue; // exprs[filter.datapoint] undefined -> filter passes
            }
            Object value = resolveDatapointValue(expr, instrument, 0);
            List<FilterAlternative> alternatives = filter.alternatives() != null ? filter.alternatives() : List.of();
            boolean anyMatched = false;
            for (FilterAlternative alternative : alternatives) {
                boolean not = Boolean.TRUE.equals(alternative.not());
                if (matchesPredicate(alternative.predicate(), value, alternative.args()) != not) {
                    anyMatched = true;
                    break;
                }
            }
            if (anyMatched == Boolean.TRUE.equals(filter.not())) {
                return false;
            }
        }
        return true;
    }

    private static Object resolveDatapointValue(String expr, ResolvedInstrument instrument, double changeJitter) {
        DxfeedInstruments.InstrumentSeed seed = instrument.seed();
        DxfeedInstruments.DerivedMetrics metrics = instrument.metrics();
        switch (expr) {
            case "symbol":
                return seed.symbol();
            case "fundamental.morningstarIndustryCode":
                return seed.industryCode();
            case "fundamental.marketCap":
                return seed.marketCapUsd();
            case "fundamental.pcfRatio":
                return metrics.pcfRatio();
            case "fundamental.pbRatio":
                return metrics.pbRatio();
            case "fundamental.psRatio":
                return metrics.psRatio();
            case "fundamental.forwardDividendYield*100":
                return metrics.dividendYieldPercent();
            case "fundamental.eps":
                return metrics.eps();
            default:
                break;
        }

        if (CHANGE_RATIO_PATTERN.matcher(expr).find()) {
            return round2(seed.changePercent1d() + changeJitter);
        }
        if (GAP_RATIO_PATTERN.matcher(expr).find()) {
            return round2(changeJitter * 0.5);
        }
        if (VOLUME_AVG_PATTERN.matcher(expr).find()) {
            return metrics.avgVolume30d();
        }
        if (VOLUME_PATTERN.matcher(expr).find()) {
            return metrics.volume();
        }
        return null;
    }

    private static boolean matchesPredicate(String predicate, Object value, List<Object> args) {
        List<Object> a = args != null ? args : List.of();
        return switch (predicate) {
            case "anyOf" -> a.stream().anyMatch(arg -> strictEquals(arg, value));
            case "==" -> !a.isEmpty() && strictEquals(a.getFirst(), value);
            case "<" -> isNumber(value) && isNumber(first(a)) && asDouble(value) < asDouble(first(a));
            case "<=" -> isNumber(value) && isNumber(first(a)) && asDouble(value) <= asDouble(first(a));
            case ">" -> isNumber(value) && isNumber(first(a)) && asDouble(value) > asDouble(first(a));
            case ">=" -> isNumber(value) && isNumber(first(a)) && asDouble(value) >= asDouble(first(a));
            default ->
                // Unsupported predicate: stay permissive rather than dropping rows.
                    true;
        };
    }

    private static Object first(List<Object> args) {
        return args.isEmpty() ? null : args.getFirst();
    }

    private static boolean isNumber(Object o) {
        return o instanceof Number;
    }

    private static double asDouble(Object o) {
        return ((Number) o).doubleValue();
    }

    /** JS strict {@code ===}: numbers compare by value, otherwise by equals. */
    private static boolean strictEquals(Object a, Object b) {
        if (a instanceof Number && b instanceof Number) {
            return ((Number) a).doubleValue() == ((Number) b).doubleValue();
        }
        return Objects.equals(a, b);
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
