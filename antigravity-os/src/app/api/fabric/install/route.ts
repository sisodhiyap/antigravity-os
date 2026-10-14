import { NextRequest, NextResponse } from "next/server";
import { fabricInstaller } from "@/server/fabric/installer";
import { FabricEngineId } from "@/server/fabric/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, engineId, modelId, userConsentGranted } = body;

    if (!engineId) {
      return NextResponse.json({ success: false, error: "engineId is required." }, { status: 400 });
    }

    if (action === "evaluate") {
      const evaluation = fabricInstaller.evaluatePrerequisites(engineId as FabricEngineId);
      return NextResponse.json({ success: true, evaluation });
    }

    if (action === "install") {
      if (!userConsentGranted) {
        return NextResponse.json(
          { success: false, error: "Explicit human consent is required before installing optional engines." },
          { status: 403 }
        );
      }
      await fabricInstaller.installEngine(engineId as FabricEngineId, true);
      return NextResponse.json({ success: true, message: `Engine ${engineId} installed successfully.` });
    }

    if (action === "uninstall") {
      await fabricInstaller.uninstallEngine(engineId as FabricEngineId);
      return NextResponse.json({ success: true, message: `Engine ${engineId} uninstalled safely without affecting user data.` });
    }

    if (action === "download_model") {
      if (!modelId) {
        return NextResponse.json({ success: false, error: "modelId is required for model downloads." }, { status: 400 });
      }
      if (!userConsentGranted) {
        return NextResponse.json(
          { success: false, error: "Explicit human consent is required before downloading large model weights." },
          { status: 403 }
        );
      }
      const progress = await fabricInstaller.downloadModelWeights(engineId as FabricEngineId, modelId, true);
      return NextResponse.json({ success: true, progress });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Supported: evaluate, install, uninstall, download_model." },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
