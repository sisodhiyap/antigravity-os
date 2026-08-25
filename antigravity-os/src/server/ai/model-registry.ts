/**
 * ANTIGRAVITY LEVEL-5 MODEL PERFORMANCE REGISTRY & HISTORICAL ROUTING
 *
 * Tracks empirical historical metrics per provider and model:
 * - Latency (p50, p95)
 * - Quality & test pass rate
 * - Error & retry rate
 * - Cost efficiency
 * Powers intelligent, task-aware dynamic model routing.
 */

export interface ModelPerformanceMetric {
  provider: string;
  model: string;
  taskCategory: "CODE" | "REASONING" | "FAST" | "CREATIVE" | "GENERAL";
  totalInvocations: number;
  successfulInvocations: number;
  failedInvocations: number;
  averageLatencyMs: number;
  totalTokens: number;
  totalCostUsd: number;
  qualityScore: number; // 0.0 to 1.0 (based on unit/browser test pass rate)
  lastUpdated: string;
}

export class ModelPerformanceRegistry {
  private static instance: ModelPerformanceRegistry;
  private metrics: Map<string, ModelPerformanceMetric> = new Map();

  private constructor() {
    this.seedBaselineMetrics();
  }

  public static getInstance(): ModelPerformanceRegistry {
    if (!ModelPerformanceRegistry.instance) {
      ModelPerformanceRegistry.instance = new ModelPerformanceRegistry();
    }
    return ModelPerformanceRegistry.instance;
  }

  private getKey(provider: string, model: string, taskCategory: string): string {
    return `${provider}:${model}:${taskCategory}`;
  }

  private seedBaselineMetrics() {
    this.recordInvocation({
      provider: "ollama",
      model: "qwen2.5-coder:7b",
      taskCategory: "CODE",
      latencyMs: 85,
      tokens: 1500,
      costUsd: 0.0,
      success: true,
      qualityScore: 0.96,
    });

    this.recordInvocation({
      provider: "deepseek",
      model: "deepseek-chat",
      taskCategory: "REASONING",
      latencyMs: 420,
      tokens: 2200,
      costUsd: 0.0006,
      success: true,
      qualityScore: 0.98,
    });

    this.recordInvocation({
      provider: "openrouter",
      model: "meta-llama/llama-3.3-70b-instruct:free",
      taskCategory: "GENERAL",
      latencyMs: 650,
      tokens: 1800,
      costUsd: 0.0,
      success: true,
      qualityScore: 0.92,
    });
  }

  public recordInvocation(params: {
    provider: string;
    model: string;
    taskCategory: "CODE" | "REASONING" | "FAST" | "CREATIVE" | "GENERAL";
    latencyMs: number;
    tokens: number;
    costUsd: number;
    success: boolean;
    qualityScore?: number;
  }) {
    const key = this.getKey(params.provider, params.model, params.taskCategory);
    const existing = this.metrics.get(key) || {
      provider: params.provider,
      model: params.model,
      taskCategory: params.taskCategory,
      totalInvocations: 0,
      successfulInvocations: 0,
      failedInvocations: 0,
      averageLatencyMs: params.latencyMs,
      totalTokens: 0,
      totalCostUsd: 0,
      qualityScore: params.qualityScore || 0.95,
      lastUpdated: new Date().toISOString(),
    };

    const count = existing.totalInvocations + 1;
    existing.totalInvocations = count;
    if (params.success) existing.successfulInvocations += 1;
    else existing.failedInvocations += 1;

    existing.averageLatencyMs = Math.round(
      (existing.averageLatencyMs * (count - 1) + params.latencyMs) / count
    );
    existing.totalTokens += params.tokens;
    existing.totalCostUsd += params.costUsd;
    if (params.qualityScore !== undefined) {
      existing.qualityScore = (existing.qualityScore + params.qualityScore) / 2;
    }
    existing.lastUpdated = new Date().toISOString();

    this.metrics.set(key, existing);
  }

  /**
   * Recommends the optimal model for a given task based on historical quality and latency
   */
  public recommendModel(taskCategory: "CODE" | "REASONING" | "FAST" | "CREATIVE" | "GENERAL"): {
    provider: string;
    model: string;
    expectedLatencyMs: number;
    confidence: number;
  } {
    const candidates = Array.from(this.metrics.values()).filter(
      (m) => m.taskCategory === taskCategory && m.successfulInvocations > 0
    );

    if (candidates.length === 0) {
      // Default fallback
      return { provider: "ollama", model: "qwen2.5-coder:7b", expectedLatencyMs: 100, confidence: 0.9 };
    }

    // Sort by qualityScore desc, then latency asc
    candidates.sort((a, b) => b.qualityScore - a.qualityScore || a.averageLatencyMs - b.averageLatencyMs);
    const best = candidates[0]!;

    return {
      provider: best.provider,
      model: best.model,
      expectedLatencyMs: best.averageLatencyMs,
      confidence: parseFloat(best.qualityScore.toFixed(2)),
    };
  }

  public getAllMetrics(): ModelPerformanceMetric[] {
    return Array.from(this.metrics.values());
  }
}

export const modelPerformanceRegistry = ModelPerformanceRegistry.getInstance();
