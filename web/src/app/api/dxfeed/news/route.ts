import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { buildNews } from "@/services/server/dxfeedMock";

// The News widget GETs {newsPath} with query: symbol (csv), limit, timeout,
// actualOnly, body (bool), optional pollingId. It parses the response as NewsData
// { lastId, news: NewsArticle[] } (or FullNewsData when body=true).
export function GET(request: NextRequest): NextResponse {
    const params = request.nextUrl.searchParams;
    const symbolParam = params.get("symbol");
    const symbols = symbolParam ? symbolParam.split(",").filter(Boolean) : undefined;
    const withBody = params.get("body") === "true";
    const limit = Number(params.get("limit")) || undefined;

    return NextResponse.json(buildNews({ symbols, withBody, limit }));
}
