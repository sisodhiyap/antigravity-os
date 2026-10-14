import { NextRequest, NextResponse } from "next/server";
import { resolveIntelligenceUser } from "@/server/intelligence/auth-util";
import { intelligenceEngine } from "@/server/intelligence/intelligence-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await resolveIntelligenceUser(req);
    const tasks = await intelligenceEngine.getTasks(user.id);
    return NextResponse.json({ success: true, data: tasks });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await resolveIntelligenceUser(req);
    const body = await req.json().catch(() => ({}));

    if (!body.title) {
      return NextResponse.json({ success: false, error: "Task title is required" }, { status: 400 });
    }

    const task = await intelligenceEngine.createTask({
      userId: user.id,
      conversationId: body.conversationId,
      title: body.title,
      description: body.description || body.title,
      actionType: body.actionType || "READ_ONLY",
      targetResource: body.targetResource || "workspace",
      privacyLevel: body.privacyLevel,
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create task" },
      { status: 500 }
    );
  }
}
