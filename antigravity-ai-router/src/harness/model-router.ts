/**
 * Antigravity Production-Grade Adaptive Harness - Model Router
 * Dynamic logical tier routing decoupled from hard-coded vendor strings.
 * Resolves through ModelCapabilityRegistry. Premium escalation is gated strictly by ROI.
 */

import { TaskProfile, ModelTier } from './types.js';
import { CreditGovernor } from './credit-governor.js';
import { modelRegistry, ModelMetadata } from './model-registry.js';

export interface ModelRoutingDecision {
  tier: ModelTier;
  primaryModel: string;
  fallbackModels: string[];
  primaryMetadata: ModelMetadata;
  escalationReason?: string;
  isEscalated: boolean;
}

export class ModelRouter {
  public route(profile: TaskProfile, governor: CreditGovernor, forceTier?: ModelTier): ModelRoutingDecision {
    const budgetState = governor.getBudgetState();

    // Budget state constraints: ORANGE/RED strictly forbid premium tier
    if (budgetState === 'ORANGE' || budgetState === 'RED') {
      const resolved = modelRegistry.resolveModelForTier('cheap', 'coding');
      return {
        tier: 'cheap',
        primaryModel: resolved.primary.id,
        fallbackModels: resolved.fallbacks.map(m => m.id),
        primaryMetadata: resolved.primary,
        escalationReason: `Forced to cheap tier due to budget state ${budgetState}`,
        isEscalated: false
      };
    }

    if (forceTier) {
      const resolved = modelRegistry.resolveModelForTier(forceTier, 'coding');
      return {
        tier: forceTier,
        primaryModel: resolved.primary.id,
        fallbackModels: resolved.fallbacks.map(m => m.id),
        primaryMetadata: resolved.primary,
        escalationReason: `Explicit tier override: ${forceTier}`,
        isEscalated: forceTier === 'premium'
      };
    }

    // Phase 18: Gated Premium Escalation Rules
    const isCriticalRisk = profile.risk === 'critical';
    const isVeryHighReasoning = profile.complexity >= 8 && profile.requiresDeepReasoning;
    const isRepeatedFailure = governor.retriesCount > 0 && profile.complexity >= 6;

    if (isVeryHighReasoning || isCriticalRisk || isRepeatedFailure) {
      // Check if expected premium value justifies the higher cost
      const premiumResolved = modelRegistry.resolveModelForTier('premium', 'reasoning');
      const cheapResolved = modelRegistry.resolveModelForTier('cheap', 'coding');

      const estimatedTokens = profile.estimatedContextTokens;
      const premiumCost = modelRegistry.calculateModelCost(premiumResolved.primary.id, estimatedTokens * 0.7, estimatedTokens * 0.3);
      const cheapCost = modelRegistry.calculateModelCost(cheapResolved.primary.id, estimatedTokens * 0.7, estimatedTokens * 0.3);

      const additionalCost = premiumCost - cheapCost;
      const failureRiskValue = isCriticalRisk ? 0.35 : 0.15;

      if (failureRiskValue > additionalCost) {
        const reason = isVeryHighReasoning
          ? `High complexity (${profile.complexity}) + deep reasoning requirements justify premium model.`
          : isCriticalRisk
          ? 'Critical security/production risk justifies premium architectural precision.'
          : 'Repeated failure on standard tier justifies single premium escalation.';

        governor.escalationReasons.push(reason);
        return {
          tier: 'premium',
          primaryModel: premiumResolved.primary.id,
          fallbackModels: premiumResolved.fallbacks.map(m => m.id),
          primaryMetadata: premiumResolved.primary,
          escalationReason: reason,
          isEscalated: true
        };
      }
    }

    // Standard Tier Condition: Medium complexity (4 - 7) or medium/high risk
    if (profile.complexity >= 4 || profile.risk === 'medium' || profile.risk === 'high') {
      const resolved = modelRegistry.resolveModelForTier('standard', 'coding');
      return {
        tier: 'standard',
        primaryModel: resolved.primary.id,
        fallbackModels: resolved.fallbacks.map(m => m.id),
        primaryMetadata: resolved.primary,
        escalationReason: 'Standard tier for moderate reasoning & implementation.',
        isEscalated: false
      };
    }

    // Cheap Tier: Default (0 - 3 complexity)
    const cheapResolved = modelRegistry.resolveModelForTier('cheap', 'coding');
    return {
      tier: 'cheap',
      primaryModel: cheapResolved.primary.id,
      fallbackModels: cheapResolved.fallbacks.map(m => m.id),
      primaryMetadata: cheapResolved.primary,
      escalationReason: 'Default cheap tier for fast, cost-optimal generation.',
      isEscalated: false
    };
  }
}

export const modelRouter = new ModelRouter();
