/**
 * ANTIGRAVITY OS v5.4 — EXPERIENCE SCORER
 * ExperienceScorer: Multidimensional evidence-based evaluation of mission experience
 */

import { ExperienceRecord } from "./ExperienceRecord";

export interface ExperienceScoreBreakdown {
  functionalScore: number;
  securityScore: number;
  performanceScore: number;
  repairEfficiencyScore: number;
  overallScore: number;
  confidenceDelta: number;
  recommendation: "PROMOTE_TO_VERIFIED" | "KEEP_CANDIDATE" | "REVISE_STRATEGY" | "REJECT";
}

export class ExperienceScorer {
  public static score(record: ExperienceRecord): ExperienceScoreBreakdown {
    // 1. Functional score (0 to 1)
    const totalTests = record.testResults.totalAssertions || 1;
    const functionalScore = Math.min(1, record.testResults.passedAssertions / totalTests);

    // 2. Security score (0 to 1)
    const totalSec = record.securityResults.totalAttacksTested || 1;
    const securityScore = Math.min(1, record.securityResults.blockedAttacks / totalSec);

    // 3. Performance score (0 to 1) - benchmarked against < 50ms latency
    const latency = Math.max(1, record.performanceResults.avgApiLatencyMs);
    const performanceScore = latency <= 5 ? 1.0 : latency <= 50 ? 0.9 : Math.max(0.5, 1 - (latency / 200));

    // 4. Repair efficiency (0 to 1) - fewer retries & rollbacks is higher
    const penalties = (record.retriesCount * 0.05) + (record.rollbackCount * 0.15);
    const repairEfficiencyScore = Math.max(0, 1.0 - penalties);

    // Overall weighted composite score
    const overallScore = Number((
      (functionalScore * 0.35) +
      (securityScore * 0.35) +
      (performanceScore * 0.15) +
      (repairEfficiencyScore * 0.15)
    ).toFixed(3));

    // Confidence delta computation
    const isSuccess = record.finalOutcome === "SUCCESS" && securityScore >= 0.95 && functionalScore >= 0.95;
    const confidenceDelta = isSuccess ? Number((0.02 + (overallScore * 0.03)).toFixed(4)) : -0.05;

    let recommendation: ExperienceScoreBreakdown["recommendation"] = "KEEP_CANDIDATE";
    if (isSuccess && overallScore >= 0.95) {
      recommendation = "PROMOTE_TO_VERIFIED";
    } else if (!isSuccess || securityScore < 0.9) {
      recommendation = "REVISE_STRATEGY";
    }

    return {
      functionalScore: Number(functionalScore.toFixed(3)),
      securityScore: Number(securityScore.toFixed(3)),
      performanceScore: Number(performanceScore.toFixed(3)),
      repairEfficiencyScore: Number(repairEfficiencyScore.toFixed(3)),
      overallScore,
      confidenceDelta,
      recommendation
    };
  }
}
