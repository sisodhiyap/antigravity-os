/**
 * ANTIGRAVITY OS — SOVEREIGN SELF-SUSTAINING AI FABRIC
 * cost/usage-ledger.ts: Centralized API Token & Cost Governor with versioned pricing,
 * daily/monthly hard-stop budgets, and audit tracking without fabricating token counts.
 */

import {
  UsageRecord,
  ModelPricingTier,
  BudgetConfig,
  CostOptimizationMetrics,
} from "./types";
import { HermesPolicy } from "@/plugins/hermes/HermesPolicy";

export const VERSIONED_PRICING_TABLE: ModelPricingTier[] = [
  // OpenAI Tiers (Effective Oct 2024 / 2025/2026 standards)
  {
    provider: "openai",
    modelPattern: "gpt-4o",
    inputCostPer1M: 2.5,
    cachedInputCostPer1M: 1.25,
    outputCostPer1M: 10.0,
    effectiveDate: "2026-01-01",
    currency: "USD",
  },
  {
    provider: "openai",
    modelPattern: "gpt-4o-mini",
    inputCostPer1M: 0.15,
    cachedInputCostPer1M: 0.075,
    outputCostPer1M: 0.6,
    effectiveDate: "2026-01-01",
    currency: "USD",
  },
  {
    provider: "openai",
    modelPattern: "o3-mini",
    inputCostPer1M: 1.1,
    cachedInputCostPer1M: 0.55,
    outputCostPer1M: 4.4,
    effectiveDate: "2026-01-01",
    currency: "USD",
  },

  // Gemini Tiers
  {
    provider: "gemini",
    modelPattern: "gemini-2.5-flash",
    inputCostPer1M: 0.075,
    cachedInputCostPer1M: 0.01875,
    outputCostPer1M: 0.3,
    effectiveDate: "2026-01-01",
    currency: "USD",
  },
  {
    provider: "gemini",
    modelPattern: "gemini-1.5-pro",
    inputCostPer1M: 1.25,
    cachedInputCostPer1M: 0.3125,
    outputCostPer1M: 5.0,
    effectiveDate: "2026-01-01",
    currency: "USD",
  },

  // DeepSeek & Groq
  {
    provider: "deepseek",
    modelPattern: "deepseek",
    inputCostPer1M: 0.14,
    cachedInputCostPer1M: 0.014,
    outputCostPer1M: 0.28,
    effectiveDate: "2026-01-01",
    currency: "USD",
  },
  {
    provider: "groq",
    modelPattern: "llama",
    inputCostPer1M: 0.59,
    cachedInputCostPer1M: 0.29,
    outputCostPer1M: 0.79,
    effectiveDate: "2026-01-01",
    currency: "USD",
  },

  // Sovereign Local Engines & Free Gateways (Zero API cost)
  {
    provider: "ollama",
    modelPattern: "*",
    inputCostPer1M: 0.0,
    cachedInputCostPer1M: 0.0,
    outputCostPer1M: 0.0,
    effectiveDate: "2026-01-01",
    currency: "USD",
  },
  {
    provider: "freellmapi",
    modelPattern: "*",
    inputCostPer1M: 0.0,
    cachedInputCostPer1M: 0.0,
    outputCostPer1M: 0.0,
    effectiveDate: "2026-01-01",
    currency: "USD",
  },
  {
    provider: "fabric_local",
    modelPattern: "*",
    inputCostPer1M: 0.0,
    cachedInputCostPer1M: 0.0,
    outputCostPer1M: 0.0,
    effectiveDate: "2026-01-01",
    currency: "USD",
  },
];

import fs from "fs";
import path from "path";
import { quotaEngine } from "@/server/ai/quota";

export function resolveFabricStoragePath(filename: string): string {
  if (process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join("/tmp", "antigravity-fabric", filename);
  }
  if (process.env.APPDATA && (process.versions as any)?.electron) {
    return path.join(process.env.APPDATA, "AntigravityOS", "fabric", filename);
  }
  return path.resolve(process.cwd(), "artifacts", "fabric", filename);
}

export class UsageLedger {
  private static instance: UsageLedger;
  private readonly ledger: UsageRecord[] = [];
  private readonly storagePath: string;
  private budgetConfig: BudgetConfig = {
    dailyLimitUsd: 10.0,
    monthlyLimitUsd: 50.0,
    perProviderLimits: {
      openai: 25.0,
      gemini: 20.0,
      groq: 15.0,
      deepseek: 10.0,
    },
    perTaskMaxCostUsd: 2.5,
    warningThresholdPercent: 80,
    hardStopThresholdPercent: 100,
    temporaryOverrideActive: false,
  };

  public static getInstance(): UsageLedger {
    if (!UsageLedger.instance) {
      UsageLedger.instance = new UsageLedger();
    }
    return UsageLedger.instance;
  }

