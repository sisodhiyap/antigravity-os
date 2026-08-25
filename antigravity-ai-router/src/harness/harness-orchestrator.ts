/**
 * Antigravity Production-Grade Adaptive Harness - Master Orchestrator (Phase 4)
 * Final Production Enforcement, Hardening & Certification
 */

import { TaskClassifier, taskClassifier } from './task-classifier.js';
import { CreditGovernor } from './credit-governor.js';
import { ModelRouter, modelRouter } from './model-router.js';
import { FallbackEngine } from '../router/fallback-engine.js';
import { QuotaManager } from '../router/quota-manager.js';
import { SoloModeExecutor } from './modes/solo-mode.js';
import { PipelineModeExecutor } from './modes/pipeline-mode.js';
import { ParallelModeExecutor } from './modes/parallel-mode.js';
import { SupervisorModeExecutor } from './modes/supervisor-mode.js';
import { HarnessTelemetry, harnessTelemetry } from './telemetry.js';
import { defaultHarnessConfig } from './config.js';
import { qualityVsCostEngine } from './quality-vs-cost.js';
import { killSwitchManager } from './kill-switches.js';
import { canaryController } from './canary.js';
import { productionLockController } from './production-lock.js';
import { providerStateMachine } from './provider-state-machine.js';
import {
  HarnessConfig,
  HarnessExecutionTelemetry,
  TaskProfile,
  ShadowPrediction,
  BaselineTelemetry,
  HarnessSafetyMode
} from './types.js';

export interface HarnessExecutionResult {
  output: string;
  telemetry: HarnessExecutionTelemetry;
  taskProfile: TaskProfile;
  success: boolean;
  shadowPrediction?: ShadowPrediction;
  safetyMode: HarnessSafetyMode;
}

export class AntigravityHarness {
  private config: HarnessConfig;
  private classifier: TaskClassifier;
  private modelRouter: ModelRouter;
  private fallbackEngine: FallbackEngine;
  private quotaManager: QuotaManager;
  private telemetry: HarnessTelemetry;

  private soloExecutor: SoloModeExecutor;
  private pipelineExecutor: PipelineModeExecutor;
  private parallelExecutor: ParallelModeExecutor;
  private supervisorExecutor: SupervisorModeExecutor;

  constructor(
    quotaManager?: QuotaManager,
    fallbackEngine?: FallbackEngine,
    config?: Partial<HarnessConfig>
  ) {
    this.config = { ...defaultHarnessConfig, ...config };
    this.quotaManager = quotaManager || new QuotaManager();
    this.fallbackEngine = fallbackEngine || new FallbackEngine(this.quotaManager);
    this.classifier = taskClassifier;
    this.modelRouter = modelRouter;
    this.telemetry = harnessTelemetry;

    this.soloExecutor = new SoloModeExecutor(this.fallbackEngine, this.modelRouter);
    this.pipelineExecutor = new PipelineModeExecutor(this.fallbackEngine, this.modelRouter);
    this.parallelExecutor = new ParallelModeExecutor(this.fallbackEngine, this.modelRouter);
    this.supervisorExecutor = new SupervisorModeExecutor(this.fallbackEngine, this.modelRouter);
  }

  public setSafetyMode(mode: HarnessSafetyMode): { success: boolean; reason: string } {
    if (productionLockController.isLocked() && mode !== 'production_locked') {
      return { success: false, reason: 'System is in PRODUCTION_LOCKED state. Accidental configuration mutation is strictly blocked.' };
    }

    this.config.safetyMode = mode;
    canaryController.setSafetyMode(mode);

    if (mode === 'production_locked') {
      this.config.locked = true;
      productionLockController.lock('operator');
    }

    return { success: true, reason: `Safety mode successfully set to ${mode}` };
  }

  public getSafetyMode(): HarnessSafetyMode {
    return this.config.safetyMode;
  }

  public setCanaryPercentage(percentage: number) {
    if (productionLockController.isLocked()) return;
    this.config.canaryPercentage = percentage;
    canaryController.setCanaryPercentage(percentage);
  }

  public generateShadowPrediction(prompt: string, profile: TaskProfile): ShadowPrediction {
    const routing = this.modelRouter.route(profile, new CreditGovernor(profile));
    const predictedAgents = profile.complexity <= 4 ? 1 : profile.complexity <= 7 ? 2 : 3;
    const predictedTokens = profile.estimatedContextTokens;
    const predictedCost = (predictedTokens / 1_000_000) * (routing.tier === 'cheap' ? 0.0 : routing.tier === 'standard' ? 0.75 : 8.0);

    return {
      taskId: profile.taskId,
      mode: profile.recommendedMode,
      predictedAgents,
      predictedModelTier: routing.tier,
      predictedModel: routing.primaryModel,
      predictedToolCalls: profile.expectedToolCalls,
      predictedRetries: profile.complexity >= 8 ? 1 : 0,
      predictedReviews: profile.requiresReview ? 1 : 0,
      predictedTokens,
      predictedCostUsd: Math.round(predictedCost * 10000) / 10000,
      reasoning: `Predicted ${profile.recommendedMode} using ${routing.tier} model (${routing.primaryModel}) for complexity ${profile.complexity}.`,
      timestamp: Date.now()
    };
  }

