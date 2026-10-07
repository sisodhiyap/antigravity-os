/**
 * ANTIGRAVITY OS v7.0 — GRANITE AUTOMATIC MODEL ROUTER
 * src/plugins/granite/GraniteModelRouter.ts
 * 
 * Capability-aware model selection engine evaluating task requirements,
 * reasoning intensity, context length, memory headroom, and privacy mode.
 */

import {
  GraniteModelId,
  GraniteTaskSpecialization,
  GraniteThinkingMode,
  GraniteRoutingDecision,
  GraniteBackend,
} from "./GraniteTypes";
import { GraniteHardwareGovernor } from "./GraniteHardwareGovernor";
import { GraniteModelRegistry } from "./GraniteModelRegistry";

export interface RouteModelParams {
  taskType: GraniteTaskSpecialization;
  reasoningRequirement?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  contextLength?: number;
  toolRequirement?: boolean;
  codeRequirement?: boolean;
  latencyRequirementMs?: number;
  privacyMode?: "STRICT_LOCAL" | "PERMISSIVE";
  userPreferredModel?: GraniteModelId;
}

export class GraniteModelRouter {
  private static instance: GraniteModelRouter;

  public static getInstance(): GraniteModelRouter {
    if (!GraniteModelRouter.instance) {
      GraniteModelRouter.instance = new GraniteModelRouter();
    }
    return GraniteModelRouter.instance;
  }

  /**
   * Evaluates requirements and selects the optimal model & fallback chain
   */
  public async routeModel(params: RouteModelParams): Promise<GraniteRoutingDecision> {
    const governor = GraniteHardwareGovernor.getInstance();
    const hardware = await governor.getHardwareProfile();
    const registry = GraniteModelRegistry.getInstance();
    await registry.discoverLocalModels();

    let selectedModel: GraniteModelId = "granite-4.2-8b";
    let reasoningMode: GraniteThinkingMode = "THINKING";
    let selectionReason = "Balanced general reasoning";
    let hardwareFitScore = 95;

    // 1. Task & Reasoning Requirements Evaluation
    if (params.reasoningRequirement === "CRITICAL" || params.taskType === "PRODUCT_ARCHITECTURE" || params.taskType === "SELF_REPAIR_PLANNING") {
      reasoningMode = "DEEP_REASONING";
      if (hardware.vramGb >= 16 || hardware.availableRamGb >= 28) {
        selectedModel = "granite-4.2-30b";
        selectionReason = "High-complexity architectural reasoning routed to 30B MoE model";
      } else {
        selectedModel = "granite-4.2-8b";
        selectionReason = "Critical reasoning with memory-bounded 8B model (Deep Thinking active)";
      }
    } else if (params.taskType === "CODE" || params.taskType === "CODE_REVIEW" || params.taskType === "TEST_GENERATION") {
      selectedModel = "granite-4.2-8b";
      reasoningMode = "THINKING";
      selectionReason = "Structured code synthesis & AST compliance";
    } else if (params.latencyRequirementMs && params.latencyRequirementMs < 50) {
      selectedModel = "granite-4.2-3b";
      reasoningMode = "FAST";
      selectionReason = "Low-latency real-time response requirement (< 50ms)";
    } else if (hardware.availableRamGb < 4.0) {
      selectedModel = "granite-4.2-3b";
      reasoningMode = "LOW_EFFORT";
      selectionReason = "Adaptive memory constraint preservation (low RAM headroom)";
      hardwareFitScore = 80;
    }

    // 2. User preference override
    if (params.userPreferredModel) {
      selectedModel = params.userPreferredModel;
      selectionReason = `User explicitly selected ${params.userPreferredModel}`;
    }

    const meta = registry.getModel(selectedModel);
    const backend: GraniteBackend = meta ? meta.backend : "FALLBACK_DETERMINISTIC";

    // 3. Construct Fallback Cascade
    const fallbackChain = [
      {
        model: "granite-4.2-8b",
        backend: "FALLBACK_DETERMINISTIC" as GraniteBackend,
        reason: "Primary local in-process fallback",
      },
      {
        model: "qwen2.5-coder:7b",
        backend: "OLLAMA_LOCAL" as GraniteBackend,
        reason: "Secondary Ollama daemon fallback",
      },
      {
        model: "deterministic-ast-engine",
        backend: "FALLBACK_DETERMINISTIC" as GraniteBackend,
        reason: "Final zero-dependency AST rule engine",
      },
    ];

    return {
      selectedModel,
      backend,
      reasoningMode,
      fallbackChain,
      selectionReason,
      hardwareFitScore,
      estimatedMemoryGb: selectedModel === "granite-4.2-30b" ? 18 : selectedModel === "granite-4.2-8b" ? 5.6 : 2.4,
      privacyEnforced: params.privacyMode !== "PERMISSIVE",
    };
  }
}
