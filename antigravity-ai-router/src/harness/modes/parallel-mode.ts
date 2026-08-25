/**
 * Antigravity Optimized Harness - Mode C: PARALLEL
 * Spawns multiple workers ONLY for genuinely independent subtasks.
 * Max 3 workers + 1 synthesis. Structured summary extraction.
 */

import { TaskProfile, StructuredHandoff } from '../types.js';
import { CreditGovernor } from '../credit-governor.js';
import { ModelRouter } from '../model-router.js';
import { FallbackEngine } from '../../router/fallback-engine.js';
import { ModeExecutionResult } from './solo-mode.js';
import { contextOptimizer } from '../context-optimizer.js';
import { structuredHandoffManager } from '../structured-handoff.js';

export class ParallelModeExecutor {
  constructor(
    private fallbackEngine: FallbackEngine,
    private modelRouter: ModelRouter
  ) {}

  public async execute(
    prompt: string,
    profile: TaskProfile,
    governor: CreditGovernor
  ): Promise<ModeExecutionResult> {
    // Partition task into max 2-3 independent branches
    const branches = ['Analysis & Research Branch', 'Implementation Strategy Branch'];
    const branchResults: StructuredHandoff[] = [];

    const routing = this.modelRouter.route(profile, governor);

    for (let i = 0; i < branches.length; i++) {
      const branchName = branches[i];
      const check = governor.canSpawnAgent('researcher', `Parallel worker: ${branchName}`);
      if (!check.allowed) break;

      governor.recordAgentSpawn('researcher', `Parallel worker: ${branchName}`);

      const context = contextOptimizer.buildAgentContext({
        task: prompt,
        objective: `Focus independently on: ${branchName}`
      });

      const promptStr = contextOptimizer.formatPrompt(context);
      const resp = await this.fallbackEngine.executeRequest({
        prompt: promptStr,
        forceModel: routing.primaryModel
      });

      governor.recordTokenUsage(
        routing.tier,
        resp.selectedModel,
        Math.ceil(promptStr.length / 3.8),
        Math.ceil(resp.content.length / 3.8)
      );

      const handoff = structuredHandoffManager.createHandoff('researcher', branchName, resp.content);
      branchResults.push(handoff);
    }

    // Synthesis Step (1 agent)
    governor.recordAgentSpawn('orchestrator', 'Parallel Synthesis Agent');
    const synthesisContext = contextOptimizer.buildAgentContext({
      task: prompt,
      objective: 'Synthesize findings from all parallel research branches into a single authoritative result.',
      structuredHandoffs: branchResults
    });

    const synthesisPrompt = contextOptimizer.formatPrompt(synthesisContext);
    const synthesisResp = await this.fallbackEngine.executeRequest({
      prompt: synthesisPrompt,
      forceModel: routing.primaryModel
    });

    governor.recordTokenUsage(
      routing.tier,
      synthesisResp.selectedModel,
      Math.ceil(synthesisPrompt.length / 3.8),
      Math.ceil(synthesisResp.content.length / 3.8)
    );

    const finalHandoff = structuredHandoffManager.createHandoff('orchestrator', 'Final Synthesis', synthesisResp.content);

    return {
      output: synthesisResp.content,
      handoff: finalHandoff,
      success: true,
      modelUsed: synthesisResp.selectedModel,
      tokensUsed: governor.contextTokensUsed + governor.completionTokensUsed
    };
  }
}
