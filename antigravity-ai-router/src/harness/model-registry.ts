/**
 * Antigravity Optimized Harness - Model Capability Registry
 * Owns logical tier resolution, model metadata, capability scoring, cost per million tokens,
 * and decoupling the Harness from specific vendors/model names.
 */

import { ModelTier } from './types.js';

export interface ModelCapabilities {
  coding: number;       // 0-100
  reasoning: number;    // 0-100
  research: number;     // 0-100
  vision: number;       // 0-100
  tool_use: number;     // 0-100
  long_context: number; // 0-100
}

export interface ModelCostMetadata {
  inputPerMillionUsd: number;
  outputPerMillionUsd: number;
}

export interface ModelMetadata {
  id: string;
  provider: string;
  tier: ModelTier;
  capabilities: ModelCapabilities;
  cost: ModelCostMetadata;
  latencyExpectedMs: number;
  contextWindow: number;
  reliability: number; // 0.0 - 1.0
  availability: boolean;
}

export class ModelRegistry {
  private registry: Map<string, ModelMetadata> = new Map();

  constructor() {
    this.initializeDefaultRegistry();
  }

  private initializeDefaultRegistry() {
    // 1. CHEAP TIER MODELS ($0.00 - $0.20 per MTok)
    this.registerModel({
      id: 'qwen2.5-coder:14b',
      provider: 'ollama',
      tier: 'cheap',
      capabilities: { coding: 92, reasoning: 85, research: 80, vision: 0, tool_use: 88, long_context: 80 },
      cost: { inputPerMillionUsd: 0.0, outputPerMillionUsd: 0.0 },
      latencyExpectedMs: 1200,
      contextWindow: 32768,
      reliability: 0.95,
      availability: true
    });

    this.registerModel({
      id: 'qwen/qwen3-coder:free',
      provider: 'openrouter',
      tier: 'cheap',
      capabilities: { coding: 96, reasoning: 93, research: 90, vision: 0, tool_use: 92, long_context: 95 },
      cost: { inputPerMillionUsd: 0.0, outputPerMillionUsd: 0.0 },
      latencyExpectedMs: 850,
      contextWindow: 131072,
      reliability: 0.98,
      availability: true
    });

    this.registerModel({
      id: 'deepseek/deepseek-v4-flash:free',
      provider: 'openrouter',
      tier: 'cheap',
      capabilities: { coding: 92, reasoning: 90, research: 88, vision: 0, tool_use: 90, long_context: 90 },
      cost: { inputPerMillionUsd: 0.0, outputPerMillionUsd: 0.0 },
      latencyExpectedMs: 600,
      contextWindow: 65536,
      reliability: 0.97,
      availability: true
    });

    this.registerModel({
      id: 'openrouter/free',
      provider: 'openrouter',
      tier: 'cheap',
      capabilities: { coding: 94, reasoning: 92, research: 90, vision: 0, tool_use: 90, long_context: 92 },
      cost: { inputPerMillionUsd: 0.0, outputPerMillionUsd: 0.0 },
      latencyExpectedMs: 750,
      contextWindow: 131072,
      reliability: 0.99,
      availability: true
    });

    this.registerModel({
      id: 'gpt-4o-mini',
      provider: 'openai',
      tier: 'cheap',
      capabilities: { coding: 92, reasoning: 88, research: 90, vision: 85, tool_use: 92, long_context: 92 },
      cost: { inputPerMillionUsd: 0.15, outputPerMillionUsd: 0.60 },
      latencyExpectedMs: 500,
      contextWindow: 128000,
      reliability: 0.99,
      availability: true
    });

    this.registerModel({
      id: 'gemini-2.0-flash',
      provider: 'google_pool',
      tier: 'cheap',
      capabilities: { coding: 94, reasoning: 92, research: 94, vision: 95, tool_use: 94, long_context: 99 },
      cost: { inputPerMillionUsd: 0.075, outputPerMillionUsd: 0.30 },
      latencyExpectedMs: 450,
      contextWindow: 1048576,
      reliability: 0.98,
      availability: true
    });

    this.registerModel({
      id: 'deepseek-chat',
      provider: 'deepseek',
      tier: 'cheap',
      capabilities: { coding: 95, reasoning: 92, research: 90, vision: 0, tool_use: 92, long_context: 90 },
      cost: { inputPerMillionUsd: 0.14, outputPerMillionUsd: 0.28 },
      latencyExpectedMs: 700,
      contextWindow: 65536,
      reliability: 0.97,
      availability: true
    });

    // 2. STANDARD TIER MODELS ($0.20 - $2.00 per MTok)
    this.registerModel({
      id: 'nvidia/nemotron-3-super-120b-a12b:free',
      provider: 'openrouter',
      tier: 'standard',
      capabilities: { coding: 95, reasoning: 97, research: 95, vision: 0, tool_use: 94, long_context: 95 },
      cost: { inputPerMillionUsd: 0.0, outputPerMillionUsd: 0.0 },
      latencyExpectedMs: 1100,
      contextWindow: 131072,
      reliability: 0.97,
      availability: true
    });

    this.registerModel({
      id: 'gpt-4o',
      provider: 'openai',
      tier: 'standard',
      capabilities: { coding: 97, reasoning: 96, research: 96, vision: 96, tool_use: 98, long_context: 95 },
      cost: { inputPerMillionUsd: 2.50, outputPerMillionUsd: 10.0 },
      latencyExpectedMs: 800,
      contextWindow: 128000,
      reliability: 0.99,
      availability: true
    });

    this.registerModel({
      id: 'gemini-1.5-pro',
      provider: 'google_pool',
      tier: 'standard',
      capabilities: { coding: 96, reasoning: 96, research: 98, vision: 96, tool_use: 95, long_context: 100 },
      cost: { inputPerMillionUsd: 1.25, outputPerMillionUsd: 5.0 },
      latencyExpectedMs: 950,
      contextWindow: 2097152,
      reliability: 0.98,
      availability: true
    });

    this.registerModel({
      id: 'deepseek-reasoner',
      provider: 'deepseek',
      tier: 'standard',
      capabilities: { coding: 97, reasoning: 98, research: 94, vision: 0, tool_use: 90, long_context: 90 },
      cost: { inputPerMillionUsd: 0.55, outputPerMillionUsd: 2.19 },
      latencyExpectedMs: 1400,
      contextWindow: 65536,
      reliability: 0.97,
      availability: true
    });

    this.registerModel({
      id: 'minimax/minimax-m3',
      provider: 'router9',
      tier: 'standard',
      capabilities: { coding: 90, reasoning: 89, research: 90, vision: 0, tool_use: 88, long_context: 98 },
      cost: { inputPerMillionUsd: 0.20, outputPerMillionUsd: 0.80 },
      latencyExpectedMs: 900,
      contextWindow: 1000000,
      reliability: 0.96,
      availability: true
    });

    // 3. PREMIUM TIER MODELS ($2.00+ per MTok or Top-tier Architectural Reasoners)
    this.registerModel({
      id: 'antigravity-native-premium',
      provider: 'antigravity',
      tier: 'premium',
      capabilities: { coding: 99, reasoning: 99, research: 99, vision: 98, tool_use: 99, long_context: 99 },
      cost: { inputPerMillionUsd: 5.0, outputPerMillionUsd: 15.0 },
      latencyExpectedMs: 1200,
      contextWindow: 200000,
      reliability: 0.999,
      availability: true
    });

    this.registerModel({
      id: 'o3-mini',
      provider: 'openai',
      tier: 'premium',
      capabilities: { coding: 98, reasoning: 99, research: 94, vision: 0, tool_use: 96, long_context: 98 },
      cost: { inputPerMillionUsd: 1.10, outputPerMillionUsd: 4.40 },
      latencyExpectedMs: 1500,
      contextWindow: 200000,
      reliability: 0.99,
      availability: true
    });
  }

