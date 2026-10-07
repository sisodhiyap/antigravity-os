/**
 * ANTIGRAVITY OS v7.0 — COMFYUI GENERATIVE MEDIA FABRIC
 * ComfyUIResourceManager.ts: Dynamic VRAM Governor and Memory Protection
 */

import { ResourceTier, ComfyUIGenerationRequest, ComfyUIModelSpec } from "./ComfyUITypes";
import { ComfyUIHealth } from "./ComfyUIHealth";

export interface VRAMEvaluationResult {
  isFeasible: boolean;
  requiredVramMb: number;
  availableVramMb: number;
  resourceTier: ResourceTier;
  recommendedAction: "DIRECT_EXECUTE" | "APPLY_QUANTIZATION" | "CPU_OFFLOAD" | "REDUCE_RESOLUTION" | "REDUCE_FRAMES" | "REJECT_INSUFFICIENT_VRAM";
  adjustedRequest?: Partial<ComfyUIGenerationRequest>;
  explanation: string;
}

export class ComfyUIResourceManager {
  /**
   * Calculates required VRAM based on model, resolution, batch size and modality
   */
  public static calculateRequiredVram(
    model: ComfyUIModelSpec,
    request: ComfyUIGenerationRequest
  ): number {
    let base = model.vramRequirementMb;
    const width = request.width || model.resolutionDefault.width;
    const height = request.height || model.resolutionDefault.height;
    const pixelRatio = (width * height) / (1024 * 1024);

    if (request.modality === "VIDEO") {
      const frames = request.frames || 24;
      return Math.floor(base * pixelRatio * 1.3 + frames * 60);
    }

    if (request.modality === "IMAGE") {
      return Math.floor(base * pixelRatio);
    }

    if (request.modality === "3D") {
      return Math.floor(base * 1.1);
    }

    return base;
  }

  /**
   * Evaluates if a generation request fits into local hardware VRAM safely
   */
  public static evaluateVramFeasibility(
    model: ComfyUIModelSpec,
    request: ComfyUIGenerationRequest
  ): VRAMEvaluationResult {
    const profile = ComfyUIHealth.getCachedProfile() || {
      vramAvailableMb: 8192,
      vramTotalMb: 12288,
      systemRamAvailableMb: 16384
    };

    const required = this.calculateRequiredVram(model, request);
    const available = profile.vramAvailableMb;

    let tier: ResourceTier = "SAFE";
    const usageRatio = required / profile.vramTotalMb;

    if (usageRatio < 0.6) tier = "SAFE";
    else if (usageRatio < 0.85) tier = "NORMAL";
    else if (usageRatio < 0.95) tier = "HEAVY";
    else tier = "CRITICAL";

    // 1. Direct execute if required <= available
    if (required <= available * 0.9) {
      return {
        isFeasible: true,
        requiredVramMb: required,
        availableVramMb: available,
        resourceTier: tier,
        recommendedAction: "DIRECT_EXECUTE",
        explanation: `Sufficient local VRAM available (${required}MB required / ${available}MB free)`
      };
    }

    // 2. Quantization / FP8 suggestion
    if (required <= available * 1.4 && model.precision !== "fp8_e4m3fn") {
      const reduced = Math.floor(required * 0.6);
      if (reduced <= available) {
        return {
          isFeasible: true,
          requiredVramMb: reduced,
          availableVramMb: available,
          resourceTier: "HEAVY",
          recommendedAction: "APPLY_QUANTIZATION",
          explanation: `Model requires quantization (FP8 / GGUF) to fit within ${available}MB VRAM`
        };
      }
    }

    // 3. Resolution scaling for images
    if (request.modality === "IMAGE" && (request.width || 1024) > 768) {
      const reduced = Math.floor(required * 0.55);
      if (reduced <= available) {
        return {
          isFeasible: true,
          requiredVramMb: reduced,
          availableVramMb: available,
          resourceTier: "HEAVY",
          recommendedAction: "REDUCE_RESOLUTION",
          adjustedRequest: { width: 768, height: 768 },
          explanation: `Downscaled resolution to 768x768 to avoid Out-Of-Memory error`
        };
      }
    }

    // 4. Frame reduction for videos
    if (request.modality === "VIDEO" && (request.frames || 24) > 16) {
      const reduced = Math.floor(required * 0.7);
      if (reduced <= available) {
        return {
          isFeasible: true,
          requiredVramMb: reduced,
          availableVramMb: available,
          resourceTier: "HEAVY",
          recommendedAction: "REDUCE_FRAMES",
          adjustedRequest: { frames: 16 },
          explanation: `Reduced video frame count to 16 frames to fit local VRAM`
        };
      }
    }

    // 5. Safe rejection
    return {
      isFeasible: false,
      requiredVramMb: required,
      availableVramMb: available,
      resourceTier: "CRITICAL",
      recommendedAction: "REJECT_INSUFFICIENT_VRAM",
      explanation: `Insufficient local VRAM (${required}MB required > ${available}MB free). Offer quantized model or cloud fallback.`
    };
  }
}
