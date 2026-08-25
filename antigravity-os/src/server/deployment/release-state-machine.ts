/**
 * ANTIGRAVITY PRODUCTION RELEASE STATE MACHINE
 *
 * Enforces strict, deterministic state transitions for the autonomous software factory.
 * Illegal state transitions are rejected with descriptive errors.
 */
import { ReleaseState, ReleaseRecord, ReleaseStateTransition } from "./types";

// Valid State Transition Map
const ALLOWED_TRANSITIONS: Record<ReleaseState, ReleaseState[]> = {
  DRAFT: ["PLANNED", "CANCELLED"],
  PLANNED: ["BUILDING", "CANCELLED", "FAILED"],
  BUILDING: ["TESTING", "FAILED", "CANCELLED"],
  TESTING: ["SECURITY_REVIEW", "FAILED", "CANCELLED"],
  SECURITY_REVIEW: ["STAGING_PENDING", "FAILED", "CANCELLED"],
  STAGING_PENDING: ["STAGING_DEPLOYING", "CANCELLED", "FAILED"],
  STAGING_DEPLOYING: ["STAGING_DEPLOYED", "FAILED", "CANCELLED"],
  STAGING_DEPLOYED: ["STAGING_VALIDATED", "ROLLBACK_PENDING", "FAILED", "CANCELLED"],
  STAGING_VALIDATED: ["APPROVAL_PENDING", "ROLLBACK_PENDING", "FAILED", "CANCELLED"],
  APPROVAL_PENDING: ["APPROVED", "ROLLBACK_PENDING", "FAILED", "CANCELLED"],
  APPROVED: ["PRODUCTION_DEPLOYING", "ROLLBACK_PENDING", "CANCELLED", "FAILED"],
  PRODUCTION_DEPLOYING: ["PRODUCTION_HEALTH_CHECK", "FAILED", "ROLLBACK_PENDING"],
  PRODUCTION_HEALTH_CHECK: ["PRODUCTION_VALIDATED", "ROLLBACK_PENDING", "FAILED"],
  PRODUCTION_VALIDATED: ["RELEASED", "ROLLBACK_PENDING"],
  RELEASED: ["ROLLBACK_PENDING"],
  ROLLBACK_PENDING: ["ROLLING_BACK", "FAILED"],
  ROLLING_BACK: ["ROLLED_BACK", "FAILED"],
  ROLLED_BACK: ["PLANNED", "DRAFT"],
  FAILED: ["DRAFT", "PLANNED"],
  CANCELLED: ["DRAFT", "PLANNED"],
};

export class ReleaseStateMachine {
  private static instance: ReleaseStateMachine;
  private releases: Map<string, ReleaseRecord> = new Map();

  private constructor() {}

  public static getInstance(): ReleaseStateMachine {
    if (!ReleaseStateMachine.instance) {
      ReleaseStateMachine.instance = new ReleaseStateMachine();
    }
    return ReleaseStateMachine.instance;
  }

  public createRelease(params: {
    projectId: string;
    workspaceId: string;
    version: string;
    environment?: "staging" | "production";
    provider?: "vercel" | "netlify" | "local_staging";
  }): ReleaseRecord {
    const releaseId = `rel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const record: ReleaseRecord = {
      releaseId,
      projectId: params.projectId,
      workspaceId: params.workspaceId,
      version: params.version,
      state: "DRAFT",
      environment: params.environment || "staging",
      provider: params.provider || "local_staging",
      transitions: [
        {
          fromState: "DRAFT",
          toState: "DRAFT",
          timestamp: now,
          actor: "FACTORY_INITIALIZER",
          reason: "Release initialized in DRAFT state",
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.releases.set(releaseId, record);
    return record;
  }

  public getRelease(releaseId: string): ReleaseRecord | undefined {
    return this.releases.get(releaseId);
  }

  public listReleases(): ReleaseRecord[] {
    return Array.from(this.releases.values());
  }

  public transition(
    releaseId: string,
    targetState: ReleaseState,
    actor: string,
    reason?: string,
    metadata?: Record<string, unknown>
  ): ReleaseRecord {
    const release = this.releases.get(releaseId);
    if (!release) {
      throw new Error(`Release not found: [${releaseId}]`);
    }

    const currentState = release.state;
    const allowed = ALLOWED_TRANSITIONS[currentState] || [];

    if (!allowed.includes(targetState)) {
      throw new Error(
        `Illegal release state transition: Cannot transition from [${currentState}] to [${targetState}]. Allowed targets: [${allowed.join(
          ", "
        )}]`
      );
    }

    const now = new Date().toISOString();
    const transitionEntry: ReleaseStateTransition = {
      fromState: currentState,
      toState: targetState,
      timestamp: now,
      actor,
      reason,
      metadata,
    };

    release.state = targetState;
    release.updatedAt = now;
    release.transitions.push(transitionEntry);

    this.releases.set(releaseId, release);
    return release;
  }
}

export const releaseStateMachine = ReleaseStateMachine.getInstance();
