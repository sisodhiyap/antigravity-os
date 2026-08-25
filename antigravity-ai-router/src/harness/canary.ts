/**
 * Antigravity Production-Grade Adaptive Harness - Production Canary Controller
 * Manages graduated stages: 10% -> 25% -> 50% -> 100% -> PRODUCTION_LOCKED.
 */

import { CanaryCohort, HarnessSafetyMode } from './types.js';

export class CanaryRolloutController {
  private cohort: CanaryCohort = {
    cohortId: 'canary-phase4',
    percentage: 0,
    active: false,
    baselineCount: 0,
    harnessCount: 0,
    baselineQuality: 95,
    harnessQuality: 95,
    baselineCost: 0.02,
    harnessCost: 0.02,
    errorCount: 0
  };

  private currentSafetyMode: HarnessSafetyMode = 'advisory';
  private isLocked = false;

  public getSafetyMode(): HarnessSafetyMode {
    return this.currentSafetyMode;
  }

  public isProductionLocked(): boolean {
    return this.isLocked;
  }

  public setSafetyMode(mode: HarnessSafetyMode): { success: boolean; reason: string } {
    if (this.isLocked && mode !== 'production_locked') {
      return { success: false, reason: 'System is in PRODUCTION_LOCKED state. Accidental configuration mutation is strictly blocked.' };
    }

    this.currentSafetyMode = mode;

    if (mode === 'enforced_10') {
      this.cohort.percentage = 10;
      this.cohort.active = true;
    } else if (mode === 'enforced_25') {
      this.cohort.percentage = 25;
      this.cohort.active = true;
    } else if (mode === 'enforced_50') {
      this.cohort.percentage = 50;
      this.cohort.active = true;
    } else if (mode === 'enforced_100') {
      this.cohort.percentage = 100;
      this.cohort.active = true;
    } else if (mode === 'production_locked') {
      this.cohort.percentage = 100;
      this.cohort.active = true;
      this.isLocked = true;
    } else {
      this.cohort.percentage = 0;
      this.cohort.active = false;
    }

    return { success: true, reason: `Safety mode successfully set to ${mode}` };
  }

  public setCanaryPercentage(percentage: number) {
    if (this.isLocked) return;
    this.cohort.percentage = Math.min(100, Math.max(0, percentage));
    this.cohort.active = this.cohort.percentage > 0;
  }

  public getCanaryCohort(): Readonly<CanaryCohort> {
    return { ...this.cohort };
  }

  public shouldRouteToHarness(): boolean {
    if (this.currentSafetyMode === 'production_locked' || this.currentSafetyMode === 'enforced_100') {
      return true;
    }
    if (!this.cohort.active || this.cohort.percentage === 0) {
      return false;
    }
    if (this.cohort.percentage >= 100) {
      return true;
    }
    return (Math.random() * 100) < this.cohort.percentage;
  }

  public recordCanaryOutcome(isHarness: boolean, quality: number, costUsd: number, success: boolean) {
    if (isHarness) {
      const n = this.cohort.harnessCount;
      this.cohort.harnessQuality = (this.cohort.harnessQuality * n + quality) / (n + 1);
      this.cohort.harnessCost = (this.cohort.harnessCost * n + costUsd) / (n + 1);
      this.cohort.harnessCount++;
      if (!success) this.cohort.errorCount++;

      // Automatic Canary Rollback Check: Quality drop > 1% or error rate > 5% after 5 tasks
      if (this.cohort.harnessCount >= 5) {
        const qualityDrop = (this.cohort.baselineQuality - this.cohort.harnessQuality) / this.cohort.baselineQuality;
        const errorRate = this.cohort.errorCount / this.cohort.harnessCount;

        if (qualityDrop > 0.01 || errorRate > 0.05) {
          this.rollbackCanary(`Canary auto-rollback: Quality drop ${(qualityDrop * 100).toFixed(1)}% or error rate ${(errorRate * 100).toFixed(1)}% exceeded limits.`);
        }
      }
    } else {
      const n = this.cohort.baselineCount;
      this.cohort.baselineQuality = (this.cohort.baselineQuality * n + quality) / (n + 1);
      this.cohort.baselineCost = (this.cohort.baselineCost * n + costUsd) / (n + 1);
      this.cohort.baselineCount++;
    }
  }

  public rollbackCanary(reason: string) {
    this.cohort.percentage = 0;
    this.cohort.active = false;
    this.currentSafetyMode = 'advisory';
    this.isLocked = false;
  }
}

export const canaryController = new CanaryRolloutController();
