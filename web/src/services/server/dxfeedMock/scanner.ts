import "server-only";

import { type ResolvedInstrument,resolveInstruments } from "@/domain/heatmap";

export type ScannerDatapoint = {
    readonly name: string;
    readonly expr?: string;
};

export type ScannerFilterAlternative = {
    readonly predicate: string;
    readonly args: readonly (string | number)[];
    readonly not?: boolean;
};

export type ScannerFilter = {
    readonly datapoint: number;
    readonly not?: boolean;
    readonly alternatives?: readonly ScannerFilterAlternative[];
};

export type ScannerSnapshotRequest = {
    readonly instrumentCategory: string;
    readonly datapoints?: readonly ScannerDatapoint[];
    readonly filters?: readonly ScannerFilter[];
    readonly options?: { readonly snapshotSize?: number };
};

export type ScannerSnapshotResponse = {
    readonly outputNames: readonly string[];
    readonly entries: readonly {
        readonly symbol: string;
        readonly outputs: readonly (string | number | boolean | null)[];
    }[];
};

// Expression strings are the exact ones @dx-display/data-points builds for the
// heatmap's group-by/size-by/color-by selectors (reverse-engineered from
// @dx-display/data-points/scanner and the color-by/size-by id maps).
const CHANGE_RATIO_PATTERN = /^change(FromClose|FromOpen)Ratio\(/;
const GAP_RATIO_PATTERN = /^gapRatio\(/;
const VOLUME_AVG_PATTERN = /^volumeAvg\(/;
const VOLUME_PATTERN = /^volume\(/;

const resolveDatapointValue = (
    expr: string,
    instrument: ResolvedInstrument,
    changeJitter: number,
): string | number | null => {
    switch (expr) {
        case "symbol":
            return instrument.symbol;
        case "fundamental.morningstarIndustryCode":
            return instrument.industryCode;
        case "fundamental.marketCap":
            return instrument.marketCapUsd;
        case "fundamental.pcfRatio":
            return instrument.pcfRatio;
        case "fundamental.pbRatio":
            return instrument.pbRatio;
        case "fundamental.psRatio":
            return instrument.psRatio;
        case "fundamental.forwardDividendYield*100":
            return instrument.dividendYieldPercent;
        case "fundamental.eps":
            return instrument.eps;
        default:
            break;
    }

    if (CHANGE_RATIO_PATTERN.test(expr)) {
        return Number((instrument.changePercent1d + changeJitter).toFixed(2));
    }
    if (GAP_RATIO_PATTERN.test(expr)) {
        return Number((changeJitter * 0.5).toFixed(2));
    }
    if (VOLUME_AVG_PATTERN.test(expr)) {
        return instrument.avgVolume30d;
    }
    if (VOLUME_PATTERN.test(expr)) {
        return instrument.volume;
    }

    return null;
};

const matchesPredicate = (predicate: string, value: unknown, args: readonly (string | number)[]): boolean => {
    switch (predicate) {
        case "anyOf":
            return args.some((arg) => arg === value);
        case "==":
            return args[0] === value;
        case "<":
            return typeof value === "number" && typeof args[0] === "number" && value < args[0];
        case "<=":
            return typeof value === "number" && typeof args[0] === "number" && value <= args[0];
        case ">":
            return typeof value === "number" && typeof args[0] === "number" && value > args[0];
        case ">=":
            return typeof value === "number" && typeof args[0] === "number" && value >= args[0];
        default:
            // Unsupported predicate: stay permissive rather than dropping rows.
            return true;
    }
};

export const buildScannerSnapshot = (request: ScannerSnapshotRequest): ScannerSnapshotResponse => {
    const datapoints = request.datapoints ?? [];
    const exprs = datapoints.map((datapoint) => datapoint.expr ?? datapoint.name);
    const filters = request.filters ?? [];

    // Small per-request wiggle on the "live" fields (± 0.3pp) so a fixed 5-min
    // widget refresh still shows movement, without needing a real feed.
    const changeJitterBySymbol = new Map<string, number>(
        resolveInstruments().map((instrument) => [instrument.symbol, (Math.random() - 0.5) * 0.6]),
    );

    const matchesFilters = (instrument: ResolvedInstrument): boolean => {
        return filters.every((filter) => {
            const expr = exprs[filter.datapoint];
            if (expr === undefined) {
                return true;
            }

            const value = resolveDatapointValue(expr, instrument, 0);
            const alternatives = filter.alternatives ?? [];
            const anyMatched = alternatives.some(
                (alternative) => matchesPredicate(alternative.predicate, value, alternative.args) !== Boolean(alternative.not),
            );

            return anyMatched !== Boolean(filter.not);
        });
    };

    const snapshotSize = request.options?.snapshotSize;

    const entries = resolveInstruments()
        .filter(matchesFilters)
        .slice(0, snapshotSize ?? Number.MAX_SAFE_INTEGER)
        .map((instrument) => ({
            symbol: instrument.symbol,
            outputs: exprs.map((expr) =>
                resolveDatapointValue(expr, instrument, changeJitterBySymbol.get(instrument.symbol) ?? 0),
            ),
        }));

    return { outputNames: exprs, entries };
};
