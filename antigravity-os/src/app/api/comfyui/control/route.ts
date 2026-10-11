import { NextRequest, NextResponse } from "next/server";
import { comfyUIEngineManager } from "@/plugins/comfyui/ComfyUIEngineManager";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "status";

    switch (action) {
      case "start": {
        const state = await comfyUIEngineManager.start();
        return NextResponse.json({ success: true, message: "ComfyUI engine started", state });
      }
      case "stop": {
        const state = await comfyUIEngineManager.stop();
        return NextResponse.json({ success: true, message: "ComfyUI engine stopped", state });
      }
      case "restart": {
        const state = await comfyUIEngineManager.restart();
        return NextResponse.json({ success: true, message: "ComfyUI engine restarted", state });
      }
      case "configure": {
        if (body.customPath) {
          comfyUIEngineManager.setCustomInstallPath(body.customPath);
        }
        const state = await comfyUIEngineManager.probeStatus();
        return NextResponse.json({ success: true, state });
      }
      case "discover": {
        const discovery = comfyUIEngineManager.discoverInstallation();
        const state = await comfyUIEngineManager.probeStatus();
        return NextResponse.json({ success: true, discovery, state });
      }
      default: {
        const state = await comfyUIEngineManager.probeStatus();
        return NextResponse.json({ success: true, state });
      }
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || String(err),
      },
      { status: 400 }
    );
  }
}
