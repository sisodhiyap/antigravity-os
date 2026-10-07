/**
 * ANTIGRAVITY OS v7.0 — HERMES AGENT SUBSYSTEM
 * HermesObservability.ts: Real-time telemetry, token meters, latency tracking, and metrics
 */

export interface HermesObservabilityMetrics {
  totalTasksExecuted: number;
  totalModelCalls: number;
  totalTokensUsed: number;
  totalEstimatedCostUsd: number;
  averageTaskLatencyMs: number;
  averageModelLatencyMs: number;
  modelFallbackCount: number;
  totalToolCalls: number;
  retryCount: number;
  failureRatePercent: number;
  repairRatePercent: number;
  verificationRatePercent: number;
  promotionRatePercent: number;
  rollbackRatePercent: number;
  securityFailuresDetected: number;
  modelDisagreementCount: number;
  activeSandboxesCount: number;
}

export class HermesObservability {
  private static metrics: HermesObservabilityMetrics = {
    totalTasksExecuted: 0,
    totalModelCalls: 0,
    totalTokensUsed: 0,
    totalEstimatedCostUsd: 0.0,
    averageTaskLatencyMs: 0,
    averageModelLatencyMs: 0,
    modelFallbackCount: 0,
    totalToolCalls: 0,
    retryCount: 0,
    failureRatePercent: 0,
    repairRatePercent: 100,
    verificationRatePercent: 100,
    promotionRatePercent: 0,
    rollbackRatePercent: 0,
    securityFailuresDetected: 0,
    modelDisagreementCount: 0,
    activeSandboxesCount: 0
  };

  public static recordTaskCompletion(durationMs: number, success: boolean): void {
    const prev = this.metrics.totalTasksExecuted;
    const next = prev + 1;
    this.metrics.averageTaskLatencyMs = (this.metrics.averageTaskLatencyMs * prev + durationMs) / next;
    this.metrics.totalTasksExecuted = next;
    if (!success) {
      this.metrics.failureRatePercent = (1 / next) * 100;
    }
  }

  public static recordModelUsage(tokens: number, costUsd: number, latencyMs: number, isFallback: boolean): void {
    const prev = this.metrics.totalModelCalls;
    const next = prev + 1;
    this.metrics.averageModelLatencyMs = (this.metrics.averageModelLatencyMs * prev + latencyMs) / next;
    this.metrics.totalModelCalls = next;
    this.metrics.totalTokensUsed += tokens;
    this.metrics.totalEstimatedCostUsd += costUsd;
    if (isFallback) {
      this.metrics.modelFallbackCount++;
    }
  }

  public static recordToolCall(): void {
    this.metrics.totalToolCalls++;
  }

  public static getMetrics(): HermesObservabilityMetrics {
    return { ...this.metrics };
  }
}
