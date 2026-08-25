/**
 * Antigravity Production-Grade Adaptive Harness - Context Governor
 * Budgets context into strict compartments (system, task, files, memory, handoffs, tool_results, safety_margin).
 * Removes duplicates and safely compresses when estimated context exceeds budget.
 */

import { AgentContext, StructuredHandoff } from './types.js';

export interface ContextBudgetBreakdown {
  systemLimit: number;
  taskLimit: number;
  filesLimit: number;
  memoryLimit: number;
  handoffsLimit: number;
  safetyMargin: number;
}

export class ContextOptimizer {
  public buildAgentContext(options: {
    task: string;
    objective: string;
    constraints?: string[];
    relevantFiles?: string[];
    relevantMemory?: string[];
    relevantSkills?: string[];
    requiredTools?: string[];
    priorDecisions?: string[];
    structuredHandoffs?: StructuredHandoff[];
    maxTokens?: number;
  }): AgentContext {
    const maxTokens = options.maxTokens || 30000;

    // Compartmentalized Budget Allocation
    const budget: ContextBudgetBreakdown = {
      systemLimit: Math.floor(maxTokens * 0.10),
      taskLimit: Math.floor(maxTokens * 0.25),
      filesLimit: Math.floor(maxTokens * 0.30),
      memoryLimit: Math.floor(maxTokens * 0.15),
      handoffsLimit: Math.floor(maxTokens * 0.15),
      safetyMargin: Math.floor(maxTokens * 0.05)
    };

    const objective = options.objective;
    const constraints = options.constraints || [];
    const rawMemory = options.relevantMemory || [];
    const deduplicatedMemory = [...new Set(rawMemory.map(m => m.trim()))];
    const relevantFiles = [...new Set(options.relevantFiles || [])].slice(0, 8);
    const rawHandoffs = options.structuredHandoffs || [];
    const structuredHandoffs = rawHandoffs.slice(-3);

    // Initial raw token measurement from the full task
    const fullRawStr = options.task + objective + constraints.join('') + deduplicatedMemory.join('') + relevantFiles.join('');
    const rawTokenEstimate = Math.ceil(fullRawStr.length / 3.8);

    if (rawTokenEstimate > maxTokens || deduplicatedMemory.length > 3) {
      // Compress memory items, summarize handoffs, and slice task to compartment limit
      const task = options.task.slice(0, Math.min(options.task.length, budget.taskLimit * 4));
      const compressedMemory = deduplicatedMemory.slice(0, 3).map(m => (m.length > 120 ? m.slice(0, 120) + '...' : m));

      return {
        task,
        objective,
        constraints: constraints.slice(0, 4),
        relevantFiles: relevantFiles.slice(0, 4),
        relevantMemory: compressedMemory,
        relevantSkills: options.relevantSkills || [],
        requiredTools: options.requiredTools || [],
        priorDecisions: (options.priorDecisions || []).slice(-2),
        structuredHandoffs: structuredHandoffs.slice(-1),
        tokenEstimate: Math.min(maxTokens, Math.ceil((task.length + objective.length + compressedMemory.join('').length) / 3.8))
      };
    }

    return {
      task: options.task,
      objective,
      constraints,
      relevantFiles,
      relevantMemory: deduplicatedMemory,
      relevantSkills: options.relevantSkills || [],
      requiredTools: options.requiredTools || [],
      priorDecisions: options.priorDecisions || [],
      structuredHandoffs,
      tokenEstimate: rawTokenEstimate
    };
  }

  public formatPrompt(context: AgentContext): string {
    const parts: string[] = [
      `TASK: ${context.task}`,
      `OBJECTIVE: ${context.objective}`
    ];

    if (context.constraints.length > 0) {
      parts.push(`CONSTRAINTS:\n${context.constraints.map(c => `- ${c}`).join('\n')}`);
    }

    if (context.priorDecisions.length > 0) {
      parts.push(`PRIOR DECISIONS:\n${context.priorDecisions.map(d => `- ${d}`).join('\n')}`);
    }

    if (context.structuredHandoffs.length > 0) {
      parts.push(
        `HANDOFF CONTEXT:\n${context.structuredHandoffs
          .map(h => `- [${h.producedByRole.toUpperCase()}] ${h.objective}: ${h.findings.join('; ')}`)
          .join('\n')}`
      );
    }

    if (context.relevantFiles.length > 0) {
      parts.push(`RELEVANT FILES:\n${context.relevantFiles.map(f => `- ${f}`).join('\n')}`);
    }

    if (context.relevantMemory.length > 0) {
      parts.push(`PROJECT MEMORY:\n${context.relevantMemory.map(m => `- ${m}`).join('\n')}`);
    }

    return parts.join('\n\n');
  }
}

export const contextOptimizer = new ContextOptimizer();
