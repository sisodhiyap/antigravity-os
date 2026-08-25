/**
 * Antigravity Production-Grade Adaptive Harness - Phase 3 Configuration
 */

import { HarnessConfig } from './types.js';

export const defaultHarnessConfig: HarnessConfig = {
  enabled: true,
  safetyMode: 'shadow', // Default remains SHADOW mode
  canaryPercentage: 0,  // Default canary rollout is 0% until operator approval
  soloFirst: true,
  policyVersion: 'phase3-v3.0',
  maxAgents: 4,
  maxSpawnDepth: 2,
  maxRetries: 1,
  maxReviewRounds: 1,
  killSwitches: {
    harness: true,
    parallelism: true,
    supervisor: true,
    premiumEscalation: true,
    automaticRetry: true,
    toolCaching: true,
    contextCompression: true,
    adaptiveRouting: true
  },
  roi: {
    minimumSpawnRoi: 1.5,
    minimumReviewRoi: 1.2
  },
  budgets: {
    simple: {
      maxAgents: 1,
      maxIterations: 2,
      maxRetries: 1,
      maxReviewRounds: 0,
      maxToolCalls: 4,
      maxContextTokens: 16000,
      maxEstimatedCostUsd: 0.005
    },
    medium: {
      maxAgents: 2,
      maxIterations: 2,
      maxRetries: 1,
      maxReviewRounds: 1,
      maxToolCalls: 10,
      maxContextTokens: 45000,
      maxEstimatedCostUsd: 0.025
    },
    complex: {
      maxAgents: 3,
      maxIterations: 3,
      maxRetries: 1,
      maxReviewRounds: 1,
      maxToolCalls: 20,
      maxContextTokens: 90000,
      maxEstimatedCostUsd: 0.075
    },
    critical: {
      maxAgents: 4,
      maxIterations: 3,
      maxRetries: 1,
      maxReviewRounds: 1,
      maxToolCalls: 30,
      maxContextTokens: 150000,
      maxEstimatedCostUsd: 0.20
    }
  },
  escalation: {
    premiumEnabled: true,
    requireHighValue: true,
    premiumComplexityThreshold: 8,
    maxFailuresBeforeEscalate: 1
  },
  context: {
    progressiveDisclosure: true,
    structuredHandoffs: true,
    maxContextTokens: 30000,
    enableContextCompression: true
  },
  review: {
    low: false,
    medium: 'targeted',
    high: true,
    critical: true,
    maxReviewRounds: 1
  },
  toolCaching: {
    enabled: true,
    ttlMs: 60000
  }
};
