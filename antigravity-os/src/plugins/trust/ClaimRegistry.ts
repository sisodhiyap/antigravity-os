/**
 * ANTIGRAVITY OS v7.0 — FACT-BASED INTELLIGENCE + SECURITY FABRIC
 * ClaimRegistry.ts: Central claim lifecycle registry with SHA-256 integrity and Zero-Hallucination rules
 */

import crypto from "crypto";
import { ClaimRecord, FactStatus, EvidenceLevel, RiskCategory, FreshnessClass } from "./TrustTypes";

export class ClaimRegistry {
  private static instance: ClaimRegistry;
  private readonly claims: Map<string, ClaimRecord> = new Map();
  private readonly auditTrail: Array<{
    claimId: string;
    action: "CREATED" | "UPDATED" | "STATUS_TRANSITION" | "REJECTED_TRANSITION";
    fromStatus?: FactStatus;
    toStatus?: FactStatus;
    timestamp: number;
    reason: string;
  }> = [];

  public static getInstance(): ClaimRegistry {
    if (!ClaimRegistry.instance) {
      ClaimRegistry.instance = new ClaimRegistry();
    }
    return ClaimRegistry.instance;
  }

  public registerClaim(params: {
    claimId?: string;
    text: string;
    type?: "FACTUAL" | "CREATIVE_GENERATED" | "TECHNICAL" | "BEHAVIORAL" | "HYPOTHESIS";
    status?: FactStatus;
    evidenceLevel?: EvidenceLevel;
    confidence?: number;
    riskCategory?: RiskCategory;
    sourceIds?: string[];
    evidenceIds?: string[];
    modelIds?: string[];
    verificationMethods?: string[];
    freshnessClass?: FreshnessClass;
    owner?: string;
    projectId?: string;
  }): ClaimRecord {
    const claimId = params.claimId || `claim_${crypto.randomBytes(8).toString("hex")}`;
    const now = Date.now();
    const type = params.type || "FACTUAL";
    let status = params.status || "UNKNOWN";
    const evidenceLevel = params.evidenceLevel || "E0";
    const evidenceIds = params.evidenceIds || [];
    const sourceIds = params.sourceIds || [];

    // ZERO-HALLUCINATION ENFORCEMENT:
    // If evidence is insufficient (E0) and status was attempted as VERIFIED or SUPPORTED, force to UNKNOWN/GENERATED
    if (evidenceIds.length === 0 && evidenceLevel === "E0") {
      if (status === "VERIFIED" || status === "SUPPORTED" || status === "OBSERVED") {
        status = "UNKNOWN";
      }
    }

    // Creative content must remain marked as GENERATED/CREATIVE_GENERATED
    if (type === "CREATIVE_GENERATED" && (status === "VERIFIED" || status === "OBSERVED")) {
      status = "GENERATED";
    }

    const hash = this.computeClaimHash(claimId, params.text, status, evidenceLevel);

    const record: ClaimRecord = {
      claimId,
      text: params.text,
      type,
      status,
      evidenceLevel,
      confidence: params.confidence !== undefined ? params.confidence : (status === "VERIFIED" ? 0.95 : (status === "SUPPORTED" ? 0.8 : (status === "UNKNOWN" ? 0.0 : 0.4))),
      riskCategory: params.riskCategory || "GENERAL",
      createdAt: now,
      updatedAt: now,
      sourceIds,
      evidenceIds,
      modelIds: params.modelIds || [],
      verificationMethods: params.verificationMethods || [],
      contradictions: [],
      freshness: {
        freshnessClass: params.freshnessClass || "STABLE",
        lastVerified: now,
        expirationPolicy: "STANDARD_30_DAYS",
        isStale: false
      },
      owner: params.owner || "ANTIGRAVITY_OPERATOR",
      projectId: params.projectId || "AGY_V7_CORE",
      hash,
      provenanceTrail: [`Claim registered at ${new Date(now).toISOString()} with status ${status}`]
    };

    this.claims.set(claimId, record);
    this.auditTrail.push({
      claimId,
      action: "CREATED",
      toStatus: status,
      timestamp: now,
      reason: `Claim initial registration with status ${status}`
    });

    return record;
  }

