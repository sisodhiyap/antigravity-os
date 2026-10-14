import { NextRequest, NextResponse } from "next/server";
import { fabricManager } from "@/server/fabric/fabric-manager";

export async function GET(req: NextRequest) {
  try {
    const engines = fabricManager.getEngines();
    return NextResponse.json({
      success: true,
      count: engines.length,
      engines,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
