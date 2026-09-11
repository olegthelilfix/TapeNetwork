import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { buildReport, type ReportProfile } from "@/services/server/dxfeedMock";

// The Summer Fox AI widget POSTs to {reportPath} with a JSON body of [symbol]
// and query params llm_profile (quick|detailed) + language. It parses the
// response as { symbol_summaries: ReportItemData[] }, so we return that shape.
export async function POST(request: NextRequest): Promise<NextResponse> {
    const profile = (request.nextUrl.searchParams.get("llm_profile") as ReportProfile) ?? "quick";

    let symbols: string[] = [];
    try {
        const body = (await request.json()) as unknown;
        if (Array.isArray(body)) {
            symbols = body.filter((s): s is string => typeof s === "string");
        }
    } catch {
        symbols = [];
    }

    const symbol = symbols[0] ?? "AAPL";
    const report = buildReport(symbol, profile === "detailed" ? "detailed" : "quick");

    return NextResponse.json(report);
}
