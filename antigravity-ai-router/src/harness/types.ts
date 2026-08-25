/**
 * Antigravity Production-Grade Adaptive Harness - Phase 4 Core Types & Contracts
 * Final Production Enforcement, Hardening & Certification
 */

export type ExecutionMode = 'solo' | 'pipeline' | 'parallel' | 'supervisor';

export type HarnessSafetyMode = 
  | 'shadow'
  | 'advisory'
  | 'enforced_10'
  | 'enforced_25'
  | 'enforced_50'
  | 'enforced_100'
  | 'production_locked';

export type ProviderState = 
  | 'AVAILABLE'
  | 'DEGRADED'
  | 'RATE_LIMITED'
  | 'QUOTA_EXHAUSTED'
  | 'AUTH_FAILURE'
  | 'BILLING_FAILURE'
  | 'NETWORK_FAILURE'
  | 'UNKNOWN'
  | 'DISABLED';

export type TaskRisk = 'low' | 'medium' | 'high' | 'critical';
export type UncertaintyLevel = 'low' | 'medium' | 'high';
export type ModelTier = 'cheap' | 'standard' | 'premium';
export type BudgetState = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
export type CostSource = 'actual' | 'estimated' | 'unknown';
export type QualityConfidence = 'LOW' | 'MEDIUM' | 'HIGH';
export type MetricClassification = 'REAL-WORLD' | 'SYNTHETIC' | 'ESTIMATED' | 'VERIFIED' | 'UNKNOWN';

export type AgentRole = 
  | 'orchestrator'
  | 'researcher'
  | 'builder'
  | 'reviewer'
  | 'security'
  | 'tester'
  | 'architect';

export type WorkloadCategory =
  | 'coding'
  | 'debugging'
  | 'refactoring'
  | 'research'
  | 'architecture'
  | 'testing'
  | 'multi_file'
  | 'api_integration'
  | 'documentation';

export interface TaskProfile {
  taskId: string;
  complexity: number; // 0-10
  risk: TaskRisk;
  uncertainty: UncertaintyLevel;
  category: WorkloadCategory;
  parallelizable: boolean;
  expectedToolCalls: number;
  estimatedContextTokens: number;
  requiresDeepReasoning: boolean;
  requiresReview: boolean;
  recommendedMode: ExecutionMode;
  reasons: string[];
}

export interface TaskBudget {
  maxAgents: number;
  maxIterations: number;
  maxRetries: number;
  maxReviewRounds: number;
  maxToolCalls: number;
  maxContextTokens: number;
  maxEstimatedCostUsd: number;
}

export interface BudgetInvariantAudit {
  valid: boolean;
  totalBudget: number;
  reservedBudget: number;
  committedSpend: number;
  availableBudget: number;
  delta: number;
}

export interface AgentPermissions {
  role: AgentRole;
  allowedTools: string[];
  allowWriteAccess: boolean;
  allowSpawnSubagent: boolean;
  maxToolCalls: number;
  parentRole?: AgentRole;
}

export interface SpawnDecision {
  spawned: boolean;
  role: AgentRole;
  reason: {
    risk: TaskRisk;
    expectedFailureCost: number;
    expectedDetectionValue: number;
    estimatedCost: number;
    roi: number;
    explanation: string;
  };
  parentTask: string;
  budgetBefore: BudgetState;
  budgetAfter: BudgetState;
  timestamp: number;
}

export interface StructuredHandoff {
  objective: string;
  status: 'in_progress' | 'completed' | 'blocked' | 'failed';
  findings: string[];
  evidence: string[];
  decisions: string[];
  assumptions: string[];
  filesChanged: string[];
  testsRun: string[];
  unresolved: string[];
  confidence: number;
  nextAction?: string;
  timestamp: number;
  producedByRole: AgentRole;
}

export interface AgentContext {
  task: string;
  objective: string;
  constraints: string[];
  relevantFiles: string[];
  relevantMemory: string[];
  relevantSkills: string[];
  requiredTools: string[];
  priorDecisions: string[];
  structuredHandoffs: StructuredHandoff[];
  tokenEstimate: number;
}

export interface FailureClassification {
  type: 'TRANSIENT' | 'CONTEXT' | 'TOOL' | 'STRATEGY' | 'MODEL' | 'PERMISSION' | 'BUG' | 'REPEATED';
  reason: string;
  action: 'retry_once' | 'rebuild_context' | 'fallback_or_retry_once' | 'change_strategy' | 'escalate_if_justified' | 'use_correct_permission' | 'report_or_alternative' | 'stop';
  retryAllowed: boolean;
}

export interface ReviewDecision {
  requiresReview: boolean;
  reviewType: 'none' | 'targeted' | 'full' | 'final_judge';
  targetAspects: string[];
  maxRounds: number;
  roiJustified: boolean;
}

