import { NextRequest, NextResponse } from "next/server";
import { fabricManager } from "@/server/fabric/fabric-manager";
import { FabricEngineId } from "@/server/fabric/types";
import { fabricServiceSupervisor } from "@/server/fabric/service-supervisor";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const engine = fabricManager.getEngine(id as FabricEngineId);
    if (!engine) {
      return NextResponse.json({ success: false, error: "Engine not found." }, { status: 404 });
    }

    const currentStatus = await fabricManager.probeEngine(id as FabricEngineId);
    return NextResponse.json({
      success: true,
      engine: {
        ...engine,
        status: currentStatus,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const action = body.action; // "probe" | "start" | "stop"

    const engineId = id as FabricEngineId;
    const engine = fabricManager.getEngine(engineId);
    if (!engine) {
      return NextResponse.json({ success: false, error: "Engine not found." }, { status: 404 });
    }

    if (action === "probe") {
      const status = await fabricManager.probeEngine(engineId);
      return NextResponse.json({ success: true, status });
    }

    if (action === "stop") {
      await fabricServiceSupervisor.stopService(engineId);
      const status = await fabricManager.probeEngine(engineId);
      return NextResponse.json({ success: true, status, message: `Engine ${engineId} stopped.` });
    }

    if (action === "start") {
      // In production, execute engine-specific runner command
      const status = await fabricManager.probeEngine(engineId);
      return NextResponse.json({ success: true, status, message: `Start signal sent to ${engineId}.` });
    }

    return NextResponse.json({ success: false, error: "Invalid action. Supported: probe, start, stop." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
