/**
 * ANTIGRAVITY OS v5.3 — OWNER CONTROL & AUTONOMY SAFETY GATES
 * OwnerControl: Enforces autonomy levels 0-5 and prevents unauthorized destructive mutations
 */

export type AutonomyLevel =
  | 0 // LEVEL 0 — MANUAL
  | 1 // LEVEL 1 — ASSISTED
  | 2 // LEVEL 2 — SUPERVISED (Default)
  | 3 // LEVEL 3 — AUTONOMOUS
  | 4 // LEVEL 4 — AUTONOMOUS + SELF-REPAIR
  | 5; // LEVEL 5 — AUTONOMOUS ENGINEERING INTELLIGENCE

export interface ApprovalRequest {
  id: string;
  missionId: string;
  actionType: "DESTRUCTIVE_DELETE" | "DEPLOY_PRODUCTION" | "MODIFY_SECURITY_POLICY" | "PUBLIC_EXPORT";
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  approvedBy?: string;
}

export class OwnerControl {
  private static instance: OwnerControl;
  private currentAutonomyLevel: AutonomyLevel = 2; // Level 2 Default
  private isLocalOnlyEnforced: boolean = true;
  private readonly approvalQueue: Map<string, ApprovalRequest> = new Map();

  public static getInstance(): OwnerControl {
    if (!OwnerControl.instance) {
      OwnerControl.instance = new OwnerControl();
    }
    return OwnerControl.instance;
  }

  public getAutonomyLevel(): AutonomyLevel {
    return this.currentAutonomyLevel;
  }

  public setAutonomyLevel(level: AutonomyLevel) {
    this.currentAutonomyLevel = level;
  }

  public isLocalOnly(): boolean {
    return this.isLocalOnlyEnforced;
  }

  public setLocalOnly(enforced: boolean) {
    this.isLocalOnlyEnforced = enforced;
  }

  public requestApproval(
    missionId: string,
    actionType: ApprovalRequest["actionType"],
    description: string
  ): ApprovalRequest {
    const id = `appr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const req: ApprovalRequest = {
      id,
      missionId,
      actionType,
      description,
      status: "PENDING",
      createdAt: new Date().toISOString()
    };
    this.approvalQueue.set(id, req);
    return req;
  }

  public approveRequest(id: string, approver: string = "owner"): boolean {
    const req = this.approvalQueue.get(id);
    if (!req || req.status !== "PENDING") return false;
    req.status = "APPROVED";
    req.approvedBy = approver;
    return true;
  }

  public rejectRequest(id: string): boolean {
    const req = this.approvalQueue.get(id);
    if (!req || req.status !== "PENDING") return false;
    req.status = "REJECTED";
    return true;
  }

  public getPendingApprovals(): ApprovalRequest[] {
    return Array.from(this.approvalQueue.values()).filter((r) => r.status === "PENDING");
  }

  /**
   * Safety check: verifies if an operation is permitted under current autonomy level
   */
  public canExecuteOperation(action: "READ" | "WRITE" | "SELF_REPAIR" | "DESTRUCTIVE" | "DEPLOY"): boolean {
    switch (action) {
      case "READ":
        return true;
      case "WRITE":
        return this.currentAutonomyLevel >= 1;
      case "SELF_REPAIR":
        return this.currentAutonomyLevel >= 4;
      case "DESTRUCTIVE":
      case "DEPLOY":
        // Always requires explicit approval if under Level 5 or if destructive
        return false;
      default:
        return false;
    }
  }
}
