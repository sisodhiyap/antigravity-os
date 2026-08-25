/**
 * ANTIGRAVITY LEVEL-5 CANARY DEPLOYMENT ORCHESTRATOR
 *
 * Implements controlled, phased traffic progression:
 * 5% -> 25% -> 50% -> 100%
 * Evaluates real-time health thresholds at each stage and triggers immediate rollback on SLA degradation.
 */
import { releaseStateMachine } from "./release-state-machine";
import { rollbackOrchestrator } from "./rollback-orchestrator";

export type CanaryStage = 5 | 25 | 50 | 100;

export interface CanaryHealthMetrics {
  errorRatePercent: number; // Max 2.0% allowed
  p95LatencyMs: number;     // Max 500ms allowed
  http5xxCount: number;     // Must be 0
  criticalSecurityAlerts: number; // Must be 0
}

export interface CanaryProgressRecord {
  canaryId: string;
  releaseId: string;
  currentPercentage: CanaryStage;
  stageHistory: {
    percentage: CanaryStage;
    timestamp: string;
    metrics: CanaryHealthMetrics;
    status: "HEALTHY" | "DEGRADED" | "FAILED";
  }[];
  isComplete: boolean;
  isRolledBack: boolean;
  createdAt: string;
  updatedAt: string;
}

export class CanaryOrchestrator {
  private static instance: CanaryOrchestrator;
  private canaries: Map<string, CanaryProgressRecord> = new Map();

  private constructor() {}

  public static getInstance(): CanaryOrchestrator {
    if (!CanaryOrchestrator.instance) {
      CanaryOrchestrator.instance = new CanaryOrchestrator();
    }
    return CanaryOrchestrator.instance;
  }

  /**
   * Starts a new canary deployment at initial 5% traffic weight
   */
  public startCanary(releaseId: string, initialMetrics?: CanaryHealthMetrics): CanaryProgressRecord {
    const canaryId = `canary_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const metrics: CanaryHealthMetrics = initialMetrics || {
      errorRatePercent: 0.0,
      p95LatencyMs: 45,
      http5xxCount: 0,
      criticalSecurityAlerts: 0,
    };

    const record: CanaryProgressRecord = {
      canaryId,
      releaseId,
      currentPercentage: 5,
      stageHistory: [
        {
          percentage: 5,
          timestamp: now,
          metrics,
          status: "HEALTHY",
        },
      ],
      isComplete: false,
      isRolledBack: false,
      createdAt: now,
      updatedAt: now,
    };

    this.canaries.set(canaryId, record);
    return record;
  }

  /**
   * Evaluates health metrics and advances canary to next traffic tier: 5% -> 25% -> 50% -> 100%
   */
  public async evaluateAndAdvance(
    canaryId: string,
    metrics: CanaryHealthMetrics
  ): Promise<{
    advanced: boolean;
    currentPercentage: CanaryStage;
    status: "HEALTHY" | "DEGRADED" | "ROLLED_BACK" | "COMPLETED";
    reason: string;
  }> {
    const record = this.canaries.get(canaryId);
    if (!record) {
      throw new Error(`Canary progress record not found: [${canaryId}]`);
    }

    // 1. SLA & Health Threshold Checks
    const isErrorRateViolation = metrics.errorRatePercent > 2.0;
    const isLatencyViolation = metrics.p95LatencyMs > 500;
    const has5xxErrors = metrics.http5xxCount > 0;
    const hasSecurityAlerts = metrics.criticalSecurityAlerts > 0;

    const isFailure = isErrorRateViolation || isLatencyViolation || has5xxErrors || hasSecurityAlerts;

    if (isFailure) {
      // Trigger automated rollback
      record.isRolledBack = true;
      record.updatedAt = new Date().toISOString();
      record.stageHistory.push({
        percentage: record.currentPercentage,
        timestamp: record.updatedAt,
        metrics,
        status: "FAILED",
      });

      await rollbackOrchestrator.executeRollback({
        releaseId: record.releaseId,
        triggerReason: "HEALTH_CHECK_FAILURE",
        details: `Canary SLA breach at ${record.currentPercentage}%: errorRate=${metrics.errorRatePercent}%, 5xx=${metrics.http5xxCount}, p95=${metrics.p95LatencyMs}ms`,
        actor: "CANARY_WATCHDOG",
      });

      return {
        advanced: false,
        currentPercentage: record.currentPercentage,
        status: "ROLLED_BACK",
        reason: `Canary failed SLA thresholds. Automatic rollback executed.`,
      };
    }

    // 2. Advance to next tier
    const stageMap: Record<CanaryStage, CanaryStage | null> = {
      5: 25,
      25: 50,
      50: 100,
      100: null,
    };

    const nextPercentage = stageMap[record.currentPercentage];
    if (nextPercentage === null) {
      record.isComplete = true;
      record.updatedAt = new Date().toISOString();
      return {
        advanced: false,
        currentPercentage: 100,
        status: "COMPLETED",
        reason: "Canary promotion 100% complete. Full production traffic active.",
      };
    }

    record.currentPercentage = nextPercentage;
    record.updatedAt = new Date().toISOString();
    record.stageHistory.push({
      percentage: nextPercentage,
      timestamp: record.updatedAt,
      metrics,
      status: "HEALTHY",
    });

    if (nextPercentage === 100) {
      record.isComplete = true;
    }

    return {
      advanced: true,
      currentPercentage: nextPercentage,
      status: nextPercentage === 100 ? "COMPLETED" : "HEALTHY",
      reason: `Promoted to ${nextPercentage}% traffic weight. All SLA thresholds satisfied.`,
    };
  }

  public getCanary(canaryId: string): CanaryProgressRecord | undefined {
    return this.canaries.get(canaryId);
  }
}

export const canaryOrchestrator = CanaryOrchestrator.getInstance();
