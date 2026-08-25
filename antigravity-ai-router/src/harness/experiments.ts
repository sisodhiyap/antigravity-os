/**
 * Antigravity Production-Grade Adaptive Harness - Controlled Experimentation & Automatic Rollback Engine
 * Evaluates optimization policy variants and automatically triggers instant rollback if quality drops > 1%
 * or error rate spikes.
 */

import { PolicyExperiment, WorkloadCategory } from './types.js';

export class PolicyExperimentManager {
  private experiments: Map<string, PolicyExperiment> = new Map();
  private maxAllowedQualityRegression = 0.01; // Max 1% quality regression allowed
  private maxAllowedErrorIncrease = 0.05;     // Max 5% error rate increase allowed

  public registerExperiment(
    policyId: string,
    version: string,
    targetWorkloads: WorkloadCategory[],
    sampleRate: number = 0.2
  ): PolicyExperiment {
    const exp: PolicyExperiment = {
      policyId,
      version,
      enabled: true,
      sampleRate,
      targetWorkloads,
      baselineMetrics: { avgQuality: 95, avgCostPerSuccess: 0.02, errorRate: 0.02, sampleCount: 0 },
      experimentMetrics: { avgQuality: 95, avgCostPerSuccess: 0.02, errorRate: 0.02, sampleCount: 0 },
      status: 'ACTIVE'
    };
    this.experiments.set(policyId, exp);
    return exp;
  }

  public getExperiment(policyId: string): PolicyExperiment | undefined {
    return this.experiments.get(policyId);
  }

  public shouldApplyExperiment(policyId: string, category: WorkloadCategory): boolean {
    const exp = this.experiments.get(policyId);
    if (!exp || !exp.enabled || exp.status !== 'ACTIVE') return false;
    if (!exp.targetWorkloads.includes(category)) return false;
    return Math.random() < exp.sampleRate;
  }

  public recordTrial(
    policyId: string,
    isExperimentGroup: boolean,
    qualityScore: number,
    costUsd: number,
    isSuccess: boolean
  ) {
    const exp = this.experiments.get(policyId);
    if (!exp || exp.status !== 'ACTIVE') return;

    const target = isExperimentGroup ? exp.experimentMetrics : exp.baselineMetrics;
    const n = target.sampleCount;

    target.avgQuality = (target.avgQuality * n + qualityScore) / (n + 1);
    target.avgCostPerSuccess = (target.avgCostPerSuccess * n + costUsd) / (n + 1);
    target.errorRate = (target.errorRate * n + (isSuccess ? 0 : 1)) / (n + 1);
    target.sampleCount++;

    // Phase 31: Automatic Rollback Check after minimum 5 samples
    if (exp.experimentMetrics.sampleCount >= 5) {
      const qualityDrop = (exp.baselineMetrics.avgQuality - exp.experimentMetrics.avgQuality) / exp.baselineMetrics.avgQuality;
      const errorSpike = exp.experimentMetrics.errorRate - exp.baselineMetrics.errorRate;

      if (qualityDrop > this.maxAllowedQualityRegression) {
        this.rollback(policyId, `Automatic rollback triggered: Quality regressed by ${(qualityDrop * 100).toFixed(1)}% (exceeded 1% limit).`);
      } else if (errorSpike > this.maxAllowedErrorIncrease) {
        this.rollback(policyId, `Automatic rollback triggered: Error rate increased by ${(errorSpike * 100).toFixed(1)}%.`);
      }
    }
  }

  public rollback(policyId: string, reason: string) {
    const exp = this.experiments.get(policyId);
    if (exp) {
      exp.enabled = false;
      exp.status = 'ROLLED_BACK';
      exp.rollbackReason = reason;
    }
  }

  public getAllExperiments(): PolicyExperiment[] {
    return Array.from(this.experiments.values());
  }
}

export const policyExperimentManager = new PolicyExperimentManager();
