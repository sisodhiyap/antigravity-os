import { NextRequest, NextResponse } from "next/server";
import { resolveIntelligenceUser } from "@/server/intelligence/auth-util";
import { personalMemoryStore } from "@/server/intelligence/memory-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await resolveIntelligenceUser(req);
    const body = await req.json().catch(() => ({}));
    const query = body.query || body.q || "";

    if (!query || typeof query !== "string") {
      return NextResponse.json({ success: false, error: "Search query is required" }, { status: 400 });
    }

    const results = await personalMemoryStore.searchMemories(user.id, query, body.limit || 10);
    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to search memories" },
      { status: 500 }
    );
  }
}
