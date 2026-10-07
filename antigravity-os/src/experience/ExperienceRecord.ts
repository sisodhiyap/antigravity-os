/**
 * ANTIGRAVITY OS v5.4 — EXPERIENCE-DRIVEN ENGINEERING INTELLIGENCE
 * ExperienceRecord: First-class typed data contract for verified mission experience
 */

export type KnowledgeStatus =
  | "CANDIDATE"
  | "TESTING"
  | "VERIFIED"
  | "DEPRECATED"
  | "REJECTED"
  | "SUPERSEDED";

export type MemoryScope =
  | "GLOBAL_ENGINEERING_MEMORY"
  | "PROJECT_MEMORY"
  | "MISSION_MEMORY"
  | "OWNER_MEMORY"
  | "FAILURE_MEMORY"
  | "MODEL_MEMORY"
  | "TOOL_MEMORY"
  | "SECURITY_MEMORY";

export interface ExperienceFailureItem {
  failureId: string;
  category: string;
  symptom: string;
  rootCause: string;
  detectionSignal: string;
  repairStrategyApplied: string;
  patchPattern: string;
  verifiedTests: string[];
  outcome: "PASS" | "FAIL" | "ROLLED_BACK";
}

export interface ExperienceRecord {
  missionId: string;
  projectId: string;
  domain: string;
  requirements: string[];
  architecture: {
    pattern: string;
    database: string;
    auth: string;
    ui: string;
  };
  graph: {
    nodesCount: number;
    edgesCount: number;
    resolvedNodes: number;
  };
  modelsUsed: Array<{
    modelId: string;
    provider: string;
    taskType: string;
    tokensGenerated: number;
    latencyMs: number;
    tokPerSec: number;
  }>;
  agentsUsed: string[];
  toolsUsed: string[];
  executionTimeMs: number;
  tokenUsage: number;
  failures: ExperienceFailureItem[];
  repairsCount: number;
  retriesCount: number;
  rollbackCount: number;
  testResults: {
    totalAssertions: number;
    passedAssertions: number;
    failedAssertions: number;
    testScore: number;
  };
  securityResults: {
    totalAttacksTested: number;
    blockedAttacks: number;
    securityScore: number;
  };
  performanceResults: {
    coldStartupMs: number;
    avgApiLatencyMs: number;
    memoryRssMb: number;
  };
  userFeedback?: {
    sentiment: "GOOD" | "BAD" | "FIXED" | "NOT_WHAT_I_WANTED" | "ACCEPT" | "REJECT";
    notes?: string;
    timestamp: string;
  };
  finalOutcome: "SUCCESS" | "PARTIAL" | "FAILED" | "ROLLED_BACK";
  confidence: number;
  strategyVersion: string;
  timestamp: string;
  scope: MemoryScope;
  status: KnowledgeStatus;
}
