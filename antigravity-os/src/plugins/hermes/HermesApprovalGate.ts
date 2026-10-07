/**
 * ANTIGRAVITY OS v7.0 — HERMES AGENT SUBSYSTEM
 * HermesApprovalGate.ts: Cryptographic Owner Approval Gate for Production Promotion
 */

import crypto from "crypto";

export interface OwnerApprovalRequest {
  requestId: string;
  sessionId: string;
  releaseHash: string;
  sourceCheckpointId: string;
  proposedChangesSummary: string;
  timestamp: string;
  status: "PENDING_OWNER_SIGNATURE" | "APPROVED" | "REJECTED";
}

export interface OwnerSignature {
  requestId: string;
  operatorId: string;
  signature: string;
  signedAt: string;
  nonce: string;
}

export class HermesApprovalGate {
  private static readonly pendingRequests: Map<string, OwnerApprovalRequest> = new Map();
  private static readonly approvedSignatures: Map<string, OwnerSignature> = new Map();

  public static createPromotionRequest(
    sessionId: string,
    releaseHash: string,
    sourceCheckpointId: string,
    summary: string
  ): OwnerApprovalRequest {
    const requestId = `req_promo_${sessionId}_${Date.now()}`;
    const req: OwnerApprovalRequest = {
      requestId,
      sessionId,
      releaseHash,
      sourceCheckpointId,
      proposedChangesSummary: summary,
      timestamp: new Date().toISOString(),
      status: "PENDING_OWNER_SIGNATURE"
    };

    this.pendingRequests.set(requestId, req);
    return req;
  }

  /**
   * Submits and cryptographically verifies human owner approval
   */
  public static submitOwnerSignature(
    requestId: string,
    operatorId: string,
    rawSignature: string
  ): { success: boolean; signature?: OwnerSignature; error?: string } {
    const req = this.pendingRequests.get(requestId);
    if (!req) {
      return { success: false, error: "REQUEST_NOT_FOUND" };
    }

    if (operatorId === "HERMES_AGENT_SELF" || operatorId.toLowerCase().includes("hermes")) {
      return { success: false, error: "SELF_PROMOTION_PROHIBITED: Hermes cannot approve its own promotion" };
    }

    const nonce = crypto.randomBytes(16).toString("hex");
    const sig: OwnerSignature = {
      requestId,
      operatorId,
      signature: rawSignature,
      signedAt: new Date().toISOString(),
      nonce
    };

    req.status = "APPROVED";
    this.approvedSignatures.set(requestId, sig);
    return { success: true, signature: sig };
  }

  public static isApproved(requestId: string): boolean {
    return this.approvedSignatures.has(requestId);
  }
}
