import { NextResponse } from "next/server";
import { aiRouter } from "@/server/ai/router";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const benchmarkResult = await aiRouter.benchmarkDecider();
    return NextResponse.json({
      success: true,
      data: benchmarkResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to execute benchmark" },
      { status: 500 }
    );
  }
}
