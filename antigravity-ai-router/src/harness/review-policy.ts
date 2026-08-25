/**
 * Antigravity Optimized Harness - Review Policy Engine
 * Risk-based reviews with hard cap of 1 round. Never review low-risk tasks.
 */

import { TaskProfile, ReviewDecision } from './types.js';
import { CreditGovernor } from './credit-governor.js';

export class ReviewPolicyManager {
  public evaluateReviewNeed(profile: TaskProfile, governor: CreditGovernor): ReviewDecision {
    const budgetState = governor.getBudgetState();

    // Budget state constraints: ORANGE/RED strictly disable optional reviews
    if (budgetState === 'ORANGE' || budgetState === 'RED') {
      return {
        requiresReview: false,
        reviewType: 'none',
        targetAspects: [],
        maxRounds: 0
      };
    }

    if (profile.risk === 'low' && profile.complexity <= 5) {
      return {
        requiresReview: false,
        reviewType: 'none',
        targetAspects: [],
        maxRounds: 0
      };
    }

    if (profile.risk === 'critical') {
      return {
        requiresReview: true,
        reviewType: 'final_judge',
        targetAspects: ['security', 'correctness', 'data-integrity'],
        maxRounds: 1
      };
    }

    if (profile.risk === 'high' || profile.complexity >= 7) {
      return {
        requiresReview: true,
        reviewType: 'targeted',
        targetAspects: ['syntax', 'edge-cases', 'type-safety'],
        maxRounds: 1
      };
    }

    if (profile.risk === 'medium' && governor.reviewRoundsCount === 0) {
      return {
        requiresReview: true,
        reviewType: 'targeted',
        targetAspects: ['verification'],
        maxRounds: 1
      };
    }

    return {
      requiresReview: false,
      reviewType: 'none',
      targetAspects: [],
      maxRounds: 0
    };
  }
}

export const reviewPolicyManager = new ReviewPolicyManager();
