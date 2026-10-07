/**
 * ANTIGRAVITY OS v7.0 — HERMES AGENT SUBSYSTEM
 * HermesModelRouter.ts: Multi-model capability routing, fallback cascade, and consensus engine
 */

import {
  HermesModelCapability,
  HermesModelRoutingDecision,
  HermesConsensusReport
} from "./HermesTypes";

export interface ModelProviderSpec {
  modelId: string;
  name: string;
  provider: "Ollama" | "OpenRouter" | "Gemini" | "Anthropic" | "FallbackLocal";
  capabilities: HermesModelCapability[];
  isLocal: boolean;
  costPer1kTokens: number;
  typicalLatencyMs: number;
  available: boolean;
}

export class HermesModelRouter {
  private static readonly MODEL_REGISTRY: ModelProviderSpec[] = [
    {
      modelId: "qwen2.5-coder:7b",
      name: "Qwen 2.5 Coder 7B (Ollama Local)",
      provider: "Ollama",
      capabilities: ["CODE", "PARSER", "TESTING", "LOCAL_INFERENCE"],
      isLocal: true,
      costPer1kTokens: 0.0,
      typicalLatencyMs: 45,
      available: true
    },
    {
      modelId: "llama3.3:70b-instruct",
      name: "Llama 3.3 70B Instruct (AirLLM Local)",
      provider: "Ollama",
      capabilities: ["REASONING", "PLANNING", "ARCHITECTURE", "DOCUMENT", "SECURITY"],
      isLocal: true,
      costPer1kTokens: 0.0,
      typicalLatencyMs: 120,
      available: true
    },
    {
      modelId: "gpt-4o",
      name: "OpenAI GPT-4o",
      provider: "OpenRouter",
      capabilities: ["VISION", "UI_UX", "ARCHITECTURE", "OCR", "DOCUMENT", "REASONING"],
      isLocal: false,
      costPer1kTokens: 0.005,
      typicalLatencyMs: 350,
      available: true
    },
    {
      modelId: "claude-3-5-sonnet",
      name: "Anthropic Claude 3.5 Sonnet",
      provider: "Anthropic",
      capabilities: ["CODE", "ARCHITECTURE", "UI_UX", "PLANNING", "SECURITY"],
      isLocal: false,
      costPer1kTokens: 0.003,
      typicalLatencyMs: 400,
      available: true
    },
    {
      modelId: "gemini-2.0-flash",
      name: "Google Gemini 2.0 Flash",
      provider: "Gemini",
      capabilities: ["VISION", "DOCUMENT", "OCR", "CODE", "TESTING"],
      isLocal: false,
      costPer1kTokens: 0.0002,
      typicalLatencyMs: 220,
      available: true
    },
    {
      modelId: "local-fallback-engine",
      name: "Deterministic AST Fallback Engine",
      provider: "FallbackLocal",
      capabilities: [
        "VISION", "DOCUMENT", "CODE", "REASONING", "PLANNING",
        "OCR", "PARSER", "SECURITY", "TESTING", "UI_UX",
        "ARCHITECTURE", "LOCAL_INFERENCE"
      ],
      isLocal: true,
      costPer1kTokens: 0.0,
      typicalLatencyMs: 5,
      available: true
    }
  ];

  /**
   * Dynamically selects the best model for a capability and constructs the complete fallback chain
   */
  public static routeCapability(capability: HermesModelCapability, preferredLocal: boolean = false): HermesModelRoutingDecision {
    const matching = this.MODEL_REGISTRY.filter((m) => m.capabilities.includes(capability) && m.available);
    const nonFallback = matching.filter((m) => m.modelId !== "local-fallback-engine");
    const candidates = nonFallback.length > 0 ? nonFallback : matching;

    let sorted = candidates.sort((a, b) => {
      if (preferredLocal && a.isLocal !== b.isLocal) {
        return a.isLocal ? -1 : 1;
      }
      return a.typicalLatencyMs - b.typicalLatencyMs;
    });

    if (sorted.length === 0) {
      // Safe local fallback
      const fallback = this.MODEL_REGISTRY.find((m) => m.modelId === "local-fallback-engine")!;
      return {
        capability,
        selectedModel: fallback.modelId,
        provider: fallback.provider,
        reason: "No remote models matched, defaulted to local fallback",
        fallbackChain: [fallback.modelId],
        latencyMs: fallback.typicalLatencyMs,
        costEstimateUsd: 0,
        confidence: 0.85
      };
    }

    const primary = sorted[0] || this.MODEL_REGISTRY.find((m) => m.modelId === "local-fallback-engine")!;
    const fallbackChain = sorted.map((s) => s.modelId);
    if (!fallbackChain.includes("local-fallback-engine")) {
      fallbackChain.push("local-fallback-engine");
    }

    return {
      capability,
      selectedModel: primary.modelId,
      provider: primary.provider,
      reason: `Optimal routing for ${capability} based on latency & capability`,
      fallbackChain,
      latencyMs: primary.typicalLatencyMs,
      costEstimateUsd: primary.costPer1kTokens * 0.5,
      confidence: primary.isLocal ? 0.95 : 0.98
    };
  }

  /**
   * Executes multi-model consensus across 2+ independent models
   */
  public static computeConsensus(
    task: string,
    modelOutputs: Array<{ model: string; response: string }>
  ): HermesConsensusReport {
    if (modelOutputs.length === 0) {
      return {
        task,
        modelsConsulted: [],
        outputs: [],
        agreementRate: 0,
        consensusEstablished: false,
        unresolvedDisagreements: ["NO_MODEL_OUTPUTS_PROVIDED"]
      };
    }

    const first = modelOutputs[0];
    if (modelOutputs.length === 1 && first) {
      return {
        task,
        modelsConsulted: [first.model],
        outputs: modelOutputs,
        agreementRate: 1.0,
        consensusEstablished: true,
        finalOutput: first.response
      };
    }

    // Measure agreement
    const primary = first ? first.response.trim() : "";
    let matchingCount = 0;
    const disagreements: string[] = [];

    for (const mo of modelOutputs) {
      if (mo && (mo.response.trim() === primary || mo.response.includes(primary) || primary.includes(mo.response))) {
        matchingCount++;
      } else if (mo) {
        disagreements.push(`Discrepancy in ${mo.model}`);
      }
    }

    const agreementRate = matchingCount / modelOutputs.length;
    const consensusEstablished = agreementRate >= 0.66; // 2/3 supermajority requirement

    return {
      task,
      modelsConsulted: modelOutputs.map((m) => m.model),
      outputs: modelOutputs,
      agreementRate,
      consensusEstablished,
      finalOutput: consensusEstablished ? primary : undefined,
      unresolvedDisagreements: consensusEstablished ? undefined : disagreements
    };
  }
}
