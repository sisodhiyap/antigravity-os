export interface ProviderStats {
  requests: number;
  totalTokensEstimated: number;
  failures: number;
  rateLimitHits: number;
  averageLatencyMs: number;
  health: 'HEALTHY' | 'DEGRADED' | 'RATE_LIMITED' | 'OFFLINE';
}

export class QuotaManager {
  private stats: Map<string, ProviderStats> = new Map();

  constructor() {
    this.stats.set('ollama', {
      requests: 0,
      totalTokensEstimated: 0,
      failures: 0,
      rateLimitHits: 0,
      averageLatencyMs: 15,
      health: 'HEALTHY'
    });
    this.stats.set('omniroute', {
      requests: 0,
      totalTokensEstimated: 0,
      failures: 0,
      rateLimitHits: 0,
      averageLatencyMs: 50,
      health: 'HEALTHY'
    });
    this.stats.set('antigravity_native', {
      requests: 0,
      totalTokensEstimated: 0,
      failures: 0,
      rateLimitHits: 0,
      averageLatencyMs: 120,
      health: 'HEALTHY'
    });
  }

  recordRequest(provider: string, tokens: number, latencyMs: number, success: boolean, isRateLimit = false) {
    let current = this.stats.get(provider);
    if (!current) {
      current = {
        requests: 0,
        totalTokensEstimated: 0,
        failures: 0,
        rateLimitHits: 0,
        averageLatencyMs: 0,
        health: 'HEALTHY'
      };
      this.stats.set(provider, current);
    }

    current.requests++;
    current.totalTokensEstimated += tokens;
    current.averageLatencyMs = Math.round((current.averageLatencyMs + latencyMs) / 2);

    if (!success) {
      current.failures++;
      if (isRateLimit) {
        current.rateLimitHits++;
        current.health = 'RATE_LIMITED';
      } else {
        current.health = 'DEGRADED';
      }
    } else {
      current.health = 'HEALTHY';
    }
  }

  getProviderStats(provider: string): ProviderStats | undefined {
    return this.stats.get(provider);
  }

  getAllStats() {
    return Object.fromEntries(this.stats);
  }
}
