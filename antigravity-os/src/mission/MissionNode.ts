/**
 * ANTIGRAVITY OS v5.3 — GRAPH ENGINEERING ENGINE
 * MissionNode: First-class executable graph node definition
 */

export type NodeStatus =
  | "PENDING"
  | "READY"
  | "RUNNING"
  | "BLOCKED"
  | "WAITING"
  | "SUCCESS"
  | "FAILED"
  | "RETRYING"
  | "REPAIRED"
  | "ROLLED_BACK"
  | "ESCALATED"
  | "SKIPPED"
  | "VERIFIED";

export type NodeType =
  | "REQUIREMENT"
  | "ARCHITECTURE"
  | "DATABASE"
  | "BACKEND_API"
  | "FRONTEND_UI"
  | "INTEGRATION"
  | "UNIT_TEST"
  | "API_TEST"
  | "SECURITY_AUDIT"
  | "PERFORMANCE_AUDIT"
  | "DOCKER_BUILD"
  | "FAILURE_INJECTION"
  | "SELF_REPAIR"
  | "REGRESSION_TEST"
  | "HUMAN_APPROVAL"
  | "EVIDENCE_CAPTURE"
  | "CERTIFICATION";

export type EdgeType =
  | "DEPENDENCY"
  | "RETRY"
  | "FALLBACK"
  | "HUMAN_APPROVAL"
  | "ROLLBACK"
  | "TERMINAL";

export interface NodeEdge {
  fromNodeId: string;
  toNodeId: string;
  edgeType: EdgeType;
  condition?: (output: any) => boolean;
}

export interface NodeEvidence {
  timestamp: string;
  command?: string;
  stdoutHash?: string;
  artifacts?: string[];
  assertionsPassed?: number;
  assertionsFailed?: number;
  metrics?: Record<string, number | string>;
}

export interface NodeFailureHistory {
  attempt: number;
  error: string;
  category: string;
  repairStrategy?: string;
  timestamp: string;
}

export interface MissionNodeConfig {
  id: string;
  type: NodeType;
  title: string;
  description: string;
  dependencies: string[];
  ownerAgent: string;
  requiredCapabilities: string[];
  modelPreference?: string;
  timeoutMs?: number;
  maxRetries?: number;
  requiresHumanApproval?: boolean;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  handler?: (inputs: any, context: any) => Promise<any>;
}

export class MissionNode {
  public readonly id: string;
  public readonly type: NodeType;
  public readonly title: string;
  public readonly description: string;
  public readonly dependencies: string[];
  public readonly ownerAgent: string;
  public readonly requiredCapabilities: string[];
  public readonly modelPreference: string;
  public readonly timeoutMs: number;
  public readonly maxRetries: number;
  public readonly requiresHumanApproval: boolean;
  
  public status: NodeStatus = "PENDING";
  public confidence: number = 1.0;
  public retryCount: number = 0;
  public inputs: Record<string, any> = {};
  public outputs: Record<string, any> = {};
  public latencyMs: number = 0;
  public evidence: NodeEvidence[] = [];
  public failureHistory: NodeFailureHistory[] = [];
  public rollbackCheckpointId?: string;
  public handler?: (inputs: any, context: any) => Promise<any>;

  constructor(config: MissionNodeConfig) {
    this.id = config.id;
    this.type = config.type;
    this.title = config.title;
    this.description = config.description;
    this.dependencies = [...config.dependencies];
    this.ownerAgent = config.ownerAgent;
    this.requiredCapabilities = [...config.requiredCapabilities];
    this.modelPreference = config.modelPreference || "qwen2.5-coder:7b";
    this.timeoutMs = config.timeoutMs || 30000;
    this.maxRetries = config.maxRetries !== undefined ? config.maxRetries : 2;
    this.requiresHumanApproval = !!config.requiresHumanApproval;
    this.inputs = config.inputs ? { ...config.inputs } : {};
    this.outputs = config.outputs ? { ...config.outputs } : {};
    this.handler = config.handler;
  }

  public isReady(resolvedNodeIds: Set<string>): boolean {
    if (this.status !== "PENDING" && this.status !== "WAITING") return false;
    return this.dependencies.every((depId) => resolvedNodeIds.has(depId));
  }

  public recordSuccess(outputs: Record<string, any>, latencyMs: number, evidence?: NodeEvidence) {
    this.status = "SUCCESS";
    this.outputs = { ...this.outputs, ...outputs };
    this.latencyMs = latencyMs;
    if (evidence) this.evidence.push(evidence);
  }

  public recordFailure(error: string, category: string, strategy?: string) {
    this.failureHistory.push({
      attempt: this.retryCount + 1,
      error,
      category,
      repairStrategy: strategy,
      timestamp: new Date().toISOString()
    });
    this.retryCount++;
    if (this.retryCount <= this.maxRetries) {
      this.status = "RETRYING";
    } else {
      this.status = "FAILED";
    }
  }

  public toJSON() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      description: this.description,
      dependencies: this.dependencies,
      ownerAgent: this.ownerAgent,
      requiredCapabilities: this.requiredCapabilities,
      modelPreference: this.modelPreference,
      status: this.status,
      confidence: this.confidence,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      latencyMs: this.latencyMs,
      requiresHumanApproval: this.requiresHumanApproval,
      evidenceCount: this.evidence.length,
      failureCount: this.failureHistory.length,
      outputs: this.outputs
    };
  }
}
