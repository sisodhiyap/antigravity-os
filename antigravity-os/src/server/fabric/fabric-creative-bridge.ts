/**
 * ANTIGRAVITY OS — SOVEREIGN LOCAL AI FABRIC
 * fabric-creative-bridge.ts: Non-invasive bridge linking Fabric engines to Creative Studio.
 * Allows Creative Studio to seamlessly use InvokeAI, VoiceStudio, ACE-Step, Upscayl, and OpenShorts
 * while 100% preserving existing API contracts and frozen V7 ComfyUI pipelines.
 */

import { invokeAIAdapter } from "./adapters/invokeai-adapter";
import { voiceStudioAdapter } from "./adapters/voice-studio-adapter";
import { aceStepAdapter } from "./adapters/ace-step-adapter";
import { upscaylAdapter } from "./adapters/upscayl-adapter";
import { openShortsAdapter } from "./adapters/openshorts-adapter";
import { localEngineRegistry } from "./engine-registry";

export interface CreativeBridgeDispatchParams {
  pipeline: "IMAGE" | "SPEECH" | "MUSIC" | "UPSCALE" | "SHORTS";
  prompt?: string;
  inputUrlOrPath?: string;
  parameters?: Record<string, any>;
}

export class FabricCreativeBridge {
  private static instance: FabricCreativeBridge;

  public static getInstance(): FabricCreativeBridge {
    if (!FabricCreativeBridge.instance) {
      FabricCreativeBridge.instance = new FabricCreativeBridge();
    }
    return FabricCreativeBridge.instance;
  }

  private constructor() {}

  /**
   * Dispatches a Creative Studio job through the appropriate Sovereign Fabric engine
   */
  public async dispatchCreativeJob(params: CreativeBridgeDispatchParams): Promise<any> {
    switch (params.pipeline) {
      case "IMAGE": {
        const invokeState = localEngineRegistry.getEngine("invokeai");
        if (invokeState && (invokeState.isInstalled || invokeState.isRunning)) {
          return await invokeAIAdapter.executeJob("text_to_image", {
            prompt: params.prompt,
            ...params.parameters,
          });
        }
        throw new Error("InvokeAI engine is not active or installed in Local AI Fabric.");
      }

      case "SPEECH": {
        return await voiceStudioAdapter.executeJob("text_to_speech", {
          text: params.prompt,
          ...params.parameters,
        });
      }

      case "MUSIC": {
        return await aceStepAdapter.executeJob("music_generation", {
          prompt: params.prompt,
          ...params.parameters,
        });
      }

      case "UPSCALE": {
        return await upscaylAdapter.executeJob("image_upscaling_4x", {
          inputPath: params.inputUrlOrPath,
          ...params.parameters,
        });
      }

      case "SHORTS": {
        return await openShortsAdapter.executeJob("video_to_shorts", {
          videoPath: params.inputUrlOrPath,
          ...params.parameters,
        });
      }

      default:
        throw new Error(`Unsupported pipeline: ${params.pipeline}`);
    }
  }

  public getAvailablePipelines() {
    return {
      invokeaiImage: localEngineRegistry.getEngine("invokeai")?.status,
      voiceStudioSpeech: localEngineRegistry.getEngine("voice-studio")?.status,
      aceStepMusic: localEngineRegistry.getEngine("ace-step")?.status,
      upscaylEnhance: localEngineRegistry.getEngine("upscayl")?.status,
      openShortsVideo: localEngineRegistry.getEngine("openshorts")?.status,
    };
  }
}

export const fabricCreativeBridge = FabricCreativeBridge.getInstance();