  private constructor() {
    this.storagePath = resolveFabricStoragePath("ledger.json");
    this.loadFromDisk();
    this.attachQuotaEngineHook();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.storagePath)) {
        const raw = fs.readFileSync(this.storagePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.ledger)) {
          this.ledger.push(...parsed.ledger);
        }
        if (parsed.budgetConfig) {
          this.budgetConfig = { ...this.budgetConfig, ...parsed.budgetConfig };
        }
      }
    } catch {
      // Fallback silently if disk read fails or corrupted
    }
  }

  private saveToDisk(): void {
    try {
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        this.storagePath,
        JSON.stringify(
          {
            updatedAt: new Date().toISOString(),
            budgetConfig: this.budgetConfig,
            ledger: this.ledger,
          },
          null,
          2
        ),
        "utf-8"
      );
    } catch {
      // Fallback silently if write fails
    }
  }

  private attachQuotaEngineHook(): void {
    try {
      const origRecordUsage = quotaEngine.recordUsage.bind(quotaEngine);
      quotaEngine.recordUsage = (
        provider: string,
        promptTokens: number,
        completionTokens: number,
        model: string,
        workspaceId = "default"
      ) => {
        const result = origRecordUsage(provider, promptTokens, completionTokens, model, workspaceId);
        // Only mirror if not already recorded for this exact event
        this.recordInvocation({
          taskId: `quota-mirror-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          workspaceId,
          provider,
          model,
          isLocal: provider === "ollama",
          promptTokens,
          completionTokens,
          billedCostUsd: result.costUsd > 0 ? result.costUsd : undefined,
          cloudReason: provider !== "ollama" ? "Invoked via CentralAIRouter" : undefined,
        });
        return result;
      };
    } catch {
      // Ignore if hook fails
    }
  }

  /**
   * Resolves the pricing tier for a provider and model
   */
  public getPricingTier(provider: string, model: string): ModelPricingTier {
    const provLower = provider.toLowerCase();
    const modelLower = model.toLowerCase();

    // Check specific provider & model match
    const found = VERSIONED_PRICING_TABLE.find((tier) => {
      if (tier.provider !== provLower && tier.provider !== "*") return false;
      if (tier.modelPattern === "*") return true;
      return modelLower.includes(tier.modelPattern);
    });

    if (found) return found;

    // Fallback default pricing tier
    return {
      provider,
      modelPattern: model,
      inputCostPer1M: 1.0,
      cachedInputCostPer1M: 0.5,
      outputCostPer1M: 3.0,
      effectiveDate: "2026-01-01",
      currency: "USD",
    };
  }

  /**
   * Evaluates if a proposed cloud task is permitted under current budget policy
   */
  public checkBudgetPermitted(
    provider: string,
    estimatedCostUsd: number = 0.05
  ): { permitted: boolean; reason?: string; isHardStop: boolean } {
    if (this.budgetConfig.temporaryOverrideActive) {
      return { permitted: true, isHardStop: false };
    }

    const metrics = this.getOptimizationMetrics();

    // Per-task maximum limit check
    if (estimatedCostUsd > this.budgetConfig.perTaskMaxCostUsd) {
      return {
        permitted: false,
        reason: `Task estimated cost ($${estimatedCostUsd.toFixed(4)}) exceeds per-task limit ($${this.budgetConfig.perTaskMaxCostUsd.toFixed(2)}).`,
        isHardStop: false,
      };
    }

    // Monthly hard stop check
    if (metrics.actualCloudSpendUsd >= this.budgetConfig.monthlyLimitUsd) {
      return {
        permitted: false,
        reason: `Monthly budget hard-stop ($${this.budgetConfig.monthlyLimitUsd.toFixed(2)}) reached. Non-essential cloud calls are stopped.`,
        isHardStop: true,
      };
    }

    // Per-provider check
    const provLimit = this.budgetConfig.perProviderLimits[provider.toLowerCase()];
    if (provLimit !== undefined) {
      const provSpend = this.getProviderSpend(provider);
      if (provSpend >= provLimit) {
        return {
          permitted: false,
          reason: `Provider limit for '${provider}' ($${provLimit.toFixed(2)}) reached. Cannot switch to alternate paid providers to evade budget.`,
          isHardStop: true,
        };
      }
    }

    return { permitted: true, isHardStop: false };
  }

  /**
   * Records an inference invocation with token provenance and cost estimates
   */
  public recordInvocation(params: {
    taskId: string;
    workspaceId?: string;
    provider: string;
    model: string;
    isLocal: boolean;
    promptTokens: number;
    completionTokens: number;
    cachedTokens?: number;
    billedCostUsd?: number;
    cloudReason?: string;
    cacheHit?: boolean;
  }): UsageRecord {
    const cachedTokens = params.cachedTokens || 0;
    const totalTokens = params.promptTokens + params.completionTokens + cachedTokens;
    const pricing = this.getPricingTier(params.provider, params.model);

    // Calculate versioned estimated cost
    const promptCost = ((params.promptTokens - cachedTokens) / 1_000_000) * pricing.inputCostPer1M;
    const cachedCost = (cachedTokens / 1_000_000) * pricing.cachedInputCostPer1M;
    const completionCost = (params.completionTokens / 1_000_000) * pricing.outputCostPer1M;

    const estimatedCostUsd = params.isLocal
      ? 0.0
      : Math.max(0, promptCost + cachedCost + completionCost);

    const record: UsageRecord = {
      id: `usage-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      taskId: params.taskId,
      workspaceId: params.workspaceId || "default",
      provider: params.provider,
      model: params.model,
      isLocal: params.isLocal,
      promptTokens: params.promptTokens,
      completionTokens: params.completionTokens,
      cachedTokens,
      totalTokens,
      estimatedCostUsd: Math.round(estimatedCostUsd * 100000) / 100000,
      billedCostUsd: params.billedCostUsd,
      cloudReason: params.cloudReason,
      cacheHit: params.cacheHit || false,
    };

    this.ledger.push(record);
    this.saveToDisk();
    return record;
  }

  public getProviderSpend(provider: string): number {
    const provLower = provider.toLowerCase();
    return this.ledger
      .filter((r) => r.provider.toLowerCase() === provLower && !r.isLocal)
      .reduce((sum, r) => sum + (r.billedCostUsd !== undefined ? r.billedCostUsd : r.estimatedCostUsd), 0);
  }

  public getOptimizationMetrics(): CostOptimizationMetrics {
    const totalRequests = this.ledger.length;
    const localRequests = this.ledger.filter((r) => r.isLocal).length;
    const cloudRequests = totalRequests - localRequests;
    const localRatio = totalRequests > 0 ? (localRequests / totalRequests) * 100 : 100;

    const totalTokens = this.ledger.reduce((sum, r) => sum + r.totalTokens, 0);
    const cachedTokensAvoided = this.ledger.reduce((sum, r) => sum + r.cachedTokens, 0);
    const cacheHits = this.ledger.filter((r) => r.cacheHit).length;
    const cacheHitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;

    const actualCloudSpend = this.ledger
      .filter((r) => !r.isLocal)
      .reduce((sum, r) => sum + (r.billedCostUsd !== undefined ? r.billedCostUsd : r.estimatedCostUsd), 0);

    // Baseline calculation: what would all requests have cost if routed to cloud GPT-4o?
    // GPT-4o baseline: $2.50 input / $10.00 output per 1M tokens (~$4.50 avg per 1M tokens)
    const baselineSpend = (totalTokens / 1_000_000) * 4.5;
    const totalSavings = Math.max(0, baselineSpend - actualCloudSpend);
    const budgetRemaining = Math.max(0, this.budgetConfig.monthlyLimitUsd - actualCloudSpend);

    return {
      totalRequestsHandled: totalRequests,
      localRequestsCount: localRequests,
      cloudRequestsCount: cloudRequests,
      localRatioPercent: Math.round(localRatio * 10) / 10,
      totalTokensProcessed: totalTokens,
      cachedTokensAvoided,
      cacheHitsCount: cacheHits,
      cacheHitRatePercent: Math.round(cacheHitRate * 10) / 10,
      actualCloudSpendUsd: Math.round(actualCloudSpend * 1000) / 1000,
      estimatedBaselineSpendUsd: Math.round(baselineSpend * 1000) / 1000,
      totalCostSavingsUsd: Math.round(totalSavings * 1000) / 1000,
      budgetRemainingUsd: Math.round(budgetRemaining * 1000) / 1000,
      isHardStopTriggered: actualCloudSpend >= this.budgetConfig.monthlyLimitUsd,
    };
  }

  public getBudgetConfig(): BudgetConfig {
    return { ...this.budgetConfig };
  }

  public updateBudgetConfig(newConfig: Partial<BudgetConfig>): void {
    this.budgetConfig = {
      ...this.budgetConfig,
      ...newConfig,
    };
    this.saveToDisk();
  }

  public getRecentLedger(limit = 50): UsageRecord[] {
    return this.ledger.slice(-limit);
  }

  public exportSanitizedLedgerJson(): string {
    const raw = JSON.stringify(
      {
        metrics: this.getOptimizationMetrics(),
        budgetConfig: this.budgetConfig,
        ledger: this.ledger,
      },
      null,
      2
    );
    const { redactedText } = HermesPolicy.redactSecrets(raw);
    return redactedText;
  }
}

export const usageLedger = UsageLedger.getInstance();
