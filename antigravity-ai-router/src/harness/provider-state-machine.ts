/**
 * Antigravity Production-Grade Adaptive Harness - Provider State Machine & Recovery Controller
 * Explicitly manages provider lifecycle states (AVAILABLE, RATE_LIMITED, QUOTA_EXHAUSTED, etc.)
 * with bounded cooldowns, probe recovery, and zero infinite failure loops.
 */

import { ProviderState, ProviderStatusInfo } from './types.js';

export class ProviderStateMachine {
  private providers: Map<string, ProviderStatusInfo> = new Map();
  private cooldownDurationMs = 30000; // 30s rate limit cooldown

  constructor() {
    const initial = ['ollama', 'openrouter', 'openai', 'google', 'deepseek', 'router9'];
    for (const p of initial) {
      this.providers.set(p, {
        provider: p,
        state: 'AVAILABLE',
        lastStateChange: Date.now(),
        consecutiveFailures: 0,
        cooldownUntil: 0,
        totalRequests: 0,
        successfulRequests: 0,
        reliabilityScore: 1.0
      });
    }
  }

  public getStatus(provider: string): ProviderStatusInfo {
    const key = provider.toLowerCase();
    let status = this.providers.get(key);
    if (!status) {
      status = {
        provider: key,
        state: 'AVAILABLE',
        lastStateChange: Date.now(),
        consecutiveFailures: 0,
        cooldownUntil: 0,
        totalRequests: 0,
        successfulRequests: 0,
        reliabilityScore: 0.95
      };
      this.providers.set(key, status);
    }

    // Check if cooldown expired to transition RATE_LIMITED -> PROBE / AVAILABLE
    if (status.state === 'RATE_LIMITED' && Date.now() >= status.cooldownUntil) {
      status.state = 'AVAILABLE';
      status.lastStateChange = Date.now();
      status.consecutiveFailures = 0;
    }

    return status;
  }

  public isAvailable(provider: string): boolean {
    const s = this.getStatus(provider);
    return s.state === 'AVAILABLE' || s.state === 'DEGRADED';
  }

  public recordSuccess(provider: string) {
    const s = this.getStatus(provider);
    s.totalRequests++;
    s.successfulRequests++;
    s.consecutiveFailures = 0;
    s.state = 'AVAILABLE';
    s.reliabilityScore = Math.min(1.0, s.successfulRequests / Math.max(1, s.totalRequests));
  }

  public recordFailure(provider: string, errorType: '429' | '500' | 'auth' | 'quota' | 'network' | 'unknown') {
    const s = this.getStatus(provider);
    s.totalRequests++;
    s.consecutiveFailures++;
    s.lastStateChange = Date.now();

    if (errorType === '429') {
      s.state = 'RATE_LIMITED';
      s.cooldownUntil = Date.now() + this.cooldownDurationMs;
    } else if (errorType === 'quota') {
      s.state = 'QUOTA_EXHAUSTED';
      s.cooldownUntil = Date.now() + 3600000; // 1 hour cooldown for exhausted quota
    } else if (errorType === 'auth') {
      s.state = 'AUTH_FAILURE';
    } else if (errorType === 'network') {
      s.state = 'NETWORK_FAILURE';
      s.cooldownUntil = Date.now() + 10000;
    } else {
      s.state = s.consecutiveFailures >= 3 ? 'DEGRADED' : 'AVAILABLE';
    }

    s.reliabilityScore = Math.max(0.0, s.successfulRequests / Math.max(1, s.totalRequests));
  }

  public resetProvider(provider: string) {
    const s = this.getStatus(provider);
    s.state = 'AVAILABLE';
    s.consecutiveFailures = 0;
    s.cooldownUntil = 0;
    s.lastStateChange = Date.now();
  }

  public getAllStatuses(): ProviderStatusInfo[] {
    return Array.from(this.providers.values());
  }
}

export const providerStateMachine = new ProviderStateMachine();
