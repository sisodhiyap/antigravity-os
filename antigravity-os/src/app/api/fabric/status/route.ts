import { NextRequest, NextResponse } from "next/server";
import { fabricManager } from "@/server/fabric/fabric-manager";

export async function GET(req: NextRequest) {
  try {
    const diagnostics = await fabricManager.generateDiagnostics();
    return NextResponse.json({
      success: true,
      diagnostics,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
