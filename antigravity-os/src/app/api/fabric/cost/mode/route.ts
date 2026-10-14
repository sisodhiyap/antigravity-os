import { NextRequest, NextResponse } from "next/server";
import { sovereignTaskRouter } from "@/server/fabric/cost/task-router";
import { TaskRoutingPolicyMode } from "@/server/fabric/cost/types";

export async function GET(req: NextRequest) {
  try {
    const mode = sovereignTaskRouter.getMode();
    return NextResponse.json({ success: true, mode });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mode: TaskRoutingPolicyMode = body.mode;

    const validModes: TaskRoutingPolicyMode[] = ["STRICT_LOCAL", "LOCAL_FIRST", "HYBRID", "CLOUD_ONLY"];
    if (!validModes.includes(mode)) {
      return NextResponse.json(
        { success: false, error: `Invalid mode. Must be one of: ${validModes.join(", ")}` },
        { status: 400 }
      );
    }

    sovereignTaskRouter.setMode(mode);

    return NextResponse.json({
      success: true,
      mode: sovereignTaskRouter.getMode(),
      message: `Task Routing Policy transitioned to ${mode}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
