/**
 * ANTIGRAVITY OS v5.4 — TOOL SCORECARD
 * ToolScorecard: Tracks tool reliability, latency, risk rating, and success rates
 */

export interface ToolPerformanceEntry {
  toolName: string;
  category: "DOCKER" | "BROWSER_QA" | "DATABASE" | "FILESYSTEM" | "MCP" | "GIT";
  totalInvocations: number;
  successfulInvocations: number;
  successRate: number;
  avgLatencyMs: number;
  securityRisk: "LOW" | "MEDIUM" | "HIGH";
  lastVerified: string;
}

export class ToolScorecard {
  private static instance: ToolScorecard;
  private readonly toolScores: Map<string, ToolPerformanceEntry> = new Map();

  private constructor() {
    this.seedDefaults();
  }

  public static getInstance(): ToolScorecard {
    if (!ToolScorecard.instance) {
      ToolScorecard.instance = new ToolScorecard();
    }
    return ToolScorecard.instance;
  }

  private seedDefaults() {
    const defaults: ToolPerformanceEntry[] = [
      {
        toolName: "SQLite WAL Engine",
        category: "DATABASE",
        totalInvocations: 120,
        successfulInvocations: 120,
        successRate: 1.0,
        avgLatencyMs: 0.45,
        securityRisk: "LOW",
        lastVerified: new Date().toISOString()
      },
      {
        toolName: "Playwright E2E Runner",
        category: "BROWSER_QA",
        totalInvocations: 45,
        successfulInvocations: 44,
        successRate: 0.978,
        avgLatencyMs: 1200,
        securityRisk: "LOW",
        lastVerified: new Date().toISOString()
      },
      {
        toolName: "Docker Multi-Stage Builder",
        category: "DOCKER",
        totalInvocations: 30,
        successfulInvocations: 30,
        successRate: 1.0,
        avgLatencyMs: 4500,
        securityRisk: "LOW",
        lastVerified: new Date().toISOString()
      }
    ];

    for (const d of defaults) {
      this.toolScores.set(d.toolName, d);
    }
  }

  public recordToolUsage(toolName: string, success: boolean, latencyMs: number) {
    const existing = this.toolScores.get(toolName) || {
      toolName,
      category: "MCP",
      totalInvocations: 0,
      successfulInvocations: 0,
      successRate: 0,
      avgLatencyMs: latencyMs,
      securityRisk: "LOW",
      lastVerified: new Date().toISOString()
    };

    existing.totalInvocations++;
    if (success) existing.successfulInvocations++;
    existing.successRate = Number((existing.successfulInvocations / existing.totalInvocations).toFixed(3));
    existing.avgLatencyMs = Number(((existing.avgLatencyMs * 0.7) + (latencyMs * 0.3)).toFixed(0));
    existing.lastVerified = new Date().toISOString();

    this.toolScores.set(toolName, existing);
  }

  public getAllToolScores(): ToolPerformanceEntry[] {
    return Array.from(this.toolScores.values());
  }
}
