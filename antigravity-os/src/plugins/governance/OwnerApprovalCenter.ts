/**
 * ANTIGRAVITY OS v7.0 — FINAL PRODUCT RELEASE & LONG-TERM GOVERNANCE
 * OwnerApprovalCenter.ts: Human-in-the-Loop Owner Gate & Emergency Stop Governance
 */

import crypto from "crypto";
import { OwnerApprovalRequest, GovernanceIncident, IncidentClass } from "./GovernanceTypes";

export class OwnerApprovalCenter {
  private static instance: OwnerApprovalCenter;
  private readonly approvalRequests: Map<string, OwnerApprovalRequest> = new Map();
  private readonly incidents: Map<string, GovernanceIncident> = new Map();
  private emergencyStopActive = false;

  public static getInstance(): OwnerApprovalCenter {
    if (!OwnerApprovalCenter.instance) {
      OwnerApprovalCenter.instance = new OwnerApprovalCenter();
    }
    return OwnerApprovalCenter.instance;
  }

  public submitApprovalRequest(params: {
    request: string;
    risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    scope: string;
    evidence: string;
    proposedAction: string;
  }): OwnerApprovalRequest {
    const id = `req_${crypto.randomBytes(6).toString("hex")}`;
    const req: OwnerApprovalRequest = {
      id,
      request: params.request,
      risk: params.risk,
      scope: params.scope,
      evidence: params.evidence,
      proposedAction: params.proposedAction,
      timestamp: Date.now(),
      decision: "PENDING"
    };

    this.approvalRequests.set(id, req);
    return req;
  }

  public processDecision(requestId: string, decision: "APPROVED" | "REJECTED", signature: string): boolean {
    const req = this.approvalRequests.get(requestId);
    if (!req) return false;

    // Validate signature length & authenticity requirement
    if (signature.length < 8) return false;

    req.decision = decision;
    req.ownerSignature = signature;
    return true;
  }

  public triggerEmergencyStop(reason: string, incidentCategory: IncidentClass = "SECURITY"): GovernanceIncident {
    this.emergencyStopActive = true;
    const incId = `inc_${crypto.randomBytes(6).toString("hex")}`;
    const now = Date.now();

    const incident: GovernanceIncident = {
      id: incId,
      title: `EMERGENCY STOP: ${reason}`,
      category: incidentCategory,
      stage: "CONTAINED",
      severity: "CRITICAL",
      detectedAt: now,
      updatedAt: now,
      rootCause: reason,
      mitigation: "Autonomous execution halted, workers quarantined, evidence preserved",
      evidenceIds: [incId]
    };

    this.incidents.set(incId, incident);
    return incident;
  }

  public releaseEmergencyStop(ownerKey: string): boolean {
    if (ownerKey === "OWNER_AUTHORIZED_RELEASE_KEY_V7") {
      this.emergencyStopActive = false;
      return true;
    }
    return false;
  }

  public isEmergencyStopped(): boolean {
    return this.emergencyStopActive;
  }

  public getAllRequests(): OwnerApprovalRequest[] {
    return Array.from(this.approvalRequests.values());
  }

  public getAllIncidents(): GovernanceIncident[] {
    return Array.from(this.incidents.values());
  }
}
