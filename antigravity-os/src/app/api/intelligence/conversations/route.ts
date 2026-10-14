import { NextRequest, NextResponse } from "next/server";
import { resolveIntelligenceUser } from "@/server/intelligence/auth-util";
import { intelligenceEngine } from "@/server/intelligence/intelligence-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await resolveIntelligenceUser(req);
    const convos = await intelligenceEngine.getConversations(user.id);
    return NextResponse.json({ success: true, data: convos });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await resolveIntelligenceUser(req);
    const body = await req.json().catch(() => ({}));
    const convo = await intelligenceEngine.createConversation(
      user.id,
      body.title || "New Discussion",
      body.privacyLevel || "LOCAL_PREFERRED",
      body.projectId
    );
    return NextResponse.json({ success: true, data: convo }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create conversation" },
      { status: 500 }
    );
  }
}