  /**
   * Phase 4 Master Execution Entrypoint
   */
  public async executeTask(prompt: string, taskId?: string): Promise<HarnessExecutionResult> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const profile = this.classifier.classify(prompt, taskId);
    const governor = new CreditGovernor(profile);
    const safetyMode = this.config.safetyMode;

    // Step 11: Global Emergency Kill Switch (HARNESS_GLOBAL_DISABLE)
    if (!killSwitchManager.isEnabled('harness')) {
      const resp = await this.fallbackEngine.executeRequest({ prompt });
      governor.recordTokenUsage('cheap', resp.selectedModel, Math.ceil(prompt.length / 3.8), Math.ceil(resp.content.length / 3.8));
      const tel = this.telemetry.recordExecution(
        profile,
        governor,
        'SUCCESS',
        'Global Harness kill-switch active; executed via baseline router.',
        'shadow',
        undefined,
        undefined,
        92,
        'LOW',
        this.config.policyVersion
      );
      tel.executionId = executionId;
      return { output: resp.content, telemetry: tel, taskProfile: profile, success: true, safetyMode: 'shadow' };
    }

    // 1. SHADOW MODE
    if (safetyMode === 'shadow') {
      const shadowPred = this.generateShadowPrediction(prompt, profile);
      const startTime = Date.now();
      const baselineResp = await this.fallbackEngine.executeRequest({ prompt });
      const latencyMs = Date.now() - startTime;

      const promptToks = Math.ceil(prompt.length / 3.8);
      const compToks = Math.ceil(baselineResp.content.length / 3.8);
      const totalToks = promptToks + compToks;
      const baselineCost = (totalToks / 1_000_000) * 1.5;

      governor.recordTokenUsage('cheap', baselineResp.selectedModel, promptToks, compToks);

      const baselineTelemetry: BaselineTelemetry = {
        taskId: profile.taskId,
        mode: 'solo',
        agentsUsed: 1,
        modelUsed: baselineResp.selectedModel,
        toolCalls: profile.expectedToolCalls,
        retries: 0,
        reviews: 0,
        tokensUsed: totalToks,
        costUsd: Math.round(baselineCost * 10000) / 10000,
        latencyMs,
        success: true
      };

      const telemetry = this.telemetry.recordExecution(
        profile,
        governor,
        'SUCCESS',
        'Shadow mode prediction recorded; baseline execution completed.',
        'shadow',
        shadowPred,
        baselineTelemetry,
        94,
        'HIGH',
        this.config.policyVersion,
        false
      );
      telemetry.executionId = executionId;

      return {
        output: baselineResp.content,
        telemetry,
        taskProfile: profile,
        success: true,
        shadowPrediction: shadowPred,
        safetyMode: 'shadow'
      };
    }

    // 2. ADVISORY MODE
    if (safetyMode === 'advisory') {
      const shadowPred = this.generateShadowPrediction(prompt, profile);
      const startTime = Date.now();
      const baselineResp = await this.fallbackEngine.executeRequest({ prompt });
      const latencyMs = Date.now() - startTime;

      const promptToks = Math.ceil(prompt.length / 3.8);
      const compToks = Math.ceil(baselineResp.content.length / 3.8);
      governor.recordTokenUsage('cheap', baselineResp.selectedModel, promptToks, compToks);

      const telemetry = this.telemetry.recordExecution(
        profile,
        governor,
        'SUCCESS',
        `Advisory mode recommendation emitted: [${shadowPred.mode} with ${shadowPred.predictedAgents} agents].`,
        'advisory',
        shadowPred,
        undefined,
        94,
        'HIGH',
        this.config.policyVersion,
        true
      );
      telemetry.executionId = executionId;

      return {
        output: baselineResp.content,
        telemetry,
        taskProfile: profile,
        success: true,
        shadowPrediction: shadowPred,
        safetyMode: 'advisory'
      };
    }

    // 3. ENFORCED & PRODUCTION_LOCKED MODES (Canary Evaluation)
    const isRoutingToHarness = canaryController.shouldRouteToHarness();
    const activeCohortId = canaryController.getCanaryCohort().percentage > 0 ? `canary-${safetyMode}` : undefined;

    if (!isRoutingToHarness) {
      // 90%, 75%, 50% baseline control cohort traffic
      const baselineResp = await this.fallbackEngine.executeRequest({ prompt });
      governor.recordTokenUsage('cheap', baselineResp.selectedModel, Math.ceil(prompt.length / 3.8), Math.ceil(baselineResp.content.length / 3.8));
      const tel = this.telemetry.recordExecution(
        profile,
        governor,
        'SUCCESS',
        `Canary control cohort routed to baseline (${safetyMode}).`,
        safetyMode,
        undefined,
        undefined,
        94,
        'HIGH',
        this.config.policyVersion,
        false
      );
      tel.executionId = executionId;
      tel.cohortId = activeCohortId;
      canaryController.recordCanaryOutcome(false, 94, governor.estimatedCostUsd, true);
      return { output: baselineResp.content, telemetry: tel, taskProfile: profile, success: true, safetyMode };
    }

