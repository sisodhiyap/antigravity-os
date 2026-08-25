/**
 * Antigravity Production-Grade Adaptive Harness - Mode D: SUPERVISOR
 * For complex multi-faceted tasks. Spawns specialists iteratively with ROI evaluation.
 * Shrinks plan dynamically if initial specialist solves the objective.
 */

import { TaskProfile, StructuredHandoff, AgentRole } from '../types.js';
import { CreditGovernor } from '../credit-governor.js';
import { ModelRouter } from '../model-router.js';
import { FallbackEngine } from '../../router/fallback-engine.js';
import { ModeExecutionResult } from './solo-mode.js';
import { contextOptimizer } from '../context-optimizer.js';
import { structuredHandoffManager } from '../structured-handoff.js';
import { qualityVsCostEngine } from '../quality-vs-cost.js';

export class SupervisorModeExecutor {
  constructor(
    private fallbackEngine: FallbackEngine,
    private modelRouter: ModelRouter
  ) {}

  public async execute(
    prompt: string,
    profile: TaskProfile,
    governor: CreditGovernor
  ): Promise<ModeExecutionResult> {
    // 1. Supervisor Agent decomposes task
    governor.recordAgentSpawn('orchestrator', 'Primary Task Supervisor');
    const supervisorRouting = this.modelRouter.route(profile, governor);

    const supervisorContext = contextOptimizer.buildAgentContext({
      task: prompt,
      objective: 'Decompose complex task into minimum necessary specialist assignments.'
    });

    const supPrompt = contextOptimizer.formatPrompt(supervisorContext);
    const supResp = await this.fallbackEngine.executeRequest({
      prompt: supPrompt,
      forceModel: supervisorRouting.primaryModel
    });

    governor.recordTokenUsage(
      supervisorRouting.tier,
      supResp.selectedModel,
      Math.ceil(supPrompt.length / 3.8),
      Math.ceil(supResp.content.length / 3.8)
    );

    const specialistHandoffs: StructuredHandoff[] = [];
    const candidateRoles: AgentRole[] = ['architect', 'builder'];

    // 2. Iterative Specialist Spawning with ROI Gate
    for (const role of candidateRoles) {
      // Recalculate remaining budget state before each specialist
      if (governor.getBudgetState() === 'ORANGE' || governor.getBudgetState() === 'RED') {
        governor.shrinkPlan(`Budget state ${governor.getBudgetState()} reached; cancelling remaining specialists.`);
        break;
      }

      const evalResult = qualityVsCostEngine.evaluateAgentSpawn(
        role,
        `Specialist ${role} subtask`,
        profile,
        governor
      );

      if (!evalResult.shouldSpawn) {
        continue;
      }

      governor.recordAgentSpawn(role, evalResult.decision.reason.explanation, evalResult.decision);

      const specialistContext = contextOptimizer.buildAgentContext({
        task: prompt,
        objective: `Specialist (${role}): Execute designated domain solution.`,
        structuredHandoffs: specialistHandoffs
      });

      const specPrompt = contextOptimizer.formatPrompt(specialistContext);
      const specRouting = this.modelRouter.route(profile, governor);

      const specResp = await this.fallbackEngine.executeRequest({
        prompt: specPrompt,
        forceModel: specRouting.primaryModel
      });

      governor.recordTokenUsage(
        specRouting.tier,
        specResp.selectedModel,
        Math.ceil(specPrompt.length / 3.8),
        Math.ceil(specResp.content.length / 3.8)
      );

      const specHandoff = structuredHandoffManager.createHandoff(role, `${role} specialized output`, specResp.content);
      specialistHandoffs.push(specHandoff);

      // Dynamic Plan Shrinking: If builder already produced complete code, skip further specialists
      if (role === 'builder' && specResp.content.length > 500) {
        governor.shrinkPlan('Primary implementation complete; additional specialist unnecessary.');
        break;
      }
    }

    // 3. Supervisor synthesizes final result
    const finalContext = contextOptimizer.buildAgentContext({
      task: prompt,
      objective: 'Produce comprehensive unified output based on specialist findings.',
      structuredHandoffs: specialistHandoffs.length > 0 ? specialistHandoffs : [structuredHandoffManager.createHandoff('orchestrator', 'Supervisor Plan', supResp.content)]
    });

    const finalPrompt = contextOptimizer.formatPrompt(finalContext);
    const finalResp = await this.fallbackEngine.executeRequest({
      prompt: finalPrompt,
      forceModel: supervisorRouting.primaryModel
    });

    governor.recordTokenUsage(
      supervisorRouting.tier,
      finalResp.selectedModel,
      Math.ceil(finalPrompt.length / 3.8),
      Math.ceil(finalResp.content.length / 3.8)
    );

    const finalHandoff = structuredHandoffManager.createHandoff('orchestrator', 'Final Supervisor Output', finalResp.content);

    return {
      output: finalResp.content,
      handoff: finalHandoff,
      success: true,
      modelUsed: finalResp.selectedModel,
      tokensUsed: governor.contextTokensUsed + governor.completionTokensUsed
    };
  }
}
