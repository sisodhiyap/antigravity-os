import { ToolRiskLevel } from "../tools/registry";
import { quotaEngine } from "../ai/quota";

export type ActionRiskLevel = "READ_ONLY" | "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK" | "PRODUCTION_CRITICAL";

export type ApprovalStatus = "PENDING" | "APPROVED" | "DENIED" | "EXPIRED";

export interface ApprovalRequest {
  id: string;
  taskId: string;
  agentRole: string;
  action: string;
  riskLevel: ActionRiskLevel;
  reason: string;
  resourcesAffected: string[];
  estimatedCostUsd: number;
  rollbackStrategy: string;
  status: ApprovalStatus;
  requestedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  decisionNote?: string;
}

export interface PolicyCheckResult {
  allowed: boolean;
  requiresApproval: boolean;
  riskLevel: ActionRiskLevel;
  approvalRequestId?: string;
  reason?: string;
}

export class AntigravityPolicyEngine {
  private static instance: AntigravityPolicyEngine;
  private approvalQueue: Map<string, ApprovalRequest> = new Map();

  private constructor() {}

  public static getInstance(): AntigravityPolicyEngine {
    if (!AntigravityPolicyEngine.instance) {
      AntigravityPolicyEngine.instance = new AntigravityPolicyEngine();
    }
    return AntigravityPolicyEngine.instance;
  }

  /**
   * Classifies an action's risk level
   */
  public classifyRisk(action: string, toolRisk?: ToolRiskLevel): ActionRiskLevel {
    if (
      action.includes("deploy:prod") ||
      action.includes("db:drop") ||
      action.includes("secret:modify") ||
      action.includes("repo:delete")
    ) {
      return "PRODUCTION_CRITICAL";
    }

    if (
      action.includes("git:push") ||
      action.includes("db:migrate") ||
      action.includes("npm:publish") ||
      action.includes("cloud:resource_create")
    ) {
      return "HIGH_RISK";
    }

    if (action.includes("fs:write") || action.includes("git:commit") || action.includes("npm:install")) {
      return "MEDIUM_RISK";
    }

    if (action.includes("fs:read") || action.includes("git:status") || action.includes("test:run")) {
      return "READ_ONLY";
    }

    if (toolRisk === "READ_ONLY") return "READ_ONLY";
    if (toolRisk === "LOW_RISK_WRITE") return "LOW_RISK";
    if (toolRisk === "HIGH_RISK_WRITE") return "HIGH_RISK";
    if (toolRisk === "PRODUCTION_CRITICAL") return "PRODUCTION_CRITICAL";

    return "LOW_RISK";
  }

  /**
   * Evaluates an agent action against safety policies, risk level, budget, and approval requirements
   */
  public evaluateAction(params: {
    taskId: string;
    agentRole: string;
    action: string;
    workspaceId: string;
    userRole?: string;
    resourcesAffected?: string[];
    estimatedCostUsd?: number;
    rollbackStrategy?: string;
  }): PolicyCheckResult {
    const riskLevel = this.classifyRisk(params.action);

    // 1. Budget Gate
    if (!quotaEngine.checkBudget(params.workspaceId)) {
      return {
        allowed: false,
        requiresApproval: false,
        riskLevel,
        reason: "Workspace budget limit reached",
      };
    }

    // 2. Read-Only / Low Risk actions are automatically allowed
    if (riskLevel === "READ_ONLY" || riskLevel === "LOW_RISK") {
      return {
        allowed: true,
        requiresApproval: false,
        riskLevel,
      };
    }

    // 3. Medium Risk actions allowed for trusted builders / automated test runners
    if (riskLevel === "MEDIUM_RISK") {
      return {
        allowed: true,
        requiresApproval: false,
        riskLevel,
      };
    }

    // 4. High Risk & Production Critical actions require explicit operator approval
    const approvalId = `appr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const request: ApprovalRequest = {
      id: approvalId,
      taskId: params.taskId,
      agentRole: params.agentRole,
      action: params.action,
      riskLevel,
      reason: `Agent [${params.agentRole}] requested high-risk operation: ${params.action}`,
      resourcesAffected: params.resourcesAffected || [],
      estimatedCostUsd: params.estimatedCostUsd || 0.0,
      rollbackStrategy: params.rollbackStrategy || "Git revert checkpoint",
      status: "PENDING",
      requestedAt: new Date().toISOString(),
    };

    this.approvalQueue.set(approvalId, request);

    return {
      allowed: false,
      requiresApproval: true,
      riskLevel,
      approvalRequestId: approvalId,
      reason: `Operation [${params.action}] requires human operator approval (${riskLevel})`,
    };
  }

  public recordDecision(
    approvalId: string,
    decision: "APPROVED" | "DENIED",
    decidedBy = "Operator",
    decisionNote?: string
  ): ApprovalRequest {
    const req = this.approvalQueue.get(approvalId);
    if (!req) {
      throw new Error(`Approval request '${approvalId}' not found`);
    }

    req.status = decision;
    req.decidedAt = new Date().toISOString();
    req.decidedBy = decidedBy;
    req.decisionNote = decisionNote;

    return req;
  }

  public getApproval(id: string): ApprovalRequest | undefined {
    return this.approvalQueue.get(id);
  }

  public getAllApprovals(status?: ApprovalStatus): ApprovalRequest[] {
    const all = Array.from(this.approvalQueue.values());
    if (status) {
      return all.filter((a) => a.status === status);
    }
    return all;
  }
}

export const policyEngine = AntigravityPolicyEngine.getInstance();
