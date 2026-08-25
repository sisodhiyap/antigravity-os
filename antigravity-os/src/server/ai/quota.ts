export interface UsageStats {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  requestCount: number;
}

export class QuotaGovernanceEngine {
  private static instance: QuotaGovernanceEngine;
  private providerUsage: Map<string, UsageStats> = new Map();
  private workspaceUsage: Map<string, UsageStats> = new Map();
  private globalBudgetUsd = 50.0;
  private globalSpendUsd = 0.0;

  private constructor() {}

  public static getInstance(): QuotaGovernanceEngine {
    if (!QuotaGovernanceEngine.instance) {
      QuotaGovernanceEngine.instance = new QuotaGovernanceEngine();
    }
    return QuotaGovernanceEngine.instance;
  }

  public recordUsage(
    provider: string,
    promptTokens: number,
    completionTokens: number,
    model: string,
    workspaceId = "default"
  ): { costUsd: number; totalSpendUsd: number } {
    const totalTokens = promptTokens + completionTokens;
    let costPerMillion = 0.0;

    // Estimate cost per 1M tokens based on provider/model
    if (provider === "ollama") {
      costPerMillion = 0.0; // Local free GPU inference
    } else if (model.includes("deepseek")) {
      costPerMillion = 0.28;
    } else if (model.includes("gemini-2.5") || model.includes("gemini-1.5-flash")) {
      costPerMillion = 0.075;
    } else if (model.includes("gpt-4o")) {
      costPerMillion = 2.5;
    } else if (provider === "openrouter") {
      costPerMillion = 0.0; // Free tier default fallback
    }

    const costUsd = (totalTokens / 1_000_000) * costPerMillion;
    this.globalSpendUsd += costUsd;

    // Record Provider Stats
    const prevProvider = this.providerUsage.get(provider) || {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      estimatedCostUsd: 0,
      requestCount: 0,
    };
    this.providerUsage.set(provider, {
      promptTokens: prevProvider.promptTokens + promptTokens,
      completionTokens: prevProvider.completionTokens + completionTokens,
      totalTokens: prevProvider.totalTokens + totalTokens,
      estimatedCostUsd: prevProvider.estimatedCostUsd + costUsd,
      requestCount: prevProvider.requestCount + 1,
    });

    // Record Workspace Stats
    const prevWorkspace = this.workspaceUsage.get(workspaceId) || {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      estimatedCostUsd: 0,
      requestCount: 0,
    };
    this.workspaceUsage.set(workspaceId, {
      promptTokens: prevWorkspace.promptTokens + promptTokens,
      completionTokens: prevWorkspace.completionTokens + completionTokens,
      totalTokens: prevWorkspace.totalTokens + totalTokens,
      estimatedCostUsd: prevWorkspace.estimatedCostUsd + costUsd,
      requestCount: prevWorkspace.requestCount + 1,
    });

    return { costUsd, totalSpendUsd: this.globalSpendUsd };
  }

  public checkBudget(workspaceId = "default", maxAllowedUsd = 10.0): boolean {
    if (this.globalSpendUsd >= this.globalBudgetUsd) return false;
    const ws = this.workspaceUsage.get(workspaceId);
    if (ws && ws.estimatedCostUsd >= maxAllowedUsd) return false;
    return true;
  }

  public getWorkspaceStats(workspaceId: string): (UsageStats & { totalCostUsd: number }) | undefined {
    const ws = this.workspaceUsage.get(workspaceId);
    if (!ws) return undefined;
    return { ...ws, totalCostUsd: ws.estimatedCostUsd };
  }

  public getAllStats() {
    return {
      globalSpendUsd: parseFloat(this.globalSpendUsd.toFixed(4)),
      globalBudgetUsd: this.globalBudgetUsd,
      providers: Object.fromEntries(this.providerUsage.entries()),
      workspaces: Object.fromEntries(this.workspaceUsage.entries()),
    };
  }
}

export const quotaEngine = QuotaGovernanceEngine.getInstance();
