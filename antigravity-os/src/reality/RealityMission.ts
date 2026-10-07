/**
 * ANTIGRAVITY OS v5.5 — REALITY MISSION CONTRACT
 * RealityMission: First-class data structure for isolated, independently verified engineering missions
 */

export type RealityMissionStatus =
  | "PENDING"
  | "INITIALIZED"
  | "PLANNING"
  | "EXECUTING"
  | "INDEPENDENT_VERIFICATION"
  | "SECURITY_RED_TEAM"
  | "FAILURE_INJECTION"
  | "SELF_REPAIR"
  | "EVALUATED"
  | "CERTIFIED"
  | "FAILED"
  | "ROLLED_BACK";

export interface RealityMissionConfig {
  missionId: string;
  benchmarkId: string;
  domain: string;
  isBlindMode: boolean;
  naturalLanguagePrompt: string;
  functionalRequirements: string[];
  nonFunctionalConstraints: string[];
  acceptanceCriteria: string[];
  workspaceDir: string;
  isolatedDbPath: string;
  isolatedPort: number;
}

export interface RealityMissionResult {
  missionId: string;
  benchmarkId: string;
  status: RealityMissionStatus;
  executionDurationMs: number;
  tokensUsed: number;
  totalAssertionsTested: number;
  passedAssertions: number;
  securityAttacksTested: number;
  securityAttacksBlocked: number;
  injectedDefects: number;
  repairedDefects: number;
  humanInterventionsCount: number;
  realityScore: number;
  generalizationScore: number;
  learningDelta: number;
  certificationLevel: number;
  isCertified: boolean;
  timestamp: string;
}
