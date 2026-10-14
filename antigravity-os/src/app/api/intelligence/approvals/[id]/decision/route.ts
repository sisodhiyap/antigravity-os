import { NextRequest, NextResponse } from "next/server";
import { resolveIntelligenceUser } from "@/server/intelligence/auth-util";
import { intelligenceEngine } from "@/server/intelligence/intelligence-engine";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await resolveIntelligenceUser(req);
    const body = await req.json().catch(() => ({}));
    const decision = body.decision; // "APPROVE" or "REJECT"

    if (decision !== "APPROVE" && decision !== "REJECT") {
      return NextResponse.json(
        { success: false, error: "Decision must be 'APPROVE' or 'REJECT'" },
        { status: 400 }
      );
    }

    const updated = await intelligenceEngine.decideApproval(id, user.id, decision);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process approval decision" },
      { status: 500 }
    );
  }
}
