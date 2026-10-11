import { NextRequest, NextResponse } from "next/server";
import { comfyUIEngineManager } from "@/plugins/comfyui/ComfyUIEngineManager";
import { ComfyUIAdapter } from "@/plugins/comfyui/ComfyUIAdapter";
import { ComfyUIGenerationRequest, MediaModality } from "@/plugins/comfyui/ComfyUITypes";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body.prompt;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Prompt is required." }, { status: 400 });
    }

    const modality: MediaModality = body.modality || "IMAGE";
    const request: ComfyUIGenerationRequest = {
      prompt: prompt.trim(),
      negativePrompt: body.negativePrompt,
      modality,
      modelId: body.modelId,
      workflowId: body.workflowId,
      width: body.width || 1024,
      height: body.height || 1024,
      seed: body.seed,
      steps: body.steps || 20,
      cfgScale: body.cfgScale || 7.0,
    };

    const status = await comfyUIEngineManager.probeStatus();

    if (status.isOnline) {
      // Execute through live local ComfyUI instance
      const job = await comfyUIEngineManager.executeWorkflow(request);
      return NextResponse.json({
        success: true,
        mode: "LOCAL_COMFYUI",
        job,
      });
    }

    // Engine is offline or not installed
    if (body.allowSimulation) {
      // Sandboxed execution for testing / development
      const job = await ComfyUIAdapter.executeMediaGeneration(request);
      return NextResponse.json({
        success: true,
        mode: "LOCAL_SANDBOX",
        job,
        warning: `Local ComfyUI is ${status.status}. Executed in verified sandbox.`,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: `ComfyUI engine is currently ${status.status}.`,
        engineStatus: status.status,
        remediation: status.remediation,
      },
      { status: 422 }
    );
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
