/**
 * ANTIGRAVITY OS v5.3 — MISSION STATE MACHINE
 * MissionState: Full lifecycle state manager with telemetry and audit event stream
 */

export type MissionPhase =
  | "MISSION_CREATED"
  | "REQUIREMENTS_ANALYZED"
  | "CONTEXT_ASSEMBLED"
  | "GRAPH_BUILT"
  | "PLAN_VALIDATED"
  | "EXECUTION_STARTED"
  | "TASKS_RUNNING"
  | "ARTIFACTS_GENERATED"
  | "TESTING"
  | "SECURITY_AUDIT"
  | "PERFORMANCE_AUDIT"
  | "CRITIQUE"
  | "REPAIR"
  | "REGRESSION_TEST"
  | "EVIDENCE_CAPTURE"
  | "CERTIFICATION"
  | "MISSION_COMPLETE"
  | "MISSION_FAILED"
  | "MISSION_PAUSED"
  | "MISSION_ROLLED_BACK";

export interface MissionEvent {
  id: string;
  timestamp: string;
  phase: MissionPhase;
  nodeId?: string;
  agent?: string;
  message: string;
  payload?: any;
}

export interface ResourceBudget {
  maxDurationMs: number;
  maxRetries: number;
  maxMemoryMb: number;
  maxTokens: number;
  allowCloudFallback: boolean;
}

export class MissionState {
  public readonly missionId: string;
  public phase: MissionPhase = "MISSION_CREATED";
  public readonly events: MissionEvent[] = [];
  public readonly budget: ResourceBudget;
  public startedAt: string;
  public completedAt?: string;
  public tokensUsed: number = 0;
  public totalRetries: number = 0;
  public currentCheckpointId?: string;
  public activeAgents: Set<string> = new Set();

  constructor(missionId: string, budget?: Partial<ResourceBudget>) {
    this.missionId = missionId;
    this.startedAt = new Date().toISOString();
    this.budget = {
      maxDurationMs: budget?.maxDurationMs || 300000,
      maxRetries: budget?.maxRetries !== undefined ? budget.maxRetries : 5,
      maxMemoryMb: budget?.maxMemoryMb || 1024,
      maxTokens: budget?.maxTokens || 100000,
      allowCloudFallback: budget?.allowCloudFallback !== undefined ? budget.allowCloudFallback : true
    };
    this.addEvent("MISSION_CREATED", "Mission initialized in state machine");
  }

  public transition(nextPhase: MissionPhase, message: string, payload?: any) {
    this.phase = nextPhase;
    this.addEvent(nextPhase, message, undefined, payload);
    if (nextPhase === "MISSION_COMPLETE" || nextPhase === "MISSION_FAILED" || nextPhase === "MISSION_ROLLED_BACK") {
      this.completedAt = new Date().toISOString();
    }
  }

  public addEvent(phase: MissionPhase, message: string, nodeId?: string, payload?: any) {
    const event: MissionEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      phase,
      nodeId,
      message,
      payload
    };
    this.events.push(event);
  }

  public recordTokenUsage(tokens: number) {
    this.tokensUsed += tokens;
  }

  public isBudgetExceeded(elapsedMs: number): { exceeded: boolean; reason?: string } {
    if (elapsedMs > this.budget.maxDurationMs) {
      return { exceeded: true, reason: `Max duration exceeded (${elapsedMs}ms > ${this.budget.maxDurationMs}ms)` };
    }
    if (this.tokensUsed > this.budget.maxTokens) {
      return { exceeded: true, reason: `Token budget exceeded (${this.tokensUsed} > ${this.budget.maxTokens})` };
    }
    return { exceeded: false };
  }

  public toJSON() {
    return {
      missionId: this.missionId,
      phase: this.phase,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      tokensUsed: this.tokensUsed,
      totalRetries: this.totalRetries,
      currentCheckpointId: this.currentCheckpointId,
      budget: this.budget,
      eventsCount: this.events.length,
      recentEvents: this.events.slice(-10)
    };
  }
}
