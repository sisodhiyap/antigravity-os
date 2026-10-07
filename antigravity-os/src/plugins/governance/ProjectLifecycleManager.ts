/**
 * ANTIGRAVITY OS v7.0 — FINAL PRODUCT RELEASE & LONG-TERM GOVERNANCE
 * ProjectLifecycleManager.ts: Deterministic 15-State Project Lifecycle State Machine
 */

import { ProjectState, ProjectStateTransition } from "./GovernanceTypes";

export class ProjectLifecycleManager {
  private static instance: ProjectLifecycleManager;
  private readonly projectStates: Map<string, ProjectState> = new Map();
  private readonly transitions: ProjectStateTransition[] = [];

  private readonly validTransitions: Record<ProjectState, ProjectState[]> = {
    NEW: ["IMPORTING", "PLANNING", "ARCHIVED"],
    IMPORTING: ["UNDERSTANDING", "FAILED"],
    UNDERSTANDING: ["VERIFYING", "PLANNING", "FAILED"],
    VERIFYING: ["PLANNING", "FAILED", "ROLLED_BACK"],
    PLANNING: ["BUILDING", "FAILED"],
    BUILDING: ["TESTING", "FAILED", "ROLLED_BACK"],
    TESTING: ["REVIEW", "FAILED", "ROLLED_BACK"],
    REVIEW: ["APPROVAL", "PLANNING", "FAILED"],
    APPROVAL: ["EXPORTING", "BUILDING", "REJECTED" as any, "FAILED"],
    EXPORTING: ["AUDITING", "FAILED"],
    AUDITING: ["RELEASED", "FAILED", "ROLLED_BACK"],
    RELEASED: ["ARCHIVED", "ROLLED_BACK"],
    FAILED: ["PLANNING", "ROLLED_BACK", "ARCHIVED"],
    ROLLED_BACK: ["PLANNING", "UNDERSTANDING", "ARCHIVED"],
    ARCHIVED: ["NEW"]
  };

  public static getInstance(): ProjectLifecycleManager {
    if (!ProjectLifecycleManager.instance) {
      ProjectLifecycleManager.instance = new ProjectLifecycleManager();
    }
    return ProjectLifecycleManager.instance;
  }

  public initializeProject(projectId: string): ProjectState {
    this.projectStates.set(projectId, "NEW");
    this.recordTransition(projectId, "NEW", "NEW", "SYSTEM", "Project initialized", "INIT_EVENT");
    return "NEW";
  }

  public transition(
    projectId: string,
    toState: ProjectState,
    actor: string,
    reason: string,
    evidence: string
  ): { success: boolean; state: ProjectState; error?: string } {
    const currentState = this.projectStates.get(projectId) || "NEW";

    const allowed = this.validTransitions[currentState] || [];
    if (!allowed.includes(toState) && toState !== "FAILED" && toState !== "ROLLED_BACK") {
      return {
        success: false,
        state: currentState,
        error: `INVALID_TRANSITION: Cannot transition from ${currentState} to ${toState}`
      };
    }

    this.projectStates.set(projectId, toState);
    this.recordTransition(projectId, currentState, toState, actor, reason, evidence);

    return {
      success: true,
      state: toState
    };
  }

  public getProjectState(projectId: string): ProjectState {
    return this.projectStates.get(projectId) || "NEW";
  }

  public getTransitions(projectId?: string): ProjectStateTransition[] {
    if (projectId) {
      return this.transitions.filter((t) => t.projectId === projectId);
    }
    return this.transitions;
  }

  private recordTransition(
    projectId: string,
    fromState: ProjectState,
    toState: ProjectState,
    actor: string,
    reason: string,
    evidence: string
  ): void {
    this.transitions.push({
      projectId,
      fromState,
      toState,
      actor,
      reason,
      evidence,
      timestamp: Date.now()
    });
  }
}
