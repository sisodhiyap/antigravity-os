/**
 * Antigravity Production-Grade Adaptive Harness - Phase 3 Production Enforcement Gate
 * Evaluates real-workload telemetry for multi-stage safety transitions:
 * SHADOW -> ADVISORY -> ENFORCED.
 * Strictly enforces that Enforced mode requires explicit operator approval even when gate passes.
 */

import { HarnessSafetyMode } from './types.js';

export interface ProductionGateAudit {
  canPromote: boolean;
  currentMode: HarnessSafetyMode;
  targetMode: HarnessSafetyMode;
  reasons: string[];
  blockers: string[];
  gateStatus: 'PASSED' | 'FAILED' | 'OPERATOR_APPROVAL_REQUIRED';
  metrics: {
    sampleSize: number;
    qualityBaseline: number;
    qualityHarness: number;
    costBaseline: number;
    costHarness: number;
    fallbackVerified: boolean;
    errorRate: number;
  };
}

export class ProductionEnforcementGate {
  private minSampleSizeForAdvisory = 50; // Minimum 50 real tasks required for Advisory
  private minSampleSizeForEnforced = 50; // Minimum 50 real tasks required for Enforced
  private maxAllowedQualityDrop = 1.0;   // Maximum 1.0 point drop on 0-100 scale
  private maxAllowedErrorRate = 0.03;    // Maximum 3% error rate allowed

  public evaluatePromotion(
    targetMode: HarnessSafetyMode,
    currentMetrics: {
      sampleSize: number;
      qualityBaseline: number;
      qualityHarness: number;
      costBaseline: number;
      costHarness: number;
      fallbackVerified: boolean;
      errorRate?: number;
    },
    currentMode: HarnessSafetyMode = 'shadow'
  ): ProductionGateAudit {
    const blockers: string[] = [];
    const reasons: string[] = [];
    const errorRate = currentMetrics.errorRate || 0;

    // 1. Check Sample Size
    const requiredSample = targetMode === 'advisory' ? this.minSampleSizeForAdvisory : this.minSampleSizeForEnforced;
    if (currentMetrics.sampleSize < requiredSample) {
      blockers.push(`Sample size (${currentMetrics.sampleSize}) is below required threshold (${requiredSample} real tasks).`);
    } else {
      reasons.push(`Sample size requirement satisfied: ${currentMetrics.sampleSize} / ${requiredSample} tasks.`);
    }

    // 2. Check Quality Stability
    const qualityDrop = currentMetrics.qualityBaseline - currentMetrics.qualityHarness;
    if (qualityDrop > this.maxAllowedQualityDrop) {
      blockers.push(`Quality regressed by ${qualityDrop.toFixed(1)} points (max permitted drop: ${this.maxAllowedQualityDrop}).`);
    } else {
      reasons.push(`Quality verified stable (${currentMetrics.qualityHarness}/100 vs baseline ${currentMetrics.qualityBaseline}/100).`);
    }

    // 3. Check Cost Efficiency
    if (currentMetrics.costHarness > currentMetrics.costBaseline) {
      blockers.push(`Harness cost ($${currentMetrics.costHarness.toFixed(4)}) is higher than baseline ($${currentMetrics.costBaseline.toFixed(4)}).`);
    } else {
      reasons.push(`Cost efficiency confirmed: $${currentMetrics.costHarness.toFixed(4)} vs baseline $${currentMetrics.costBaseline.toFixed(4)}.`);
    }

    // 4. Check Error Rate
    if (errorRate > this.maxAllowedErrorRate) {
      blockers.push(`Error rate (${(errorRate * 100).toFixed(1)}%) exceeds safety limit (${(this.maxAllowedErrorRate * 100).toFixed(1)}%).`);
    } else {
      reasons.push(`Error rate is within tolerance (${(errorRate * 100).toFixed(1)}%).`);
    }

    // 5. Check Fallback Engine
    if (!currentMetrics.fallbackVerified) {
      blockers.push('Fallback engine is not verified.');
    } else {
      reasons.push('Safe fallback engine verified.');
    }

    const canPromote = blockers.length === 0;
    let gateStatus: 'PASSED' | 'FAILED' | 'OPERATOR_APPROVAL_REQUIRED' = canPromote ? 'PASSED' : 'FAILED';

    if (canPromote && targetMode === 'enforced') {
      gateStatus = 'OPERATOR_APPROVAL_REQUIRED';
      reasons.push('Explicit human operator approval required before enabling ENFORCED mode.');
    }

    return {
      canPromote,
      currentMode,
      targetMode,
      reasons,
      blockers,
      gateStatus,
      metrics: {
        ...currentMetrics,
        errorRate
      }
    };
  }
}

export const productionEnforcementGate = new ProductionEnforcementGate();
