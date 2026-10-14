import { NextRequest, NextResponse } from "next/server";
import { resolveIntelligenceUser } from "@/server/intelligence/auth-util";
import { intelligenceEngine } from "@/server/intelligence/intelligence-engine";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await resolveIntelligenceUser(req);
    const result = await intelligenceEngine.getConversation(id, user.id);
    if (!result) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await resolveIntelligenceUser(req);
    const deleted = await intelligenceEngine.deleteConversation(id, user.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Conversation deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
