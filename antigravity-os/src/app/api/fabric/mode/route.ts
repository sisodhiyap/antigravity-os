import { NextRequest, NextResponse } from "next/server";
import { fabricManager } from "@/server/fabric/fabric-manager";
import { FabricExecutionMode } from "@/server/fabric/types";

export async function GET(req: NextRequest) {
  try {
    const mode = fabricManager.getExecutionMode();
    return NextResponse.json({
      success: true,
      mode,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mode: FabricExecutionMode = body.mode;

    if (mode !== "STRICT_OFFLINE" && mode !== "HYBRID") {
      return NextResponse.json(
        { success: false, error: "Invalid execution mode. Must be STRICT_OFFLINE or HYBRID." },
        { status: 400 }
      );
    }

    fabricManager.setExecutionMode(mode);

    return NextResponse.json({
      success: true,
      mode: fabricManager.getExecutionMode(),
      message: `Sovereign Fabric policy updated to ${mode}.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
