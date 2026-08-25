/**
 * Antigravity Production-Grade Adaptive Harness - Mode A: SOLO
 * Default execution mode. 1 agent, cheap/standard model, zero unnecessary overhead.
 */

import { TaskProfile, AgentContext, StructuredHandoff } from '../types.js';
import { CreditGovernor } from '../credit-governor.js';
import { ModelRouter } from '../model-router.js';
import { FallbackEngine } from '../../router/fallback-engine.js';
import { contextOptimizer } from '../context-optimizer.js';
import { structuredHandoffManager } from '../structured-handoff.js';
import { retryIntelligence } from '../retry-intelligence.js';

export interface ModeExecutionResult {
  output: string;
  handoff: StructuredHandoff;
  success: boolean;
  modelUsed: string;
  tokensUsed: number;
}

export class SoloModeExecutor {
  constructor(
    private fallbackEngine: FallbackEngine,
    private modelRouter: ModelRouter
  ) {}

  public async execute(
    prompt: string,
    profile: TaskProfile,
    governor: CreditGovernor
  ): Promise<ModeExecutionResult> {
    governor.recordAgentSpawn('builder', 'Primary Solo Agent');

    const routing = this.modelRouter.route(profile, governor);
    const agentContext: AgentContext = contextOptimizer.buildAgentContext({
      task: prompt,
      objective: 'Fulfill user coding request concisely and accurately in a single pass.',
      constraints: ['Focus directly on output', 'Do not emit unnecessary fluff']
    });

    const formattedPrompt = contextOptimizer.formatPrompt(agentContext);

    let attempts = 0;
    const maxAttempts = 1 + governor.getBudget().maxRetries;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const response = await this.fallbackEngine.executeRequest({
          prompt: formattedPrompt,
          forceModel: routing.primaryModel
        });

        governor.recordTokenUsage(
          routing.tier,
          response.selectedModel,
          Math.ceil(formattedPrompt.length / 3.8),
          Math.ceil(response.content.length / 3.8)
        );

        const handoff = structuredHandoffManager.createHandoff(
          'builder',
          prompt.slice(0, 100),
          response.content
        );

        return {
          output: response.content,
          handoff,
          success: true,
          modelUsed: response.selectedModel,
          tokensUsed: Math.ceil((formattedPrompt.length + response.content.length) / 3.8)
        };
      } catch (err: any) {
        const failure = retryIntelligence.classifyFailure(err, governor);
        if (!failure.retryAllowed || !governor.recordRetry(failure.reason)) {
          throw err;
        }
      }
    }

    throw new Error('Solo mode execution failed after bounded retries.');
  }
}
