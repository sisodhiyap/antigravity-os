import { NextRequest, NextResponse } from "next/server";
import { MissionEngine } from "@/mission/MissionEngine";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const engine = MissionEngine.getInstance();
    const result = await engine.startMission(id, { autoApproveHumanGates: true });

    return NextResponse.json({
      success: result.success,
      missionId: id,
      state: result.state.toJSON(),
      graph: result.graph.toJSON()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 400 });
  }
}
