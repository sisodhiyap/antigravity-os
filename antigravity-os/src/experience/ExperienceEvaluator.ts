/**
 * ANTIGRAVITY OS v5.4 — EXPERIENCE EVALUATOR & KNOWLEDGE POISONING DEFENSE
 * ExperienceEvaluator: Evaluates candidate knowledge, verifies claims, and blocks poisoning attempts
 */

import { ExperienceRecord } from "./ExperienceRecord";

export interface EvaluationVerdict {
  approved: boolean;
  reason: string;
  isPoisoningAttempt: boolean;
  confidenceScore: number;
}

export class ExperienceEvaluator {
  private static readonly PROHIBITED_PATTERNS = [
    /disable\s+auth/i,
    /bypass\s+security/i,
    /drop\s+table\s+without\s+backup/i,
    /hardcode\s+credentials/i,
    /publicly\s+expose\s+secrets/i,
    /ignore\s+rbac/i
  ];

  /**
   * Evaluates candidate engineering knowledge against immutable security invariants
   */
  public static evaluateCandidateKnowledge(claim: string, record?: Partial<ExperienceRecord>): EvaluationVerdict {
    // 1. Knowledge Poisoning Check
    for (const pattern of this.PROHIBITED_PATTERNS) {
      if (pattern.test(claim)) {
        return {
          approved: false,
          reason: `Knowledge poisoning rejected: matches prohibited security degradation pattern (${pattern})`,
          isPoisoningAttempt: true,
          confidenceScore: 0.0
        };
      }
    }

    // 2. Minimum Evidence Assertion Check
    if (record && record.testResults && record.testResults.testScore < 0.9) {
      return {
        approved: false,
        reason: `Insufficient test confidence: test score ${record.testResults.testScore} < 0.90`,
        isPoisoningAttempt: false,
        confidenceScore: 0.5
      };
    }

    return {
      approved: true,
      reason: "Knowledge assertion verified against security invariants and test evidence",
      isPoisoningAttempt: false,
      confidenceScore: 0.95
    };
  }

  /**
   * Cross-Project Boundary Isolation Guard
   */
  public static verifyCrossProjectIsolation(sourceProjectId: string, targetProjectId: string, dataKey: string): boolean {
    if (sourceProjectId !== targetProjectId && dataKey.startsWith("project_private_")) {
      return false; // Blocked: Project private data cannot cross project boundary
    }
    return true;
  }
}
