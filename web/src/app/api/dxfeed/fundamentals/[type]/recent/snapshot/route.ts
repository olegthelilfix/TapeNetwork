import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { buildFundamentalsSnapshot } from "@/services/server/dxfeedMock";

// The Summer Fox AI Fundamentals panel fetches company data via
// GET {fundamentalsPath}/{event-type}/recent/snapshot?symbols=SYM. The event
// type is the [type] path segment (company-profile, instrument-reference,
// asset-classification, instrument-daily-summary, valuation-ratio). The response
// is a record keyed by symbol -> array of one event.
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ type: string }> },
): Promise<NextResponse> {
    const { type } = await context.params;
    const symbols = request.nextUrl.searchParams.getAll("symbols").flatMap((s) => s.split(",")).filter(Boolean);
    const list = symbols.length > 0 ? symbols : ["AAPL"];

    return NextResponse.json(buildFundamentalsSnapshot(type, list));
}