export interface ShadowPrediction {
  taskId: string;
  mode: ExecutionMode;
  predictedAgents: number;
  predictedModelTier: ModelTier;
  predictedModel: string;
  predictedToolCalls: number;
  predictedRetries: number;
  predictedReviews: number;
  predictedTokens: number;
  predictedCostUsd: number;
  reasoning: string;
  timestamp: number;
}

export interface BaselineTelemetry {
  taskId: string;
  mode: ExecutionMode;
  agentsUsed: number;
  modelUsed: string;
  toolCalls: number;
  retries: number;
  reviews: number;
  tokensUsed: number;
  costUsd: number;
  latencyMs: number;
  success: boolean;
}

export interface PredictionAccuracyMetrics {
  modeAccuracyRate: number;
  agentCountMeanError: number;
  toolCallMeanError: number;
  tokenMeanError: number;
  costMeanErrorUsd: number;
  latencyMeanErrorMs: number;
  successAccuracyRate: number;
  sampleSize: number;
}

export interface KillSwitches {
  harness: boolean;
  parallelism: boolean;
  supervisor: boolean;
  premiumEscalation: boolean;
  automaticRetry: boolean;
  toolCaching: boolean;
  contextCompression: boolean;
  adaptiveRouting: boolean;
}

export interface CanaryCohort {
  cohortId: string;
  percentage: number; // 0, 10, 25, 50, 100
  active: boolean;
  baselineCount: number;
  harnessCount: number;
  baselineQuality: number;
  harnessQuality: number;
  baselineCost: number;
  harnessCost: number;
  errorCount: number;
}

export interface ProviderStatusInfo {
  provider: string;
  state: ProviderState;
  lastStateChange: number;
  consecutiveFailures: number;
  cooldownUntil: number;
  totalRequests: number;
  successfulRequests: number;
  reliabilityScore: number;
}

export interface SecurityAuditResult {
  passed: boolean;
  criticalViolations: number;
  highViolations: number;
  secretLeakage: boolean;
  promptInjectionBlocked: boolean;
  privilegeEscalationBlocked: boolean;
  budgetBypassBlocked: boolean;
}

export interface HarnessExecutionTelemetry {
  executionId: string;
  taskId: string;
  safetyMode: HarnessSafetyMode;
  cohortId?: string;
  mode: ExecutionMode;
  category: WorkloadCategory;
  complexity: number;
  risk: TaskRisk;
  uncertainty: UncertaintyLevel;
  agentsSpawned: number;
  agentRolesUsed: AgentRole[];
  modelTiersUsed: ModelTier[];
  modelsInvoked: string[];
  toolCalls: number;
  toolCallsDeduplicated: number;
  retries: number;
  reviewRounds: number;
  contextTokensProcessed: number;
  completionTokensGenerated: number;
  totalTokens: number;
  estimatedCostUsd: number;
  actualCostUsd?: number;
  unknownCostUsd: number;
  costSource: CostSource;
  durationMs: number;
  finalBudgetState: BudgetState;
  finalStatus: 'SUCCESS' | 'BUDGET_EXHAUSTED' | 'FAILED' | 'FALLBACK_COMPLETED';
  escalationReasons: string[];
  spawnDecisions: SpawnDecision[];
  handoffsCount: number;
  stopReason: string;
  shadowPrediction?: ShadowPrediction;
  baselineTelemetry?: BaselineTelemetry;
  qualityScore: number;
  qualityConfidence: QualityConfidence;
  policyVersion: string;
  recommendationFollowed?: boolean;
  rollbackState?: string;
}

export interface HarnessConfig {
  enabled: boolean;
  safetyMode: HarnessSafetyMode;
  canaryPercentage: number; // 0, 10, 25, 50, 100
  locked: boolean;
  soloFirst: boolean;
  policyVersion: string;
  maxAgents: number;
  maxSpawnDepth: number;
  maxRetries: number;
  maxReviewRounds: number;
  killSwitches: KillSwitches;
  roi: {
    minimumSpawnRoi: number;
    minimumReviewRoi: number;
  };
  budgets: {
    simple: TaskBudget;
    medium: TaskBudget;
    complex: TaskBudget;
    critical: TaskBudget;
  };
  escalation: {
    premiumEnabled: boolean;
    requireHighValue: boolean;
    premiumComplexityThreshold: number;
    maxFailuresBeforeEscalate: number;
  };
  context: {
    progressiveDisclosure: boolean;
    structuredHandoffs: boolean;
    maxContextTokens: number;
    enableContextCompression: boolean;
  };
  review: {
    low: boolean;
    medium: 'none' | 'targeted';
    high: boolean;
    critical: boolean;
    maxReviewRounds: number;
  };
  toolCaching: {
    enabled: boolean;
    ttlMs: number;
  };
}
