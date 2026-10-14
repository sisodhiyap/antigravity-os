import { NextRequest, NextResponse } from "next/server";
import { resolveIntelligenceUser } from "@/server/intelligence/auth-util";
import { personalMemoryStore } from "@/server/intelligence/memory-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await resolveIntelligenceUser(req);
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category") as any || undefined;
    const pinnedOnly = searchParams.get("pinned") === "true";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const memories = await personalMemoryStore.getMemories(user.id, {
      category,
      pinnedOnly,
      limit,
    });

    return NextResponse.json({ success: true, data: memories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch memories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await resolveIntelligenceUser(req);
    const body = await req.json().catch(() => ({}));

    if (!body.content || typeof body.content !== "string") {
      return NextResponse.json({ success: false, error: "Memory content is required" }, { status: 400 });
    }

    const memory = await personalMemoryStore.createMemory({
      userId: user.id,
      category: body.category || "PREFERENCE",
      content: body.content,
      summary: body.summary,
      importance: body.importance ?? 3,
      pinned: body.pinned ?? false,
      userConfirmed: body.userConfirmed ?? true,
      sensitivity: body.sensitivity || "PRIVATE",
      sourceType: "USER_EXPLICIT",
    });

    return NextResponse.json({ success: true, data: memory }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create memory" },
      { status: 500 }
    );
  }
}
