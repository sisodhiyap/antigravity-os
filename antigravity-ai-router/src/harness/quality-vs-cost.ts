/**
 * Antigravity Production-Grade Adaptive Harness - Real Agent ROI Engine
 * Calculates: expected_additional_value > expected_additional_cost (ROI > Threshold)
 * Strictly defaults to Solo. Only spawns an additional agent when measurable ROI justifies it.
 */

import { TaskProfile, AgentRole, SpawnDecision, TaskRisk } from './types.js';
import { CreditGovernor } from './credit-governor.js';
import { modelRegistry } from './model-registry.js';

export interface RoiEvaluationResult {
  shouldSpawn: boolean;
  decision: SpawnDecision;
}

export class QualityVsCostEngine {
  private minSpawnRoiThreshold = 1.5; // Minimum ROI required to spawn an agent

  public evaluateAgentSpawn(
    role: AgentRole,
    taskDescription: string,
    profile: TaskProfile,
    governor: CreditGovernor
  ): RoiEvaluationResult {
    const budgetBefore = governor.getBudgetState();

    // 1. Hard budget state gates
    if (budgetBefore === 'ORANGE' || budgetBefore === 'RED') {
      const decision: SpawnDecision = {
        spawned: false,
        role,
        reason: {
          risk: profile.risk,
          expectedFailureCost: 0.05,
          expectedDetectionValue: 0.01,
          estimatedCost: 0.04,
          roi: 0.25,
          explanation: `Budget state is ${budgetBefore}. Aggressive conservation strictly prohibits spawning additional agents.`
        },
        parentTask: taskDescription,
        budgetBefore,
        budgetAfter: budgetBefore,
        timestamp: Date.now()
      };
      return { shouldSpawn: false, decision };
    }

    // 2. Failure Cost Modeling based on task risk
    const riskMultiplier: Record<TaskRisk, number> = {
      low: 0.02,
      medium: 0.10,
      high: 0.35,
      critical: 1.00
    };

    const impactOfFailure = profile.complexity >= 8 ? 0.8 : profile.complexity >= 5 ? 0.4 : 0.15;
    const failureCost = riskMultiplier[profile.risk] * impactOfFailure;

    // 3. Probability agent catches failure / adds measurable value
    let detectionProbability = 0.20; // baseline
    if (role === 'security' && profile.risk === 'critical') detectionProbability = 0.85;
    else if (role === 'reviewer' && (profile.risk === 'high' || profile.risk === 'critical')) detectionProbability = 0.70;
    else if (role === 'architect' && profile.complexity >= 8) detectionProbability = 0.75;
    else if (role === 'builder' && governor.retriesCount > 0) detectionProbability = 0.60;
    else if (role === 'researcher' && profile.uncertainty === 'high') detectionProbability = 0.50;

    const expectedValue = detectionProbability * failureCost;

    // 4. Estimated Cost of Spawning the Agent
    const cheapModel = modelRegistry.resolveModelForTier('cheap', 'coding').primary;
    const estimatedTokens = Math.max(1000, profile.estimatedContextTokens / 2);
    const modelCallCost = modelRegistry.calculateModelCost(cheapModel.id, estimatedTokens * 0.7, estimatedTokens * 0.3);
    const toolCost = profile.expectedToolCalls * 0.002;
    const latencyPenalty = 0.005; // 5ms computational overhead weight

    // Diminishing returns penalty if multiple agents already spawned
    const multiAgentPenalty = governor.agentsSpawned * 0.02;

    const estimatedCost = modelCallCost + toolCost + latencyPenalty + multiAgentPenalty;

    // 5. ROI Computation
    const roi = estimatedCost > 0 ? expectedValue / estimatedCost : 0;
    const shouldSpawn = roi >= this.minSpawnRoiThreshold && governor.canSpawnAgent(role, taskDescription).allowed;

    const explanation = shouldSpawn
      ? `ROI of ${roi.toFixed(2)}x exceeds threshold (${this.minSpawnRoiThreshold}x). Spawning ${role} is economically justified.`
      : `ROI of ${roi.toFixed(2)}x is below threshold (${this.minSpawnRoiThreshold}x). Solo or existing agents suffice.`;

    const decision: SpawnDecision = {
      spawned: shouldSpawn,
      role,
      reason: {
        risk: profile.risk,
        expectedFailureCost: Math.round(failureCost * 1000) / 1000,
        expectedDetectionValue: Math.round(expectedValue * 1000) / 1000,
        estimatedCost: Math.round(estimatedCost * 1000) / 1000,
        roi: Math.round(roi * 100) / 100,
        explanation
      },
      parentTask: taskDescription,
      budgetBefore,
      budgetAfter: governor.getBudgetState(),
      timestamp: Date.now()
    };

    return { shouldSpawn, decision };
  }
}

export const qualityVsCostEngine = new QualityVsCostEngine();
