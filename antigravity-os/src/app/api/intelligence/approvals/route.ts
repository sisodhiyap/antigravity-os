import { NextRequest, NextResponse } from "next/server";
import { resolveIntelligenceUser } from "@/server/intelligence/auth-util";
import { intelligenceEngine } from "@/server/intelligence/intelligence-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await resolveIntelligenceUser(req);
    const approvals = await intelligenceEngine.getPendingApprovals(user.id);
    return NextResponse.json({ success: true, data: approvals });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch approvals" },
      { status: 500 }
    );
  }
}
