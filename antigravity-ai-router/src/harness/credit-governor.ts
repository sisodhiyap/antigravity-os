/**
 * Antigravity Production-Grade Adaptive Harness - Credit Governor V4
 * Concurrency-safe Budget Invariant Protection (reserved + committed + available = total)
 * and multi-worker stress safety.
 */

import { TaskBudget, TaskProfile, BudgetState, ModelTier, AgentRole, SpawnDecision, CostSource, BudgetInvariantAudit } from './types.js';
import { modelRegistry } from './model-registry.js';

export class CreditGovernor {
  private budget: TaskBudget;
  private profile: TaskProfile;

  // Tracked operational metrics
  public agentsSpawned = 0;
  public agentRolesUsed: Set<AgentRole> = new Set();
  public modelTiersUsed: Set<ModelTier> = new Set();
  public modelsInvoked: string[] = [];
  public modelCallsCount = 0;
  public toolCallsCount = 0;
  public toolCallsDeduplicated = 0;
  public searchCallsCount = 0;
  public retriesCount = 0;
  public reviewRoundsCount = 0;
  public contextTokensUsed = 0;
  public completionTokensUsed = 0;
  public estimatedCostUsd = 0;
  public actualCostUsd?: number;
  public unknownCostUsd = 0;
  public costSource: CostSource = 'estimated';
  public startTime = Date.now();
  public escalationReasons: string[] = [];
  public spawnDecisions: SpawnDecision[] = [];
  public stopReason: string = '';

  // Concurrency-Safe Budget Reservation
  private reservedCostUsd = 0;
  private activeReservations = 0;

  constructor(profile: TaskProfile, customBudget?: Partial<TaskBudget>) {
    this.profile = profile;
    this.budget = this.deriveAdaptiveBudget(profile, customBudget);
  }

  private deriveAdaptiveBudget(profile: TaskProfile, customBudget?: Partial<TaskBudget>): TaskBudget {
    let base: TaskBudget;

    if (profile.complexity <= 3) {
      base = {
        maxAgents: 1,
        maxIterations: 2,
        maxRetries: 1,
        maxReviewRounds: 0,
        maxToolCalls: 4,
        maxContextTokens: 16000,
        maxEstimatedCostUsd: 0.005
      };
    } else if (profile.complexity <= 6) {
      base = {
        maxAgents: 2,
        maxIterations: 2,
        maxRetries: 1,
        maxReviewRounds: 1,
        maxToolCalls: 10,
        maxContextTokens: 45000,
        maxEstimatedCostUsd: 0.025
      };
    } else if (profile.complexity <= 8) {
      base = {
        maxAgents: 3,
        maxIterations: 3,
        maxRetries: 1,
        maxReviewRounds: 1,
        maxToolCalls: 20,
        maxContextTokens: 90000,
        maxEstimatedCostUsd: 0.075
      };
    } else {
      base = {
        maxAgents: 4,
        maxIterations: 3,
        maxRetries: 1,
        maxReviewRounds: 1,
        maxToolCalls: 30,
        maxContextTokens: 150000,
        maxEstimatedCostUsd: 0.20
      };
    }

    if (customBudget) {
      return { ...base, ...customBudget };
    }
    return base;
  }

  public getBudget(): Readonly<TaskBudget> {
    return this.budget;
  }

  public getBudgetState(): BudgetState {
    const totalTokens = this.contextTokensUsed + this.completionTokensUsed;
    const tokenRatio = totalTokens / this.budget.maxContextTokens;
    const agentRatio = this.agentsSpawned / Math.max(1, this.budget.maxAgents);
    const toolRatio = this.toolCallsCount / Math.max(1, this.budget.maxToolCalls);
    const totalCommittedAndReserved = this.estimatedCostUsd + this.reservedCostUsd;
    const costRatio = totalCommittedAndReserved / Math.max(0.001, this.budget.maxEstimatedCostUsd);

    const maxRatio = Math.max(tokenRatio, agentRatio, toolRatio, costRatio);

    if (maxRatio >= 0.95 || this.agentsSpawned >= this.budget.maxAgents || this.toolCallsCount >= this.budget.maxToolCalls) {
      return 'RED';
    }
    if (maxRatio >= 0.80) {
      return 'ORANGE';
    }
    if (maxRatio >= 0.60) {
      return 'YELLOW';
    }
    return 'GREEN';
  }

  /**
   * Step 14: Strict Budget Invariant Verification:
   * reserved_budget + committed_spend + available_budget = total_budget
   */
  public verifyBudgetInvariant(): BudgetInvariantAudit {
    const totalBudget = this.budget.maxEstimatedCostUsd;
    const committedSpend = this.estimatedCostUsd;
    const reservedBudget = this.reservedCostUsd;
    const availableBudget = Math.max(0, totalBudget - (committedSpend + reservedBudget));

    const sum = committedSpend + reservedBudget + availableBudget;
    const delta = Math.abs(sum - totalBudget);
    const valid = delta < 0.0001;

    return {
      valid,
      totalBudget,
      reservedBudget,
      committedSpend,
      availableBudget,
      delta
    };
  }

