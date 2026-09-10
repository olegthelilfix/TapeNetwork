import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => {
    return {};
});

import { buildScannerSnapshot, type ScannerSnapshotRequest } from "./scanner";

describe("buildScannerSnapshot", () => {
    it("returns outputNames in the same order as the requested datapoints", () => {
        const request: ScannerSnapshotRequest = {
            instrumentCategory: "UNDERLYING",
            datapoints: [{ name: "symbol" }, { name: "fundamental.marketCap" }],
        };

        const result = buildScannerSnapshot(request);

        expect(result.outputNames).toEqual(["symbol", "fundamental.marketCap"]);
    });

    it("resolves known fundamental and classification expressions", () => {
        const request: ScannerSnapshotRequest = {
            instrumentCategory: "UNDERLYING",
            datapoints: [
                { name: "symbol" },
                { name: "industry", expr: "fundamental.morningstarIndustryCode" },
                { name: "cap", expr: "fundamental.marketCap" },
            ],
            filters: [
                {
                    datapoint: 0,
                    alternatives: [{ predicate: "anyOf", args: ["AAPL"] }],
                },
            ],
        };

        const result = buildScannerSnapshot(request);

        expect(result.entries).toHaveLength(1);
        expect(result.entries[0]).toEqual({
            symbol: "AAPL",
            outputs: ["AAPL", "31120030", 3_400_000_000_000],
        });
    });

    it("resolves candle-based change expressions to a number near the seed value", () => {
        const request: ScannerSnapshotRequest = {
            instrumentCategory: "UNDERLYING",
            datapoints: [{ name: "symbol" }, { name: "change", expr: 'changeFromCloseRatio(candlePeriod="1d",session="all")*100' }],
            filters: [{ datapoint: 0, alternatives: [{ predicate: "anyOf", args: ["MSFT"] }] }],
        };

        const result = buildScannerSnapshot(request);
        const change = result.entries[0]?.outputs[1];

        expect(typeof change).toBe("number");
        expect(change as number).toBeGreaterThan(0.5 - 0.31);
        expect(change as number).toBeLessThan(0.5 + 0.31);
    });

    it("returns null for an unrecognized expression instead of throwing", () => {
        const request: ScannerSnapshotRequest = {
            instrumentCategory: "UNDERLYING",
            datapoints: [{ name: "symbol" }, { name: "unknown", expr: "fundamental.doesNotExist" }],
            filters: [{ datapoint: 0, alternatives: [{ predicate: "anyOf", args: ["AAPL"] }] }],
        };

        const result = buildScannerSnapshot(request);

        expect(result.entries[0]?.outputs[1]).toBeNull();
    });

    it("caps results to options.snapshotSize", () => {
        const request: ScannerSnapshotRequest = {
            instrumentCategory: "UNDERLYING",
            datapoints: [{ name: "symbol" }],
            options: { snapshotSize: 3 },
        };

        const result = buildScannerSnapshot(request);

        expect(result.entries).toHaveLength(3);
    });
});
