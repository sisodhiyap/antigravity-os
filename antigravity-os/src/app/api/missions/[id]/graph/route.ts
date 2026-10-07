import { NextRequest, NextResponse } from "next/server";
import { MissionEngine } from "@/mission/MissionEngine";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const engine = MissionEngine.getInstance();
  const mission = engine.getMission(id);

  if (!mission) {
    return NextResponse.json({ success: false, error: "Mission not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    graph: mission.graph.toJSON()
  });
}
