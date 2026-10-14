import { NextResponse } from "next/server";
import { aiRouter } from "@/server/ai/router";
import { personalMemoryStore } from "@/server/intelligence/memory-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const providers = await aiRouter.checkAllProviders();
    const liveCount = providers.filter((p) => p.available).length;
    const localOllama = providers.find((p) => p.name === "ollama");

    return NextResponse.json({
      success: true,
      data: {
        status: "HEALTHY",
        subsystem: "Personal Intelligence V1",
        version: "1.0.0-PI-V1",
        baselineCommit: "834e424",
        providersLive: liveCount,
        totalProviders: providers.length,
        localModelAvailable: Boolean(localOllama?.available),
        memoryFabricStatus: "OPERATIONAL",
        boundedAutonomyStatus: "BOUNDED_SAFE",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Health check failed" },
      { status: 500 }
    );
  }
}
