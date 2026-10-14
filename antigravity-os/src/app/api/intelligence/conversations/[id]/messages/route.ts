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
    const messageContent = body.content || body.message;

    if (!messageContent || typeof messageContent !== "string" || !messageContent.trim()) {
      return NextResponse.json({ success: false, error: "Message content cannot be empty" }, { status: 400 });
    }

    const result = await intelligenceEngine.processUserMessage(
      id,
      user.id,
      user.email,
      messageContent.trim()
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process message" },
      { status: 500 }
    );
  }
}
