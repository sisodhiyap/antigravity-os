/**
 * ANTIGRAVITY PRODUCTION ROLLBACK ORCHESTRATOR
 *
 * Implements bounded, audited, idempotent rollback for staging and production deployments.
 * Automatically triggered upon health check failures, critical smoke test failures,
 * or explicit operator rollback commands.
 */
import { releaseStateMachine } from "./release-state-machine";
import { ReleaseRecord } from "./types";
import { IDeploymentProvider } from "./types";
import { LocalStagingProvider } from "./providers/local-staging-provider";
import { VercelProvider } from "./providers/vercel-provider";
import { NetlifyProvider } from "./providers/netlify-provider";

export interface RollbackTriggerContext {
  releaseId: string;
  triggerReason:
    | "HEALTH_CHECK_FAILURE"
    | "SMOKE_TEST_FAILURE"
    | "5XX_ERROR_RATE_EXCEEDED"
    | "SECURITY_VIOLATION"
    | "MANUAL_OPERATOR_ROLLBACK";
  details: string;
  actor: string;
  previousStableReleaseId?: string;
}

export interface RollbackExecutionResult {
  success: boolean;
  releaseId: string;
  targetRollbackReleaseId: string;
  rollbackDeploymentId: string;
  restoredUrl: string;
  durationMs: number;
  timestamp: string;
  auditRecord: {
    actor: string;
    reason: string;
    previousState: string;
    newState: string;
  };
}

export class RollbackOrchestrator {
  private static instance: RollbackOrchestrator;
  private providers: Map<string, IDeploymentProvider> = new Map();
  private rollbackHistory: RollbackExecutionResult[] = [];

  private constructor() {
    this.providers.set("local_staging", new LocalStagingProvider());
    this.providers.set("vercel", new VercelProvider());
    this.providers.set("netlify", new NetlifyProvider());
  }

  public static getInstance(): RollbackOrchestrator {
    if (!RollbackOrchestrator.instance) {
      RollbackOrchestrator.instance = new RollbackOrchestrator();
    }
    return RollbackOrchestrator.instance;
  }

  /**
   * Executes a bounded, safe rollback to a previous release
   */
  public async executeRollback(context: RollbackTriggerContext): Promise<RollbackExecutionResult> {
    const start = performance.now();
    const release = releaseStateMachine.getRelease(context.releaseId);
    if (!release) {
      throw new Error(`Cannot rollback unknown release: [${context.releaseId}]`);
    }

    const previousState = release.state;

    // 1. Transition to ROLLBACK_PENDING
    releaseStateMachine.transition(
      context.releaseId,
      "ROLLBACK_PENDING",
      context.actor,
      `Rollback initiated due to: ${context.triggerReason} - ${context.details}`
    );

    // 2. Transition to ROLLING_BACK
    releaseStateMachine.transition(
      context.releaseId,
      "ROLLING_BACK",
      context.actor,
      "Actively applying provider rollback"
    );

    const providerName = release.provider || "local_staging";
    const provider = this.providers.get(providerName) || new LocalStagingProvider();

    // 3. Apply provider-level rollback
    const targetStableReleaseId =
      context.previousStableReleaseId || release.rollbackReleaseId || "rel_previous_stable";
    const providerRollback = await provider.rollback(targetStableReleaseId);

    // 4. Transition to ROLLED_BACK
    releaseStateMachine.transition(
      context.releaseId,
      "ROLLED_BACK",
      context.actor,
      `Rollback complete. Restored to: ${providerRollback.targetUrl}`,
      {
        rollbackDeploymentId: providerRollback.rollbackDeploymentId,
        restoredUrl: providerRollback.targetUrl,
      }
    );

    const durationMs = Math.round(performance.now() - start);

    const result: RollbackExecutionResult = {
      success: providerRollback.success,
      releaseId: context.releaseId,
      targetRollbackReleaseId: targetStableReleaseId,
      rollbackDeploymentId: providerRollback.rollbackDeploymentId,
      restoredUrl: providerRollback.targetUrl,
      durationMs,
      timestamp: new Date().toISOString(),
      auditRecord: {
        actor: context.actor,
        reason: context.triggerReason,
        previousState,
        newState: "ROLLED_BACK",
      },
    };

    this.rollbackHistory.push(result);
    return result;
  }

  public getRollbackHistory(): RollbackExecutionResult[] {
    return this.rollbackHistory;
  }
}

export const rollbackOrchestrator = RollbackOrchestrator.getInstance();
