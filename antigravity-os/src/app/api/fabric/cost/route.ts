import { NextRequest, NextResponse } from "next/server";
import { usageLedger } from "@/server/fabric/cost/usage-ledger";

export async function GET(req: NextRequest) {
  try {
    const metrics = usageLedger.getOptimizationMetrics();
    const budgetConfig = usageLedger.getBudgetConfig();
    const recentLedger = usageLedger.getRecentLedger(20);

    return NextResponse.json({
      success: true,
      metrics,
      budgetConfig,
      recentLedger,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.budgetConfig) {
      usageLedger.updateBudgetConfig(body.budgetConfig);
    }

    return NextResponse.json({
      success: true,
      budgetConfig: usageLedger.getBudgetConfig(),
      message: "Budget configuration updated successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
