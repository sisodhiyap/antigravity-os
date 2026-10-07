import { NextRequest, NextResponse } from "next/server";
import { MissionEngine } from "@/mission/MissionEngine";

export async function GET() {
  const engine = MissionEngine.getInstance();
  const missions = engine.getAllMissions();
  return NextResponse.json({ success: true, count: missions.length, data: missions });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const engine = MissionEngine.getInstance();
    const created = engine.createMission({
      prompt: body.prompt || "Autonomous Engineering Mission",
      targetAppDir: body.targetAppDir || "c:\\D drive\\Antigravity\\creative-agency-pm",
      requireHumanApproval: body.requireHumanApproval,
      modelPreference: body.modelPreference
    });

    return NextResponse.json({
      success: true,
      missionId: created.missionId,
      state: created.state.toJSON(),
      graph: created.graph.toJSON()
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 400 });
  }
}
