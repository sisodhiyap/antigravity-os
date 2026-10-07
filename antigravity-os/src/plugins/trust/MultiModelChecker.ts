/**
 * ANTIGRAVITY OS v7.0 — FACT-BASED INTELLIGENCE + SECURITY FABRIC
 * MultiModelChecker.ts: Multi-model hypothesis, critique & empirical grounding pipeline
 */

import { ClaimRecord, EvidenceRecord, FactStatus, EvidenceLevel } from "./TrustTypes";

export interface ModelHypothesis {
  modelId: string;
  statement: string;
  confidence: number;
  reasoning: string;
}

export interface ModelCritique {
  criticModelId: string;
  targetStatement: string;
  identifiedFlaws: string[];
  counterClaims: string[];
  severity: "MINOR" | "SUBSTANTIAL" | "FATAL";
}

export interface FactCheckVerdict {
  statement: string;
  status: FactStatus;
  evidenceLevel: EvidenceLevel;
  hypotheses: ModelHypothesis[];
  critiques: ModelCritique[];
  groundingEvidence: EvidenceRecord[];
  verdictReason: string;
}

export class MultiModelChecker {
  private static instance: MultiModelChecker;

  public static getInstance(): MultiModelChecker {
    if (!MultiModelChecker.instance) {
      MultiModelChecker.instance = new MultiModelChecker();
    }
    return MultiModelChecker.instance;
  }

  /**
   * Evaluates multi-model statements strictly grounded in empirical evidence.
   * Consensus among models ALONE does not constitute truth.
   */
  public evaluateStatement(
    statement: string,
    hypotheses: ModelHypothesis[],
    critiques: ModelCritique[],
    empiricalEvidence: EvidenceRecord[]
  ): FactCheckVerdict {
    // 1. Check if direct empirical / runtime evidence exists (E5 or E4)
    const runtimeEvidence = empiricalEvidence.filter((e) => e.level === "E5" || e.type === "EXECUTION");
    const fileCrossCheck = empiricalEvidence.filter((e) => e.level === "E4" || e.type === "FILE_HASH");

    if (runtimeEvidence.length > 0) {
      return {
        statement,
        status: "VERIFIED",
        evidenceLevel: "E5",
        hypotheses,
        critiques,
        groundingEvidence: runtimeEvidence,
        verdictReason: "Grounded by direct runtime execution evidence (E5)"
      };
    }

    if (fileCrossCheck.length > 0) {
      return {
        statement,
        status: "SUPPORTED",
        evidenceLevel: "E4",
        hypotheses,
        critiques,
        groundingEvidence: fileCrossCheck,
        verdictReason: "Supported by cryptographic file and cross-check evidence (E4)"
      };
    }

    // 2. Fatal critique detection
    const fatalCritique = critiques.find((c) => c.severity === "FATAL");
    if (fatalCritique) {
      return {
        statement,
        status: "CONTRADICTED",
        evidenceLevel: "E1",
        hypotheses,
        critiques,
        groundingEvidence: [],
        verdictReason: `Contradicted by multi-model critique: ${fatalCritique.identifiedFlaws.join(", ")}`
      };
    }

    // 3. If models agree but NO independent evidence exists -> Remains HYPOTHESIS / UNKNOWN
    return {
      statement,
      status: "UNKNOWN",
      evidenceLevel: "E1",
      hypotheses,
      critiques,
      groundingEvidence: [],
      verdictReason: "Model consensus without independent evidence cannot be promoted beyond UNKNOWN/HYPOTHESIS"
    };
  }
}
