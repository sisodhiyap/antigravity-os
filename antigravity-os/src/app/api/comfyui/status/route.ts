import { NextRequest, NextResponse } from "next/server";
import { comfyUIEngineManager } from "@/plugins/comfyui/ComfyUIEngineManager";

export async function GET(req: NextRequest) {
  try {
    const state = await comfyUIEngineManager.probeStatus();
    const discovery = comfyUIEngineManager.discoverInstallation();

    return NextResponse.json({
      success: true,
      state,
      discovery,
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
