/**
 * Antigravity Optimized Harness - Mode B: PIPELINE
 * Sequential execution of dependent stages (e.g. Architect -> Builder -> Targeted Reviewer)
 * Strict handoffs between stages; no parallelization of dependent steps.
 */

import { TaskProfile, StructuredHandoff } from '../types.js';
import { CreditGovernor } from '../credit-governor.js';
import { ModelRouter } from '../model-router.js';
import { FallbackEngine } from '../../router/fallback-engine.js';
import { ModeExecutionResult } from './solo-mode.js';
import { contextOptimizer } from '../context-optimizer.js';
import { structuredHandoffManager } from '../structured-handoff.js';
import { reviewPolicyManager } from '../review-policy.js';

export class PipelineModeExecutor {
  constructor(
    private fallbackEngine: FallbackEngine,
    private modelRouter: ModelRouter
  ) {}

  public async execute(
    prompt: string,
    profile: TaskProfile,
    governor: CreditGovernor
  ): Promise<ModeExecutionResult> {
    const handoffs: StructuredHandoff[] = [];

    // Stage 1: Builder (or Architect if complexity >= 7)
    const initialRole = profile.complexity >= 7 ? 'architect' : 'builder';
    governor.recordAgentSpawn(initialRole, 'Stage 1 Pipeline Execution');

    const routing1 = this.modelRouter.route(profile, governor);
    const context1 = contextOptimizer.buildAgentContext({
      task: prompt,
      objective: `Execute Stage 1 (${initialRole}): Synthesize core implementation/architecture.`
    });

    const prompt1 = contextOptimizer.formatPrompt(context1);
    const resp1 = await this.fallbackEngine.executeRequest({
      prompt: prompt1,
      forceModel: routing1.primaryModel
    });

    governor.recordTokenUsage(
      routing1.tier,
      resp1.selectedModel,
      Math.ceil(prompt1.length / 3.8),
      Math.ceil(resp1.content.length / 3.8)
    );

    const handoff1 = structuredHandoffManager.createHandoff(initialRole, prompt.slice(0, 80), resp1.content);
    handoffs.push(handoff1);

    let finalOutput = resp1.content;
    let finalModel = resp1.selectedModel;

    // Stage 2: Targeted Review (if justified by ReviewPolicy)
    const reviewDecision = reviewPolicyManager.evaluateReviewNeed(profile, governor);

    if (reviewDecision.requiresReview && governor.canReview()) {
      governor.recordAgentSpawn('reviewer', `Stage 2 Review (${reviewDecision.reviewType})`);
      governor.recordReviewRound();

      const context2 = contextOptimizer.buildAgentContext({
        task: prompt,
        objective: `Targeted review of Stage 1 output on: ${reviewDecision.targetAspects.join(', ')}`,
        structuredHandoffs: handoffs
      });

      const prompt2 = `${contextOptimizer.formatPrompt(context2)}\n\nCONTENT TO REVIEW:\n${resp1.content}\n\nProvide verified output or confirm compliance.`;
      
      const routing2 = this.modelRouter.route({ ...profile, complexity: Math.max(1, profile.complexity - 2) }, governor);
      const resp2 = await this.fallbackEngine.executeRequest({
        prompt: prompt2,
        forceModel: routing2.primaryModel
      });

      governor.recordTokenUsage(
        routing2.tier,
        resp2.selectedModel,
        Math.ceil(prompt2.length / 3.8),
        Math.ceil(resp2.content.length / 3.8)
      );

      finalOutput = resp2.content;
      finalModel = resp2.selectedModel;

      const handoff2 = structuredHandoffManager.createHandoff('reviewer', 'Stage 2 Validation', resp2.content);
      handoffs.push(handoff2);
    }

    return {
      output: finalOutput,
      handoff: handoffs[handoffs.length - 1],
      success: true,
      modelUsed: finalModel,
      tokensUsed: governor.contextTokensUsed + governor.completionTokensUsed
    };
  }
}
