import { PermissionAction } from "./types";
import { EventBus } from "./eventBus";

export interface PermissionPolicy {
  entityId: string;
  entityType: "SERVICE" | "PLUGIN" | "AGENT" | "USER";
  allowedActions: Set<PermissionAction>;
  grantedAt: Date;
  grantedBy: string;
}

export class PermissionManager {
  private static instance: PermissionManager;
  private policies: Map<string, PermissionPolicy> = new Map();
  private auditLog: Array<{
    timestamp: string;
    entityId: string;
    action: PermissionAction;
    allowed: boolean;
    reason?: string;
  }> = [];

  private constructor() {
    // Default root admin policy for Kernel internals
    this.grant("kernel-core", "SERVICE", [
      "READ",
      "WRITE",
      "EXECUTE",
      "SPAWN_PROCESS",
      "DATABASE_MUTATE",
      "MCP_INVOKE",
      "DEPLOY",
      "SECRET_ACCESS",
      "ADMIN",
    ], "SYSTEM_BOOT");
  }

  public static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  /**
   * Grant permissions to a service or plugin
   */
  public grant(
    entityId: string,
    entityType: "SERVICE" | "PLUGIN" | "AGENT" | "USER",
    actions: PermissionAction[],
    grantedBy = "KERNEL"
  ): void {
    const existing = this.policies.get(entityId);
    const allowedActions = existing ? existing.allowedActions : new Set<PermissionAction>();
    actions.forEach((a) => allowedActions.add(a));

    this.policies.set(entityId, {
      entityId,
      entityType,
      allowedActions,
      grantedAt: new Date(),
      grantedBy,
    });

    EventBus.getInstance().emit("permission:granted", "PermissionManager", {
      entityId,
      entityType,
      actions,
      grantedBy,
    });
  }

  /**
   * Revoke permission from an entity
   */
  public revoke(entityId: string, action: PermissionAction): void {
    const policy = this.policies.get(entityId);
    if (policy) {
      policy.allowedActions.delete(action);
      EventBus.getInstance().emit("permission:revoked", "PermissionManager", {
        entityId,
        action,
      });
    }
  }

  /**
   * Check if an entity is authorized to perform an action
   */
  public isAuthorized(entityId: string, action: PermissionAction): boolean {
    const policy = this.policies.get(entityId);
    const allowed = policy ? policy.allowedActions.has(action) || policy.allowedActions.has("ADMIN") : false;

    this.auditLog.push({
      timestamp: new Date().toISOString(),
      entityId,
      action,
      allowed,
      reason: allowed ? "Explicit policy match" : "Action not granted in entity policy",
    });

    if (this.auditLog.length > 500) {
      this.auditLog.shift();
    }

    return allowed;
  }

  /**
   * Assert permission or throw authorization error
   */
  public enforce(entityId: string, action: PermissionAction): void {
    if (!this.isAuthorized(entityId, action)) {
      throw new Error(
        `[SecurityError] Access Denied: Entity '${entityId}' lacks required permission '${action}'.`
      );
    }
  }

  /**
   * Get all registered permission policies
   */
  public getPolicies(): Array<{
    entityId: string;
    entityType: string;
    allowedActions: PermissionAction[];
    grantedAt: Date;
    grantedBy: string;
  }> {
    return Array.from(this.policies.values()).map((p) => ({
      entityId: p.entityId,
      entityType: p.entityType,
      allowedActions: Array.from(p.allowedActions),
      grantedAt: p.grantedAt,
      grantedBy: p.grantedBy,
    }));
  }

  public getAuditLog() {
    return [...this.auditLog].slice(-100);
  }
}
