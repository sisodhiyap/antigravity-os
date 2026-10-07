/**
 * ANTIGRAVITY OS v7.0 — HERMES AGENT SUBSYSTEM
 * HermesTypes.ts: Comprehensive type definitions for Hermes autonomous execution
 */

export type HermesAutonomyLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type HermesTaskStatus =
  | "PENDING"
  | "PLANNED"
  | "RUNNING"
  | "BLOCKED"
  | "FAILED"
  | "REPAIRING"
  | "VERIFYING"
  | "PASSED"
  | "REJECTED"
  | "ROLLED_BACK"
  | "PROMOTED";

export type HermesModelCapability =
  | "VISION"
  | "DOCUMENT"
  | "CODE"
  | "REASONING"
  | "PLANNING"
  | "OCR"
  | "PARSER"
  | "SECURITY"
  | "TESTING"
  | "UI_UX"
  | "ARCHITECTURE"
  | "LOCAL_INFERENCE";

export type HermesToolCategory =
  | "FILESYSTEM"
  | "GIT"
  | "TERMINAL"
  | "BROWSER"
  | "HTTP"
  | "DATABASE"
  | "DOCKER"
  | "PARSER"
  | "FIGMA"
  | "DOCUMENT"
  | "IMAGE"
  | "VISION"
  | "CODE"
  | "TEST"
  | "SECURITY"
  | "MCP"
  | "EXPORT"
  | "EVIDENCE";

export type HermesRiskLevel = "READ_ONLY" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface HermesTaskNode {
  id: string;
  parentId?: string;
  dependencies: string[];
  objective: string;
  inputs: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  model: string;
  tools: string[];
  permissions: HermesAutonomyLevel;
  sandbox: string;
  status: HermesTaskStatus;
  confidence: number;
  evidenceIds: string[];
  retries: number;
  failureReason?: string;
  rollbackCheckpoint?: string;
  provenance: "OBSERVED" | "INFERRED" | "GENERATED" | "VERIFIED" | "UNKNOWN" | "CONTRADICTED";
  createdAt: string;
  updatedAt: string;
}

export interface HermesToolDefinition {
  toolId: string;
  name: string;
  category: HermesToolCategory;
  capabilities: string[];
  riskLevel: HermesRiskLevel;
  requiredAutonomyLevel: HermesAutonomyLevel;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  sandboxRequired: boolean;
  networkRequired: boolean;
  approvalRequired: boolean;
  handler: (params: Record<string, unknown>, context: HermesExecutionContext) => Promise<HermesToolResult>;
}

export interface HermesToolResult {
  success: boolean;
  output: unknown;
  error?: string;
  evidenceId?: string;
  durationMs: number;
  bytesModified?: number;
}

export interface HermesExecutionContext {
  sessionId: string;
  taskId: string;
  sandboxDir: string;
  autonomyLevel: HermesAutonomyLevel;
  isEmergencyStopped: boolean;
  tokenBudgetRemaining: number;
  auditTrail: HermesTimelineEvent[];
}

export interface HermesTimelineEvent {
  id: string;
  timestamp: string;
  phase: string;
  taskId?: string;
  message: string;
  status: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  metadata?: Record<string, unknown>;
}

export interface HermesExperience {
  experienceId: string;
  source: string;
  timestamp: string;
  taskType: string;
  observation: string;
  action: string;
  result: string;
  evidenceId: string;
  confidence: number;
  verificationStatus: "VERIFIED" | "UNVERIFIED" | "REJECTED";
  reusePolicy: "SAFE_REUSE" | "MANUAL_APPROVAL_REQUIRED";
}

export interface HermesCriticEvaluation {
  taskExecuted: boolean;
  outputObservable: boolean;
  outputCorrect: boolean;
  resultReproducible: boolean;
  noRegressions: boolean;
  securityPreserved: boolean;
  visualFidelityPreserved: boolean;
  accessibilityPreserved: boolean;
  performancePreserved: boolean;
  rawEvidencePresent: boolean;
  independentlyVerifiable: boolean;
  allPassed: boolean;
  verdict: "APPROVED" | "REPAIR_REQUIRED" | "ROLLBACK_REQUIRED";
  failureDetails?: string[];
}

export interface HermesModelRoutingDecision {
  capability: HermesModelCapability;
  selectedModel: string;
  provider: "Ollama" | "OpenRouter" | "Gemini" | "Anthropic" | "FallbackLocal";
  reason: string;
  fallbackChain: string[];
  latencyMs: number;
  costEstimateUsd: number;
  confidence: number;
}

export interface HermesConsensusReport {
  task: string;
  modelsConsulted: string[];
  outputs: Array<{ model: string; response: string }>;
  agreementRate: number;
  consensusEstablished: boolean;
  finalOutput?: string;
  unresolvedDisagreements?: string[];
}