  public registerModel(meta: ModelMetadata) {
    this.registry.set(meta.id, meta);
  }

  public getModel(id: string): ModelMetadata | undefined {
    return this.registry.get(id);
  }

  public getAllModels(): ModelMetadata[] {
    return Array.from(this.registry.values());
  }

  /**
   * Resolve best active model for a requested logical tier and required capability
   */
  public resolveModelForTier(
    tier: ModelTier,
    requiredCapability: keyof ModelCapabilities = 'coding'
  ): { primary: ModelMetadata; fallbacks: ModelMetadata[] } {
    const available = Array.from(this.registry.values()).filter(
      (m) => m.availability && (m.tier === tier || (tier === 'standard' && m.tier === 'cheap'))
    );

    if (available.length === 0) {
      // Emergency fallback to any available model
      const anyAvailable = Array.from(this.registry.values()).find((m) => m.availability) || {
        id: 'openrouter/free',
        provider: 'openrouter',
        tier: 'cheap',
        capabilities: { coding: 90, reasoning: 90, research: 90, vision: 0, tool_use: 90, long_context: 90 },
        cost: { inputPerMillionUsd: 0, outputPerMillionUsd: 0 },
        latencyExpectedMs: 800,
        contextWindow: 128000,
        reliability: 1.0,
        availability: true
      };
      return { primary: anyAvailable, fallbacks: [] };
    }

    // Sort by: tier match -> capability score -> lowest cost -> lowest latency
    available.sort((a, b) => {
      if (a.tier === tier && b.tier !== tier) return -1;
      if (b.tier === tier && a.tier !== tier) return 1;

      const capDiff = b.capabilities[requiredCapability] - a.capabilities[requiredCapability];
      if (capDiff !== 0) return capDiff;

      const costA = a.cost.inputPerMillionUsd + a.cost.outputPerMillionUsd;
      const costB = b.cost.inputPerMillionUsd + b.cost.outputPerMillionUsd;
      if (costA !== costB) return costA - costB;

      return a.latencyExpectedMs - b.latencyExpectedMs;
    });

    return {
      primary: available[0],
      fallbacks: available.slice(1, 4)
    };
  }

  public calculateModelCost(modelId: string, promptTokens: number, completionTokens: number): number {
    const meta = this.registry.get(modelId);
    if (!meta) {
      // Conservative default estimate if unknown
      return (promptTokens / 1_000_000) * 0.15 + (completionTokens / 1_000_000) * 0.60;
    }
    return (
      (promptTokens / 1_000_000) * meta.cost.inputPerMillionUsd +
      (completionTokens / 1_000_000) * meta.cost.outputPerMillionUsd
    );
  }
}

export const modelRegistry = new ModelRegistry();
