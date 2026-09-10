import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { buildScheduleResponse, type ScheduleRequest } from "@/services/server/dxfeedMock";

export async function POST(request: NextRequest): Promise<NextResponse> {
    const body = (await request.json()) as ScheduleRequest;

    return NextResponse.json(buildScheduleResponse(body));
}
