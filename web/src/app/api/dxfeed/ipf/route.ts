import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { buildIpfCsv } from "@/services/server/dxfeedMock";

export function GET(request: NextRequest): NextResponse {
    const symbolParam = request.nextUrl.searchParams.get("SYMBOL");
    const symbols = symbolParam ? symbolParam.split(",").filter(Boolean) : undefined;
    const text = request.nextUrl.searchParams.get("text") ?? undefined;

    const body = buildIpfCsv({ symbols, text });

    return new NextResponse(body, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
