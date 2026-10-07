/**
 * ANTIGRAVITY OS v5.4 — STRATEGY UPDATER
 * StrategyUpdater: Updates strategy recommendations and scorecard weights based on verified evidence
 */

import { ExperienceRecord } from "./ExperienceRecord";
import { ExperienceScorer } from "./ExperienceScorer";

export interface StrategyUpdateResult {
  strategyVersion: string;
  promotedPatterns: string[];
  deprecatedPatterns: string[];
  modelWeightsAdjusted: Record<string, number>;
  confidenceDeltaTotal: number;
}

export class StrategyUpdater {
  private static strategyVersionCounter = 1;

  public static applyExperienceToStrategy(record: ExperienceRecord): StrategyUpdateResult {
    const scores = ExperienceScorer.score(record);
    const promotedPatterns: string[] = [];
    const deprecatedPatterns: string[] = [];
    const modelWeights: Record<string, number> = {};

    if (scores.recommendation === "PROMOTE_TO_VERIFIED") {
      promotedPatterns.push(
        `${record.architecture.pattern} with ${record.architecture.auth} on ${record.domain}`
      );
      for (const m of record.modelsUsed) {
        modelWeights[m.modelId] = 1.05; // 5% boost for verified pass
      }
    } else if (scores.recommendation === "REVISE_STRATEGY") {
      deprecatedPatterns.push(
        `Direct unvalidated mutations on ${record.domain}`
      );
      for (const m of record.modelsUsed) {
        modelWeights[m.modelId] = 0.95; // 5% penalty for unhandled failure
      }
    }

    this.strategyVersionCounter++;
    return {
      strategyVersion: `v5.4-strat-${this.strategyVersionCounter}`,
      promotedPatterns,
      deprecatedPatterns,
      modelWeightsAdjusted: modelWeights,
      confidenceDeltaTotal: scores.confidenceDelta
    };
  }
}
