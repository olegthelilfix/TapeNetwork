import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { buildEconomicCalendar } from "@/services/server/dxfeedMock";

// The @dx-display economic-calendar widget fetches events via
// GET {fundamentalsPath}/{eventType}/recent/calendar — here eventType is the
// literal "EconomicCalendar" path segment — with query params fromYmd, toYmd,
// countryCodes (repeated), plus sources/mics we ignore. It parses the JSON body
// as an array of EconomicCalendarEvent, so we return the mock array directly.
export function GET(request: NextRequest): NextResponse {
    const params = request.nextUrl.searchParams;
    const fromYmd = params.get("fromYmd") ?? undefined;
    const toYmd = params.get("toYmd") ?? undefined;
    const countryCodes = params.getAll("countryCodes");

    const events = buildEconomicCalendar({
        fromYmd,
        toYmd,
        countryCodes: countryCodes.length > 0 ? countryCodes : undefined,
    });

    return NextResponse.json(events);
}
