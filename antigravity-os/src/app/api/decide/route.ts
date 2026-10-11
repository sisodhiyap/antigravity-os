import { NextRequest, NextResponse } from "next/server";
import { aiRouter } from "@/server/ai/router";
import { strandsDecider } from "@/server/ai/strands-decider";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { task, context, availableCapabilities } = body;

    if (!task || typeof task !== "string") {
      return NextResponse.json(
        { success: false, error: "Task description must be a non-empty string" },
        { status: 400 }
      );
    }

    const decision = await aiRouter.decide(task, context, availableCapabilities);

    return NextResponse.json({
      success: true,
      data: decision,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to execute decision" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const health = await strandsDecider.checkHealth();
  return NextResponse.json({
    success: true,
    data: {
      engine: "strands-decider",
      endpointUrl: strandsDecider.getEndpointUrl(),
      isDaemonAvailable: health.available,
      latencyMs: health.latencyMs,
      details: health.details,
    },
  });
}
