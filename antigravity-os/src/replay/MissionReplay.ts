/**
 * ANTIGRAVITY OS v5.4 — MISSION REPLAY & STRATEGY A/B TESTING
 * MissionReplay: Replays missions under alternative strategies/models and calculates comparative delta
 */

import { ExperienceRecord } from "../experience/ExperienceRecord";
import { ExperienceScorer } from "../experience/ExperienceScorer";

export interface ReplayComparisonResult {
  missionId: string;
  strategyA: string;
  strategyB: string;
  scoreA: number;
  scoreB: number;
  deltaPercent: number;
  preferredStrategy: string;
  reasoning: string;
}

export class MissionReplay {
  public static compareStrategies(
    missionId: string,
    recordA: ExperienceRecord,
    recordB: ExperienceRecord
  ): ReplayComparisonResult {
    const scoreA = ExperienceScorer.score(recordA).overallScore;
    const scoreB = ExperienceScorer.score(recordB).overallScore;

    const deltaPercent = Number((((scoreB - scoreA) / Math.max(0.01, scoreA)) * 100).toFixed(2));
    const preferred = scoreB >= scoreA ? recordB.strategyVersion : recordA.strategyVersion;

    const reasoning = scoreB >= scoreA
      ? `Strategy B (${recordB.strategyVersion}) scored ${scoreB} vs ${scoreA} (${deltaPercent > 0 ? "+" + deltaPercent + "%" : "0%"} improvement)`
      : `Strategy A (${recordA.strategyVersion}) scored higher (${scoreA} vs ${scoreB})`;

    return {
      missionId,
      strategyA: recordA.strategyVersion,
      strategyB: recordB.strategyVersion,
      scoreA,
      scoreB,
      deltaPercent,
      preferredStrategy: preferred,
      reasoning
    };
  }
}
