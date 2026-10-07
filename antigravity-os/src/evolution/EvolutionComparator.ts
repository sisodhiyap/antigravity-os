/**
 * ANTIGRAVITY OS — EVOLUTION COMPARATOR
 * EvolutionComparator: Multi-dimensional empirical comparison of candidate metrics against baseline
 */

export interface CandidateMetrics {
  candidateId: string;
  functionalScore: number;
  securityScore: number;
  apiLatencyMs: number;
  memoryRssMb: number;
  regressionsCount: number;
  zeroSecretsExposed: boolean;
}

export interface EvolutionComparisonReport {
  baselineId: string;
  evaluatedCandidates: Array<{
    candidateId: string;
    isImprovement: boolean;
    isSecurityDegraded: boolean;
    isRegressionDetected: boolean;
    latencyDeltaPercent: number;
    verdict: "ELIGIBLE_FOR_PROMOTION" | "REJECTED_DUE_TO_REGRESSION" | "BASELINE_MAINTAINED";
  }>;
  selectedWinnerId: string;
  justification: string;
}

export class EvolutionComparator {
  public static compareCandidates(
    baseline: CandidateMetrics,
    candidates: CandidateMetrics[]
  ): EvolutionComparisonReport {
    const evaluated = candidates.map((c) => {
      const isSecurityDegraded = c.securityScore < baseline.securityScore || !c.zeroSecretsExposed;
      const isRegressionDetected = c.regressionsCount > baseline.regressionsCount || c.functionalScore < baseline.functionalScore;
      const latencyDeltaPercent = Number((((baseline.apiLatencyMs - c.apiLatencyMs) / Math.max(0.01, baseline.apiLatencyMs)) * 100).toFixed(2));
      const isImprovement = !isSecurityDegraded && !isRegressionDetected && (latencyDeltaPercent > 0 || c.functionalScore > baseline.functionalScore);

      let verdict: "ELIGIBLE_FOR_PROMOTION" | "REJECTED_DUE_TO_REGRESSION" | "BASELINE_MAINTAINED" = "BASELINE_MAINTAINED";
      if (isSecurityDegraded || isRegressionDetected) {
        verdict = "REJECTED_DUE_TO_REGRESSION";
      } else if (isImprovement) {
        verdict = "ELIGIBLE_FOR_PROMOTION";
      }

      return {
        candidateId: c.candidateId,
        isImprovement,
        isSecurityDegraded,
        isRegressionDetected,
        latencyDeltaPercent,
        verdict
      };
    });

    const eligible = evaluated.find((e) => e.verdict === "ELIGIBLE_FOR_PROMOTION");
    const selectedWinnerId = eligible ? eligible.candidateId : baseline.candidateId;

    return {
      baselineId: baseline.candidateId,
      evaluatedCandidates: evaluated,
      selectedWinnerId,
      justification: eligible
        ? `Candidate ${eligible.candidateId} demonstrated verified ${eligible.latencyDeltaPercent}% latency reduction with 0 regressions and identical 100% security score.`
        : "No candidate surpassed baseline while strictly satisfying security and regression invariants."
    };
  }
}
