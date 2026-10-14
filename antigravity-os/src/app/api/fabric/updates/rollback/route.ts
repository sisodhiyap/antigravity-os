import { NextRequest, NextResponse } from "next/server";
import { upstreamUpdateManager } from "@/server/fabric/updates/update-manager";
import { FabricEngineId } from "@/server/fabric/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { engineId } = body;

    if (!engineId) {
      return NextResponse.json({ success: false, error: "engineId is required." }, { status: 400 });
    }

    const result = await upstreamUpdateManager.rollbackEngine(engineId as FabricEngineId);

    return NextResponse.json({
      success: true,
      restoredVersion: result.restoredVersion,
      rollbackSnapshotId: result.rollbackSnapshotId,
      message: `Engine ${engineId} rolled back to verified snapshot ${result.restoredVersion}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
