/**
 * Antigravity Production-Grade Adaptive Harness - Provider Metadata & Latency Tracker
 * Accurately models provider daily quota reset characteristics and cold/warm latency metrics.
 */

import { ProviderResetMetadata } from './types.js';

export class ProviderMetadataManager {
  private metadata: Map<string, ProviderResetMetadata> = new Map([
    [
      'ollama',
      {
        provider: 'ollama',
        resetType: 'unknown', // Unlimited local compute
        coldStartLatencyMs: 45000, // CPU cold model loading
        warmLatencyMs: 1200,      // In-memory CPU inference
        reliabilityScore: 0.99
      }
    ],
    [
      'openrouter',
      {
        provider: 'openrouter',
        resetType: 'utc_midnight',
        estimatedResetWindow: '00:00 UTC',
        coldStartLatencyMs: 650,
        warmLatencyMs: 450,
        reliabilityScore: 0.96
      }
    ],
    [
      'openai',
      {
        provider: 'openai',
        resetType: 'monthly_fixed',
        coldStartLatencyMs: 500,
        warmLatencyMs: 380,
        reliabilityScore: 0.99
      }
    ],
    [
      'google',
      {
        provider: 'google',
        resetType: 'rolling_24h',
        coldStartLatencyMs: 400,
        warmLatencyMs: 320,
        reliabilityScore: 0.98
      }
    ],
    [
      'deepseek',
      {
        provider: 'deepseek',
        resetType: 'monthly_fixed',
        coldStartLatencyMs: 600,
        warmLatencyMs: 450,
        reliabilityScore: 0.95
      }
    ]
  ]);

  public getProviderMetadata(provider: string): ProviderResetMetadata {
    return (
      this.metadata.get(provider.toLowerCase()) || {
        provider,
        resetType: 'unknown',
        reliabilityScore: 0.90
      }
    );
  }

  public recordObservedLatency(provider: string, latencyMs: number, isColdStart = false) {
    const meta = this.getProviderMetadata(provider);
    if (isColdStart) {
      meta.coldStartLatencyMs = latencyMs;
    } else {
      meta.warmLatencyMs = Math.round(((meta.warmLatencyMs || latencyMs) + latencyMs) / 2);
    }
  }
}

export const providerMetadataManager = new ProviderMetadataManager();
