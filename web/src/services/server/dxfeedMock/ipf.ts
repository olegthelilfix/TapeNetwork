import "server-only";

import { HEATMAP_TRADING_HOURS_ID, MOCK_INSTRUMENTS } from "@/domain/heatmap";

// Mirrors dxFeed's classic IPF text format: a `#TYPE::=col,col,...` header
// per instrument type, followed by CSV rows whose first field is that TYPE.
const IPF_COLUMNS = ["TYPE", "SYMBOL", "DESCRIPTION", "TRADING_HOURS", "COUNTRY", "CURRENCY"] as const;

const TEXT_SEARCH_LIMIT = 20;

export type IpfQuery = {
    readonly symbols?: readonly string[];
    readonly text?: string;
};

export const buildIpfCsv = (query: IpfQuery): string => {
    const symbolSet = query.symbols && query.symbols.length > 0 ? new Set(query.symbols) : undefined;
    const textQuery = query.text?.trim().toLowerCase();

    let rows = MOCK_INSTRUMENTS;
    if (symbolSet) {
        rows = rows.filter((instrument) => symbolSet.has(instrument.symbol));
    } else if (textQuery) {
        rows = rows
            .filter(
                (instrument) =>
                    instrument.symbol.toLowerCase().includes(textQuery) ||
                    instrument.description.toLowerCase().includes(textQuery),
            )
            .slice(0, TEXT_SEARCH_LIMIT);
    }

    const lines = [
        `#STOCK::=${IPF_COLUMNS.join(",")}`,
        ...rows.map((instrument) =>
            ["STOCK", instrument.symbol, instrument.description, HEATMAP_TRADING_HOURS_ID, "US", "USD"].join(","),
        ),
        "##COMPLETE",
    ];

    return lines.join("\n");
};
