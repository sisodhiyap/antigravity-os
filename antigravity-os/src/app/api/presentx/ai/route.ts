import { NextRequest, NextResponse } from "next/server";
import { PresentXOrchestrator } from "@/presentx/engine/PresentXOrchestrator";
import { PresentationProject, AiSlideCommandRequest } from "@/presentx/types";

export async function POST(req: NextRequest) {
  try {
    const body: { project: PresentationProject; request: AiSlideCommandRequest } = await req.json();
    if (!body.project || !body.request) {
      return NextResponse.json({ success: false, error: "Missing project or request payload" }, { status: 400 });
    }

    const orchestrator = PresentXOrchestrator.getInstance();
    const updatedProject = await orchestrator.executeSlideAiCommand(body.project, body.request);

    return NextResponse.json({
      success: true,
      project: updatedProject,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
