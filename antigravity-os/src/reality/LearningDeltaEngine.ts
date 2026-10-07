/**
 * ANTIGRAVITY OS v5.5 — LEARNING DELTA ENGINE
 * LearningDeltaEngine: Quantifies measurable improvement between initial and subsequent experience-learned missions
 */

export interface RunMetrics {
  runId: string;
  executionDurationMs: number;
  repairsCount: number;
  retriesCount: number;
  humanInterventionsCount: number;
  testScore: number;
  securityScore: number;
  realityScore: number;
}

export interface LearningDeltaReport {
  run1: RunMetrics;
  run2: RunMetrics;
  timeReductionPercent: number;
  repairReductionCount: number;
  interventionReductionCount: number;
  realityScoreGain: number;
  learningDeltaPercent: number;
  learningVerified: boolean;
  verdict: "MEASURABLE_LEARNING_VERIFIED" | "NO_SIGNIFICANT_IMPROVEMENT" | "REGRESSION_DETECTED";
}

export class LearningDeltaEngine {
  public static computeLearningDelta(run1: RunMetrics, run2: RunMetrics): LearningDeltaReport {
    const timeReductionPercent = Number((((run1.executionDurationMs - run2.executionDurationMs) / Math.max(1, run1.executionDurationMs)) * 100).toFixed(2));
    const repairReductionCount = run1.repairsCount - run2.repairsCount;
    const interventionReductionCount = run1.humanInterventionsCount - run2.humanInterventionsCount;
    const realityScoreGain = Number((run2.realityScore - run1.realityScore).toFixed(2));

    const learningDeltaPercent = Number((((run2.realityScore - run1.realityScore) / Math.max(1, run1.realityScore)) * 100).toFixed(2));
    const learningVerified = run2.realityScore > run1.realityScore && run2.securityScore >= run1.securityScore;

    let verdict: LearningDeltaReport["verdict"] = "NO_SIGNIFICANT_IMPROVEMENT";
    if (learningVerified && (timeReductionPercent > 0 || repairReductionCount > 0)) {
      verdict = "MEASURABLE_LEARNING_VERIFIED";
    } else if (run2.realityScore < run1.realityScore) {
      verdict = "REGRESSION_DETECTED";
    }

    return {
      run1,
      run2,
      timeReductionPercent,
      repairReductionCount,
      interventionReductionCount,
      realityScoreGain,
      learningDeltaPercent,
      learningVerified,
      verdict
    };
  }
}
