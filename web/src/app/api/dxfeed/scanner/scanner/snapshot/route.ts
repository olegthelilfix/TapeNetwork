import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { buildScannerSnapshot, type ScannerSnapshotRequest } from "@/services/server/dxfeedMock";

export async function POST(request: NextRequest): Promise<NextResponse> {
    const body = (await request.json()) as ScannerSnapshotRequest;

    return NextResponse.json(buildScannerSnapshot(body));
}