    let finalOutput = '';
    let finalStatus: 'SUCCESS' | 'BUDGET_EXHAUSTED' | 'FAILED' | 'FALLBACK_COMPLETED' = 'SUCCESS';
    let stopReason = 'Objective satisfied within budget';
    let qualityScore = 95;

    try {
      const estimatedCost = (profile.estimatedContextTokens / 1_000_000) * 2.0;
      const reservation = governor.reserveBudget(estimatedCost);
      if (!reservation.success) {
        governor.shrinkPlan('Budget reservation rejected; falling back to cheap solo.');
      }

      if (this.config.soloFirst && profile.complexity <= 6) {
        const result = await this.soloExecutor.execute(prompt, profile, governor);
        finalOutput = result.output;
      } else if (profile.recommendedMode === 'parallel' && profile.parallelizable && killSwitchManager.isEnabled('parallelism')) {
        const result = await this.parallelExecutor.execute(prompt, profile, governor);
        finalOutput = result.output;
      } else if (profile.recommendedMode === 'supervisor' && profile.complexity >= 8 && killSwitchManager.isEnabled('supervisor')) {
        const supRoi = qualityVsCostEngine.evaluateAgentSpawn('architect', 'Supervisor Multi-Agent Plan', profile, governor);
        if (supRoi.shouldSpawn) {
          const result = await this.supervisorExecutor.execute(prompt, profile, governor);
          finalOutput = result.output;
        } else {
          governor.shrinkPlan('Multi-agent ROI below threshold; executing via Solo.');
          const result = await this.soloExecutor.execute(prompt, profile, governor);
          finalOutput = result.output;
        }
      } else if (profile.recommendedMode === 'pipeline') {
        const result = await this.pipelineExecutor.execute(prompt, profile, governor);
        finalOutput = result.output;
      } else {
        const result = await this.soloExecutor.execute(prompt, profile, governor);
        finalOutput = result.output;
      }

      if (reservation.success) {
        governor.commitReservation(estimatedCost, governor.estimatedCostUsd);
      }

      canaryController.recordCanaryOutcome(true, qualityScore, governor.estimatedCostUsd, true);
    } catch (err: any) {
      try {
        const emergencyResp = await this.fallbackEngine.executeRequest({
          prompt,
          forceModel: 'openrouter/free'
        });
        finalOutput = emergencyResp.content;
        finalStatus = 'FALLBACK_COMPLETED';
        stopReason = `Harness mode failed (${err.message}); safely resolved via direct fallback tier.`;
        qualityScore = 85;
      } catch (fatalErr: any) {
        finalOutput = `Execution error: ${fatalErr.message}`;
        finalStatus = 'FAILED';
        stopReason = fatalErr.message;
        qualityScore = 0;
      }
    }

    const telemetry = this.telemetry.recordExecution(
      profile,
      governor,
      finalStatus,
      stopReason,
      safetyMode,
      undefined,
      undefined,
      qualityScore,
      'HIGH',
      this.config.policyVersion,
      true
    );
    telemetry.executionId = executionId;
    telemetry.cohortId = activeCohortId;

    return {
      output: finalOutput,
      telemetry,
      taskProfile: profile,
      success: finalStatus === 'SUCCESS' || finalStatus === 'FALLBACK_COMPLETED',
      safetyMode
    };
  }

  public getDiagnostics(taskId?: string) {
    const history = this.telemetry.getTelemetryHistory();
    const entry = taskId ? history.find(h => h.taskId === taskId) : history[history.length - 1];

    if (!entry) {
      return { status: 'NO_DIAGNOSTICS_AVAILABLE' };
    }

    return {
      executionId: entry.executionId,
      taskId: entry.taskId,
      safetyMode: entry.safetyMode,
      cohortId: entry.cohortId,
      policyVersion: entry.policyVersion,
      whyModeChosen: `Mode [${entry.mode}] chosen due to complexity score ${entry.complexity}/10 and category [${entry.category}].`,
      whyModelSelected: `Model tier(s) [${entry.modelTiersUsed.join(', ')}] selected. Models: ${entry.modelsInvoked.join(', ')}.`,
      agentsSpawnedCount: entry.agentsSpawned,
      spawnDecisions: entry.spawnDecisions,
      escalationReasons: entry.escalationReasons,
      budgetState: entry.finalBudgetState,
      totalTokens: entry.totalTokens,
      estimatedCostUsd: entry.estimatedCostUsd,
      actualCostUsd: entry.actualCostUsd,
      unknownCostUsd: entry.unknownCostUsd,
      costSource: entry.costSource,
      qualityScore: entry.qualityScore,
      qualityConfidence: entry.qualityConfidence,
      stopReason: entry.stopReason
    };
  }

  public getTelemetryHistory() {
    return this.telemetry.getTelemetryHistory();
  }

  public getSummaryMetrics() {
    return this.telemetry.getSummaryMetrics();
  }
}

export const antigravityHarness = new AntigravityHarness();
