import { NextRequest, NextResponse } from "next/server";
import { tokenOptimizer } from "@/server/fabric/cost/token-optimizer";

export async function GET(req: NextRequest) {
  try {
    const stats = tokenOptimizer.getCacheStats();
    return NextResponse.json({ success: true, stats });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action; // "clear_all" | "invalidate_workspace"

    if (action === "clear_all") {
      tokenOptimizer.clearAllCache();
      return NextResponse.json({ success: true, message: "Deterministic output cache cleared." });
    }

    if (action === "invalidate_workspace") {
      const workspaceId = body.workspaceId || "default";
      const purged = tokenOptimizer.invalidateWorkspace(workspaceId);
      return NextResponse.json({ success: true, message: `Purged ${purged} cache entries for workspace ${workspaceId}.` });
    }

    return NextResponse.json({ success: false, error: "Invalid action. Supported: clear_all, invalidate_workspace." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
