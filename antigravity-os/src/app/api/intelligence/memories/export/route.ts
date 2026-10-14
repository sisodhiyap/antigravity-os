import { NextRequest, NextResponse } from "next/server";
import { resolveIntelligenceUser } from "@/server/intelligence/auth-util";
import { personalMemoryStore } from "@/server/intelligence/memory-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await resolveIntelligenceUser(req);
    const bundle = await personalMemoryStore.exportMemories(user.id);
    return NextResponse.json({ success: true, data: bundle });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to export memories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
