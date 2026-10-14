import { NextRequest, NextResponse } from "next/server";
import { upstreamUpdateManager } from "@/server/fabric/updates/update-manager";
import { FabricEngineId } from "@/server/fabric/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { engineId, simulateFailure } = body;

    if (!engineId) {
      return NextResponse.json({ success: false, error: "engineId is required." }, { status: 400 });
    }

    const result = await upstreamUpdateManager.stageAndTestUpdate(
      engineId as FabricEngineId,
      Boolean(simulateFailure)
    );

    return NextResponse.json({
      success: result.success,
      status: result.status,
      manifest: result.manifest,
      error: result.error,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