  /**
   * Strictly governs status transitions preventing illegal zero-hallucination bypasses
   */
  public updateClaimStatus(
    claimId: string,
    newStatus: FactStatus,
    evidenceLevel: EvidenceLevel,
    evidenceIds: string[],
    reason: string
  ): { success: boolean; claim: ClaimRecord; error?: string } {
    const claim = this.claims.get(claimId);
    if (!claim) {
      throw new Error(`Claim with ID ${claimId} not found`);
    }

    const previousStatus = claim.status;

    // ILLEGAL TRANSITION GUARDS (Zero-Hallucination Policy)
    // 0. Any promotion to VERIFIED requires E4 or E5 evidence
    if (newStatus === "VERIFIED" && evidenceLevel !== "E4" && evidenceLevel !== "E5") {
      this.auditTrail.push({
        claimId,
        action: "REJECTED_TRANSITION",
        fromStatus: previousStatus,
        toStatus: newStatus,
        timestamp: Date.now(),
        reason: `REJECTED: Cannot promote to VERIFIED with evidence level ${evidenceLevel} (requires E4 or E5)`
      });
      return { success: false, claim, error: `REJECTED: Cannot promote to VERIFIED with evidence level ${evidenceLevel}` };
    }

    // 1. UNKNOWN -> VERIFIED without E4/E5 evidence
    if (previousStatus === "UNKNOWN" && newStatus === "VERIFIED" && evidenceLevel !== "E4" && evidenceLevel !== "E5") {
      this.auditTrail.push({
        claimId,
        action: "REJECTED_TRANSITION",
        fromStatus: previousStatus,
        toStatus: newStatus,
        timestamp: Date.now(),
        reason: "REJECTED: UNKNOWN cannot become VERIFIED without E4/E5 empirical evidence"
      });
      return { success: false, claim, error: "REJECTED: Insufficient evidence level for VERIFIED promotion" };
    }

    // 2. INFERRED -> VERIFIED without independent verification
    if (previousStatus === "INFERRED" && newStatus === "VERIFIED" && evidenceIds.length === 0) {
      return { success: false, claim, error: "REJECTED: INFERRED claim requires independent verification before VERIFIED" };
    }

    // 3. GENERATED -> VERIFIED without physical execution or cross-check
    if (previousStatus === "GENERATED" && (newStatus === "VERIFIED" || newStatus === "OBSERVED") && evidenceLevel !== "E5") {
      return { success: false, claim, error: "REJECTED: GENERATED content cannot become VERIFIED without E5 runtime verification" };
    }

    // 4. ASSUMED -> VERIFIED without empirical evidence
    if (previousStatus === "ASSUMED" && newStatus === "VERIFIED" && evidenceIds.length === 0) {
      return { success: false, claim, error: "REJECTED: ASSUMED cannot become VERIFIED without empirical evidence" };
    }

    // 5. User assertion cannot become VERIFIED without cross check
    if (claim.sourceIds.includes("USER_ASSERTION") && newStatus === "VERIFIED" && evidenceLevel !== "E4" && evidenceLevel !== "E5") {
      return { success: false, claim, error: "REJECTED: User assertion requires independent cross-check" };
    }

    // Apply Transition
    const now = Date.now();
    claim.status = newStatus;
    claim.evidenceLevel = evidenceLevel;
    claim.evidenceIds = Array.from(new Set([...claim.evidenceIds, ...evidenceIds]));
    claim.updatedAt = now;
    claim.provenanceTrail.push(`Status transition [${previousStatus} -> ${newStatus}] at ${new Date(now).toISOString()}: ${reason}`);
    claim.hash = this.computeClaimHash(claim.claimId, claim.text, claim.status, claim.evidenceLevel);

    this.auditTrail.push({
      claimId,
      action: "STATUS_TRANSITION",
      fromStatus: previousStatus,
      toStatus: newStatus,
      timestamp: now,
      reason
    });

    return { success: true, claim };
  }

  public getClaim(claimId: string): ClaimRecord | undefined {
    return this.claims.get(claimId);
  }

  public getAllClaims(): ClaimRecord[] {
    return Array.from(this.claims.values());
  }

  public getClaimsByStatus(status: FactStatus): ClaimRecord[] {
    return Array.from(this.claims.values()).filter((c) => c.status === status);
  }

  public getAuditTrail() {
    return this.auditTrail;
  }

  private computeClaimHash(id: string, text: string, status: string, level: string): string {
    return crypto.createHash("sha256").update(`${id}:${text}:${status}:${level}`).digest("hex");
  }
}
