import { NextRequest, NextResponse } from "next/server";
import { EngineeringHarness } from "@/harness/EngineeringHarness";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const report = await EngineeringHarness.executeFullPipeline({
      appPort: body.appPort || 3400
    });

    return NextResponse.json({
      success: report.overallStatus === "PASS",
      data: report
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
