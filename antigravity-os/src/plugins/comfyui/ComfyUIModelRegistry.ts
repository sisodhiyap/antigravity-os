/**
 * ANTIGRAVITY OS v7.0 — COMFYUI GENERATIVE MEDIA FABRIC
 * ComfyUIModelRegistry.ts: Catalog of installed and compatible local media models
 */

import { ComfyUIModelSpec, MediaModality } from "./ComfyUITypes";

export class ComfyUIModelRegistry {
  private static readonly models: Map<string, ComfyUIModelSpec> = new Map();

  public static registerModel(model: ComfyUIModelSpec): void {
    this.models.set(model.modelId, model);
  }

  public static getModel(modelId: string): ComfyUIModelSpec | undefined {
    return this.models.get(modelId);
  }

  public static getModelsByModality(modality: MediaModality): ComfyUIModelSpec[] {
    return Array.from(this.models.values()).filter((m) => m.modality === modality && m.isInstalled);
  }

  public static getAllModels(): ComfyUIModelSpec[] {
    return Array.from(this.models.values());
  }

  /**
   * Initializes standard supported local models
   */
  public static initializeDefaults(): void {
    // 1. IMAGE: Flux.1 Schnell (Fast local generator)
    this.registerModel({
      modelId: "flux1-schnell-fp8",
      name: "Flux.1 Schnell (FP8 Local)",
      family: "Flux",
      modality: "IMAGE",
      precision: "fp8_e4m3fn",
      vramRequirementMb: 6144,
      isInstalled: true,
      license: "Apache 2.0",
      capabilities: ["TXT2IMG", "IMG2IMG", "FAST_INFERENCE"],
      recommendedSteps: 4,
      recommendedCfg: 1.0,
      resolutionDefault: { width: 1024, height: 1024 }
    });

    // 2. IMAGE: SDXL Base 1.0
    this.registerModel({
      modelId: "sdxl-base-1.0",
      name: "Stable Diffusion XL 1.0 Base",
      family: "SDXL",
      modality: "IMAGE",
      precision: "fp16",
      vramRequirementMb: 8192,
      isInstalled: true,
      license: "OpenRAIL-M",
      capabilities: ["TXT2IMG", "IMG2IMG", "INPAINT", "CONTROLNET", "LORA"],
      recommendedSteps: 25,
      recommendedCfg: 7.0,
      resolutionDefault: { width: 1024, height: 1024 }
    });

    // 3. VIDEO: Wan 2.1 Video
    this.registerModel({
      modelId: "wan2.1-t2v-1.3b",
      name: "Wan 2.1 Text-to-Video 1.3B",
      family: "Wan",
      modality: "VIDEO",
      precision: "bf16",
      vramRequirementMb: 8192,
      isInstalled: true,
      license: "Apache 2.0",
      capabilities: ["TXT2VIDEO", "IMG2VIDEO", "TEMPORAL_CONSISTENCY"],
      recommendedSteps: 30,
      recommendedCfg: 6.0,
      resolutionDefault: { width: 832, height: 480 }
    });

    // 4. VIDEO: LTX Video
    this.registerModel({
      modelId: "ltx-video-0.9.1",
      name: "LTX Video 0.9.1 (Lightricks)",
      family: "LTX",
      modality: "VIDEO",
      precision: "fp8_e4m3fn",
      vramRequirementMb: 6144,
      isInstalled: true,
      license: "Open Source",
      capabilities: ["TXT2VIDEO", "HIGH_FPS", "FAST_MOTION"],
      recommendedSteps: 20,
      recommendedCfg: 3.5,
      resolutionDefault: { width: 768, height: 512 }
    });

    // 5. VIDEO: Stable Video Diffusion (SVD)
    this.registerModel({
      modelId: "svd-xt-1.1",
      name: "Stable Video Diffusion XT 1.1",
      family: "SVD",
      modality: "VIDEO",
      precision: "fp16",
      vramRequirementMb: 8192,
      isInstalled: true,
      license: "OpenRAIL-M",
      capabilities: ["IMG2VIDEO", "CAMERA_MOTION"],
      recommendedSteps: 25,
      recommendedCfg: 2.5,
      resolutionDefault: { width: 1024, height: 576 }
    });

    // 6. AUDIO: ACE-Step Music & Sound Synthesizer
    this.registerModel({
      modelId: "ace-step-audio",
      name: "ACE-Step Local Audio Synthesizer",
      family: "ACEStep",
      modality: "AUDIO",
      precision: "fp16",
      vramRequirementMb: 4096,
      isInstalled: true,
      license: "MIT",
      capabilities: ["TXT2AUDIO", "MUSIC_GEN", "SFX"],
      recommendedSteps: 50,
      recommendedCfg: 5.0,
      resolutionDefault: { width: 0, height: 0 }
    });

    // 7. 3D: TripoSR 3D Mesh Generator
    this.registerModel({
      modelId: "triposr-mesh-gen",
      name: "TripoSR Fast Image-to-3D Mesh",
      family: "TripoSR",
      modality: "3D",
      precision: "fp16",
      vramRequirementMb: 6144,
      isInstalled: true,
      license: "MIT",
      capabilities: ["IMG2MESH", "GLB_EXPORT", "TEXTURE_GEN"],
      recommendedSteps: 20,
      recommendedCfg: 1.0,
      resolutionDefault: { width: 512, height: 512 }
    });
  }
}

// Auto-initialize default models
ComfyUIModelRegistry.initializeDefaults();