  public reserveBudget(proposedCostUsd: number): { success: boolean; reason: string } {
    const available = Math.max(0, this.budget.maxEstimatedCostUsd - (this.estimatedCostUsd + this.reservedCostUsd));

    if (proposedCostUsd > available) {
      return {
        success: false,
        reason: `Insufficient remaining available budget ($${available.toFixed(4)}) for proposed allocation ($${proposedCostUsd.toFixed(4)}).`
      };
    }

    this.reservedCostUsd += proposedCostUsd;
    this.activeReservations++;
    return { success: true, reason: 'Budget successfully reserved.' };
  }

  public commitReservation(reservedUsd: number, actualOrCalculatedCostUsd: number) {
    this.reservedCostUsd = Math.max(0, this.reservedCostUsd - reservedUsd);
    this.activeReservations = Math.max(0, this.activeReservations - 1);
    this.estimatedCostUsd += actualOrCalculatedCostUsd;
  }

  public releaseReservation(reservedUsd: number) {
    this.reservedCostUsd = Math.max(0, this.reservedCostUsd - reservedUsd);
    this.activeReservations = Math.max(0, this.activeReservations - 1);
  }

  public canSpawnAgent(role: AgentRole, reason: string): { allowed: boolean; reason: string } {
    const state = this.getBudgetState();

    if (state === 'RED') {
      return { allowed: false, reason: 'Budget State RED (>=95%): Hard stop. No further agent spawning permitted.' };
    }

    if (state === 'ORANGE') {
      return { allowed: false, reason: 'Budget State ORANGE (>=80%): Aggressive conservation prohibits new agents.' };
    }

    if (this.agentsSpawned >= this.budget.maxAgents) {
      return {
        allowed: false,
        reason: `Max agents limit (${this.budget.maxAgents}) reached for complexity tier ${this.profile.complexity}.`
      };
    }

    return { allowed: true, reason: `Agent permitted under budget state ${state}. Reason: ${reason}` };
  }

  public recordAgentSpawn(role: AgentRole, reason: string, decision?: SpawnDecision) {
    this.agentsSpawned++;
    this.agentRolesUsed.add(role);
    this.escalationReasons.push(`Spawned ${role}: ${reason}`);
    if (decision) {
      this.spawnDecisions.push(decision);
    }
  }

  public canExecuteToolCall(toolName: string): { allowed: boolean; reason: string } {
    const state = this.getBudgetState();

    if (state === 'RED') {
      return { allowed: false, reason: 'Budget State RED: Only non-optional terminal operations permitted.' };
    }

    if (this.toolCallsCount >= this.budget.maxToolCalls) {
      return { allowed: false, reason: `Tool call budget (${this.budget.maxToolCalls}) exhausted.` };
    }

    return { allowed: true, reason: `Tool call allowed under ${state}` };
  }

  public recordToolCall(toolName: string, deduplicated = false) {
    if (deduplicated) {
      this.toolCallsDeduplicated++;
    } else {
      this.toolCallsCount++;
      if (toolName.includes('search') || toolName.includes('web')) {
        this.searchCallsCount++;
      }
    }
  }

  public canReview(): boolean {
    const state = this.getBudgetState();
    if (state === 'YELLOW' || state === 'ORANGE' || state === 'RED') return false;
    return this.reviewRoundsCount < this.budget.maxReviewRounds;
  }

  public recordReviewRound() {
    this.reviewRoundsCount++;
  }

  public recordTokenUsage(tier: ModelTier, modelId: string, promptTokens: number, completionTokens: number, actualReportedCostUsd?: number) {
    this.modelTiersUsed.add(tier);
    this.modelsInvoked.push(modelId);
    this.modelCallsCount++;
    this.contextTokensUsed += promptTokens;
    this.completionTokensUsed += completionTokens;

    if (actualReportedCostUsd !== undefined) {
      this.actualCostUsd = (this.actualCostUsd || 0) + actualReportedCostUsd;
      this.costSource = 'actual';
      this.estimatedCostUsd += actualReportedCostUsd;
    } else {
      const callCost = modelRegistry.calculateModelCost(modelId, promptTokens, completionTokens);
      this.estimatedCostUsd += callCost;
      if (this.costSource !== 'actual') {
        this.costSource = 'estimated';
      }
    }
  }

  public recordRetry(reason: string): boolean {
    if (this.retriesCount >= this.budget.maxRetries) {
      return false;
    }
    this.retriesCount++;
    this.escalationReasons.push(`Retry ${this.retriesCount}: ${reason}`);
    return true;
  }

  public shrinkPlan(reason: string) {
    this.budget.maxAgents = Math.min(this.budget.maxAgents, Math.max(1, this.agentsSpawned));
    this.budget.maxReviewRounds = 0;
    this.escalationReasons.push(`Plan shrunk: ${reason}`);
  }
}
