import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => {
    return {};
});

import { buildIpfCsv } from "./ipf";

describe("buildIpfCsv", () => {
    it("declares STOCK columns starting with TYPE, matching the row shape", () => {
        const csv = buildIpfCsv({ symbols: ["AAPL"] });
        const [header] = csv.split("\n");

        expect(header).toBe("#STOCK::=TYPE,SYMBOL,DESCRIPTION,TRADING_HOURS,COUNTRY,CURRENCY");
    });

    it("filters to the requested symbol list", () => {
        const csv = buildIpfCsv({ symbols: ["AAPL", "MSFT"] });
        const rows = csv.split("\n").filter((line) => line.startsWith("STOCK,"));

        expect(rows).toHaveLength(2);
        expect(rows[0]).toContain("AAPL");
        expect(rows[1]).toContain("MSFT");
    });

    it("returns every instrument when no symbols or text are given", () => {
        const csv = buildIpfCsv({});
        const rows = csv.split("\n").filter((line) => line.startsWith("STOCK,"));

        expect(rows.length).toBeGreaterThan(40);
    });

    it("matches by symbol or description substring in text-search mode", () => {
        const csv = buildIpfCsv({ text: "apple" });
        const rows = csv.split("\n").filter((line) => line.startsWith("STOCK,"));

        expect(rows).toHaveLength(1);
        expect(rows[0]).toContain("AAPL");
    });

    it("ends with the ##COMPLETE footer", () => {
        const csv = buildIpfCsv({ symbols: ["AAPL"] });

        expect(csv.split("\n").at(-1)).toBe("##COMPLETE");
    });
});
