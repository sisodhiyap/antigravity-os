import { NextRequest, NextResponse } from "next/server";
import { GraniteBenchmarkEngine } from "@/plugins/granite";

export async function POST(req: NextRequest) {
  try {
    const engine = GraniteBenchmarkEngine.getInstance();
    const benchmarkResult = await engine.runFullBenchmark();

    return NextResponse.json({
      success: true,
      benchmarkResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
