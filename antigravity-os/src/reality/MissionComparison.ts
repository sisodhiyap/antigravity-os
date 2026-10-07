/**
 * ANTIGRAVITY OS v5.5 — MISSION COMPARISON
 * MissionComparison: Comparative analytics across multi-mission reality suites
 */

import { RealityMissionResult } from "./RealityMission";

export interface ComparativeMissionMatrix {
  missionsCount: number;
  avgRealityScore: number;
  avgGeneralizationScore: number;
  avgLearningDelta: number;
  totalAttacksBlocked: number;
  totalDefectsRepaired: number;
  certificationPassRate: string;
  missions: RealityMissionResult[];
}

export class MissionComparison {
  public static compareMissions(missions: RealityMissionResult[]): ComparativeMissionMatrix {
    const total = missions.length || 1;
    const avgRealityScore = Number((missions.reduce((acc, m) => acc + m.realityScore, 0) / total).toFixed(2));
    const avgGeneralizationScore = Number((missions.reduce((acc, m) => acc + m.generalizationScore, 0) / total).toFixed(2));
    const avgLearningDelta = Number((missions.reduce((acc, m) => acc + m.learningDelta, 0) / total).toFixed(2));
    const totalAttacksBlocked = missions.reduce((acc, m) => acc + m.securityAttacksBlocked, 0);
    const totalDefectsRepaired = missions.reduce((acc, m) => acc + m.repairedDefects, 0);
    const certifiedCount = missions.filter((m) => m.isCertified).length;

    return {
      missionsCount: missions.length,
      avgRealityScore,
      avgGeneralizationScore,
      avgLearningDelta,
      totalAttacksBlocked,
      totalDefectsRepaired,
      certificationPassRate: `${((certifiedCount / total) * 100).toFixed(1)}%`,
      missions
    };
  }
}
