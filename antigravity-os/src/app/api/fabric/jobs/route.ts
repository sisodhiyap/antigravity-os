import { NextRequest, NextResponse } from "next/server";
import { fabricGpuScheduler } from "@/server/fabric/gpu-scheduler";
import { fabricManager } from "@/server/fabric/fabric-manager";
import { FabricEngineId } from "@/server/fabric/types";

export async function GET(req: NextRequest) {
  try {
    const queueState = fabricGpuScheduler.getQueueState();
    return NextResponse.json({
      success: true,
      queueState,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { engineId, taskType, payload } = body;

    if (!engineId || !taskType) {
      return NextResponse.json(
        { success: false, error: "engineId and taskType are required." },
        { status: 400 }
      );
    }

    const job = await fabricManager.executeTask(engineId as FabricEngineId, taskType, payload || {});

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
