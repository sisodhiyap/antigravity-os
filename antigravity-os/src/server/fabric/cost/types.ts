/**
 * ANTIGRAVITY OS — SOVEREIGN SELF-SUSTAINING AI FABRIC
 * cost/types.ts: Authoritative data contracts for Token & Cost Governance,
 * Task Routing Policy, Versioned Pricing Tables, and Token-Saving Caching.
 */

export type TaskRoutingPolicyMode =
  | "STRICT_LOCAL"
  | "LOCAL_FIRST"
  | "HYBRID"
  | "CLOUD_ONLY";

export interface UsageRecord {
  id: string;
  timestamp: string;
  taskId: string;
  workspaceId: string;
  provider: string;
  model: string;
  isLocal: boolean;
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  billedCostUsd?: number;
  cloudReason?: string;
  cacheHit: boolean;
}

export interface ModelPricingTier {
  provider: string;
  modelPattern: string;
  inputCostPer1M: number;
  cachedInputCostPer1M: number;
  outputCostPer1M: number;
  effectiveDate: string;
  currency: "USD";
}

export interface BudgetConfig {
  dailyLimitUsd: number;
  monthlyLimitUsd: number;
  perProviderLimits: Record<string, number>;
  perTaskMaxCostUsd: number;
  warningThresholdPercent: number; // e.g. 80
  hardStopThresholdPercent: number; // e.g. 100
  temporaryOverrideActive: boolean;
  temporaryOverrideApprovedBy?: string;
}

export interface CostOptimizationMetrics {
  totalRequestsHandled: number;
  localRequestsCount: number;
  cloudRequestsCount: number;
  localRatioPercent: number;
  totalTokensProcessed: number;
  cachedTokensAvoided: number;
  cacheHitsCount: number;
  cacheHitRatePercent: number;
  actualCloudSpendUsd: number;
  estimatedBaselineSpendUsd: number; // Cloud-only baseline (e.g. GPT-4o for all tasks)
  totalCostSavingsUsd: number;
  budgetRemainingUsd: number;
  isHardStopTriggered: boolean;
}

export interface CacheEntryMetadata {
  key: string;
  hash: string;
  workspaceId: string;
  taskType: string;
  model: string;
  tokensSaved: number;
  createdAt: string;
  expiresAt: string;
  accessCount: number;
}
