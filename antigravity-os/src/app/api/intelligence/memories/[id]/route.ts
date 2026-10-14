import { NextRequest, NextResponse } from "next/server";
import { resolveIntelligenceUser } from "@/server/intelligence/auth-util";
import { personalMemoryStore } from "@/server/intelligence/memory-store";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await resolveIntelligenceUser(req);
    const memory = await personalMemoryStore.getMemoryById(id, user.id);
    if (!memory) {
      return NextResponse.json({ success: false, error: "Memory not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: memory });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch memory" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await resolveIntelligenceUser(req);
    const body = await req.json().catch(() => ({}));

    const updated = await personalMemoryStore.updateMemory(id, user.id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update memory" },
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
    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    const deleted = await personalMemoryStore.deleteMemory(id, user.id, permanent);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Memory not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Memory deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete memory" },
      { status: 500 }
    );
  }
}
