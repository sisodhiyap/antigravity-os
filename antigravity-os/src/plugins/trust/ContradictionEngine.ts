/**
 * ANTIGRAVITY OS v7.0 — FACT-BASED INTELLIGENCE + SECURITY FABRIC
 * ContradictionEngine.ts: Cross-source contradiction detection and evidence-based arbitration
 */

import crypto from "crypto";
import { ClaimRecord, SourceRecord, ContradictionSet, ContradictionResolution, EvidenceRecord } from "./TrustTypes";
import { SourceTrustEngine } from "./SourceTrustEngine";

export class ContradictionEngine {
  private static instance: ContradictionEngine;
  private readonly contradictionSets: Map<string, ContradictionSet> = new Map();

  public static getInstance(): ContradictionEngine {
    if (!ContradictionEngine.instance) {
      ContradictionEngine.instance = new ContradictionEngine();
    }
    return ContradictionEngine.instance;
  }

  /**
   * Evaluates if two claims directly contradict each other and creates an arbitrated ContradictionSet
   */
  public evaluatePair(
    claimA: ClaimRecord,
    claimB: ClaimRecord,
    sourcesA: SourceRecord[],
    sourcesB: SourceRecord[],
    evidence: EvidenceRecord[] = []
  ): ContradictionSet | null {
    const isDirectContradiction = this.checkSemanticContradiction(claimA.text, claimB.text);
    if (!isDirectContradiction) return null;

    const sourceTrust = SourceTrustEngine.getInstance();
    const aAuthority = sourcesA.reduce((sum, s) => sum + (s.trustLevel || sourceTrust.getSourceTrustWeight(s.type)), 0);
    const bAuthority = sourcesB.reduce((sum, s) => sum + (s.trustLevel || sourceTrust.getSourceTrustWeight(s.type)), 0);

    const aEvidenceWeight = claimA.evidenceLevel === "E5" ? 5 : (claimA.evidenceLevel === "E4" ? 4 : (claimA.evidenceLevel === "E3" ? 3 : 1));
    const bEvidenceWeight = claimB.evidenceLevel === "E5" ? 5 : (claimB.evidenceLevel === "E4" ? 4 : (claimB.evidenceLevel === "E3" ? 3 : 1));

    const totalAScore = aAuthority * aEvidenceWeight;
    const totalBScore = bAuthority * bEvidenceWeight;

    let resolution: ContradictionResolution = "UNRESOLVED";
    let explanation = "Evidence is conflicting with equal authority. Maintaining explicit uncertainty.";

    // Rule: Direct Execution (E5) always beats unverified assertions or model opinions
    if (claimA.evidenceLevel === "E5" && claimB.evidenceLevel !== "E5") {
      resolution = "A_SUPPORTED";
      explanation = `Claim A is verified by direct runtime execution (E5) against Claim B (${claimB.evidenceLevel})`;
    } else if (claimB.evidenceLevel === "E5" && claimA.evidenceLevel !== "E5") {
      resolution = "B_SUPPORTED";
      explanation = `Claim B is verified by direct runtime execution (E5) against Claim A (${claimA.evidenceLevel})`;
    } else if (Math.abs(totalAScore - totalBScore) > 2.0) {
      if (totalAScore > totalBScore) {
        resolution = "A_SUPPORTED";
        explanation = `Claim A has significantly higher source trust and evidence weight (${totalAScore.toFixed(2)} vs ${totalBScore.toFixed(2)})`;
      } else {
        resolution = "B_SUPPORTED";
        explanation = `Claim B has significantly higher source trust and evidence weight (${totalBScore.toFixed(2)} vs ${totalAScore.toFixed(2)})`;
      }
    } else if (claimA.freshness.isStale && !claimB.freshness.isStale) {
      resolution = "OUTDATED";
      explanation = "Claim A is outdated/stale while Claim B is fresh";
    } else if (claimB.freshness.isStale && !claimA.freshness.isStale) {
      resolution = "OUTDATED";
      explanation = "Claim B is outdated/stale while Claim A is fresh";
    }

    const contradictionId = `contra_${crypto.randomBytes(6).toString("hex")}`;
    const set: ContradictionSet = {
      id: contradictionId,
      claimA,
      claimB,
      sourcesA,
      sourcesB,
      timestamps: { a: claimA.createdAt, b: claimB.createdAt },
      authority: { aScore: totalAScore, bScore: totalBScore },
      evidence,
      resolution,
      explanation
    };

    // Mark claims with contradiction reference
    claimA.contradictions.push(contradictionId);
    claimB.contradictions.push(contradictionId);

    if (resolution === "UNRESOLVED") {
      claimA.status = "CONTRADICTED";
      claimB.status = "CONTRADICTED";
    } else if (resolution === "A_SUPPORTED") {
      claimB.status = "CONTRADICTED";
    } else if (resolution === "B_SUPPORTED") {
      claimA.status = "CONTRADICTED";
    }

    this.contradictionSets.set(contradictionId, set);
    return set;
  }

  public getAllContradictions(): ContradictionSet[] {
    return Array.from(this.contradictionSets.values());
  }

  private checkSemanticContradiction(textA: string, textB: string): boolean {
    const a = textA.toLowerCase();
    const b = textB.toLowerCase();

    // Direct negation & opposite pairs
    if (a.includes("is installed") && b.includes("is not installed")) return true;
    if (b.includes("is installed") && a.includes("is not installed")) return true;
    if (a.includes("is available") && b.includes("is not available")) return true;
    if (b.includes("is available") && a.includes("is not available")) return true;
    if (a.includes("is open") && (b.includes("is closed") || b.includes("is blocked") || b.includes("is not open"))) return true;
    if (b.includes("is open") && (a.includes("is closed") || a.includes("is blocked") || a.includes("is not open"))) return true;
    if (a.includes("builds successfully") && b.includes("build failed")) return true;
    if (b.includes("builds successfully") && a.includes("build failed")) return true;
    if (a.includes("vulnerability is fixed") && (b.includes("vulnerability exists") || b.includes("vulnerable"))) return true;
    if (b.includes("vulnerability is fixed") && (a.includes("vulnerability exists") || a.includes("vulnerable"))) return true;
    if (a.includes("operational") && (b.includes("offline") || b.includes("not operational"))) return true;
    if (b.includes("operational") && (a.includes("offline") || a.includes("not operational"))) return true;
    if (a.includes("pass") && b.includes("fail")) return true;
    if (b.includes("pass") && a.includes("fail")) return true;
    if (a.includes("true") && b.includes("false")) return true;
    if (b.includes("true") && a.includes("false")) return true;
    if (a.includes("100% pass") && b.includes("test failed")) return true;
    if (b.includes("100% pass") && a.includes("test failed")) return true;

    return false;
  }
}
