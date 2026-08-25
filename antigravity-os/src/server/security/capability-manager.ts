/**
 * ANTIGRAVITY LEVEL-5 CAPABILITY-BASED SECURITY ENGINE
 *
 * Implements fine-grained, capability-based authorization for all autonomous agents.
 * Replaces pure command blacklists with explicit, scoped, revocable capability grants.
 */

export type CapabilityType =
  | "fs.read"
  | "fs.write"
  | "test.run"
  | "browser.run"
  | "http.test"
  | "db.schema.read"
  | "db.query.read"
  | "artifact.read"
  | "artifact.write"
  | "staging.deploy"
  | "rollback.execute"
  | "production.deploy" // Requires PolicyEngine + HumanApprovalGate
  | "db.destructive";  // Requires PolicyEngine + HumanApprovalGate

export interface CapabilityGrant {
  grantId: string;
  agentRole: string;
  capability: CapabilityType;
  scopePattern: string; // e.g., "/project/src/**" or "workspace:default"
  workspaceId: string;
  expiresAt: number; // Unix epoch ms
  revoked: boolean;
}

export interface CapabilityAuditEntry {
  auditId: string;
  agentRole: string;
  taskId: string;
  workspaceId: string;
  capability: CapabilityType;
  targetResource: string;
  allowed: boolean;
  reason: string;
  timestamp: string;
}

// Default role capability matrix
const DEFAULT_ROLE_CAPABILITIES: Record<string, CapabilityType[]> = {
  PRODUCT_MANAGER: ["artifact.read", "artifact.write", "test.run"],
  UX_DESIGNER: ["artifact.read", "artifact.write", "fs.read"],
  ARCHITECT: ["fs.read", "artifact.read", "artifact.write", "db.schema.read"],
  BUILDER: ["fs.read", "fs.write", "test.run", "artifact.read", "artifact.write"],
  QA_ENGINEER: ["fs.read", "test.run", "browser.run", "http.test", "artifact.read", "artifact.write"],
  SECURITY_ENGINEER: ["fs.read", "test.run", "artifact.read", "artifact.write"],
  DEVOPS_ENGINEER: ["fs.read", "artifact.read", "artifact.write", "staging.deploy", "rollback.execute"],
  SRE_ENGINEER: ["fs.read", "artifact.read", "test.run", "rollback.execute"],
};

export class CapabilityManager {
  private static instance: CapabilityManager;
  private grants: Map<string, CapabilityGrant> = new Map();
  private auditLog: CapabilityAuditEntry[] = [];

  private constructor() {
    this.seedDefaultGrants();
  }

  public static getInstance(): CapabilityManager {
    if (!CapabilityManager.instance) {
      CapabilityManager.instance = new CapabilityManager();
    }
    return CapabilityManager.instance;
  }

  private seedDefaultGrants() {
    for (const [role, caps] of Object.entries(DEFAULT_ROLE_CAPABILITIES)) {
      for (const cap of caps) {
        this.grantCapability({
          agentRole: role,
          capability: cap,
          scopePattern: "**",
          workspaceId: "*",
          ttlSeconds: 86400 * 365,
        });
      }
    }
  }

  public grantCapability(params: {
    agentRole: string;
    capability: CapabilityType;
    scopePattern?: string;
    workspaceId?: string;
    ttlSeconds?: number;
  }): CapabilityGrant {
    const grantId = `grant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const grant: CapabilityGrant = {
      grantId,
      agentRole: params.agentRole,
      capability: params.capability,
      scopePattern: params.scopePattern || "**",
      workspaceId: params.workspaceId || "*",
      expiresAt: Date.now() + (params.ttlSeconds || 3600) * 1000,
      revoked: false,
    };

    this.grants.set(grantId, grant);
    return grant;
  }

  public revokeCapability(grantId: string): boolean {
    const grant = this.grants.get(grantId);
    if (grant) {
      grant.revoked = true;
      return true;
    }
    return false;
  }

  /**
   * Authorizes whether an agent role holds a valid, non-expired capability for a resource
   */
  public authorize(params: {
    agentRole: string;
    capability: CapabilityType;
    targetResource: string;
    workspaceId: string;
    taskId?: string;
  }): { allowed: boolean; reason: string } {
    const now = Date.now();

    // Critical capabilities ALWAYS require policy approval
    if (params.capability === "production.deploy" || params.capability === "db.destructive") {
      const reason = `Capability [${params.capability}] requires mandatory HumanApprovalGate + PolicyEngine evaluation`;
      this.recordAudit({ ...params, allowed: false, reason });
      return { allowed: false, reason };
    }

    // Find matching active grant
    for (const grant of this.grants.values()) {
      if (grant.revoked) continue;
      if (grant.expiresAt < now) continue;
      if (grant.agentRole !== params.agentRole && grant.agentRole !== "*") continue;
      if (grant.capability !== params.capability) continue;
      if (grant.workspaceId !== "*" && grant.workspaceId !== params.workspaceId) continue;

      const reason = `Authorized by grant [${grant.grantId}] (scope: ${grant.scopePattern})`;
      this.recordAudit({ ...params, allowed: true, reason });
      return { allowed: true, reason };
    }

    const reason = `Denied: Agent role [${params.agentRole}] lacks capability [${params.capability}] for resource [${params.targetResource}]`;
    this.recordAudit({ ...params, allowed: false, reason });
    return { allowed: false, reason };
  }

  private recordAudit(params: {
    agentRole: string;
    capability: CapabilityType;
    targetResource: string;
    workspaceId: string;
    taskId?: string;
    allowed: boolean;
    reason: string;
  }) {
    const entry: CapabilityAuditEntry = {
      auditId: `cap_aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      agentRole: params.agentRole,
      taskId: params.taskId || "task_unspecified",
      workspaceId: params.workspaceId,
      capability: params.capability,
      targetResource: params.targetResource,
      allowed: params.allowed,
      reason: params.reason,
      timestamp: new Date().toISOString(),
    };

    this.auditLog.unshift(entry);
    if (this.auditLog.length > 500) this.auditLog.pop();
  }

  public getAuditLog(): CapabilityAuditEntry[] {
    return this.auditLog;
  }
}

export const capabilityManager = CapabilityManager.getInstance();
