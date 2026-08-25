/**
 * Antigravity Production-Grade Adaptive Harness - Task Classifier
 * Deterministic, zero-cost, high-precision task & workload category profiler.
 */

import { TaskProfile, TaskRisk, UncertaintyLevel, ExecutionMode, WorkloadCategory } from './types.js';

export class TaskClassifier {
  public classify(prompt: string, taskId: string = `task_${Date.now()}`): TaskProfile {
    const text = prompt.toLowerCase();
    const length = prompt.length;
    const reasons: string[] = [];

    // 1. Workload Category Profiling
    let category: WorkloadCategory = 'coding';
    if (text.includes('debug') || text.includes('fix') || text.includes('error') || text.includes('exception') || text.includes('unhandled')) {
      category = 'debugging';
    } else if (text.includes('refactor') || text.includes('clean up') || text.includes('extract function')) {
      category = 'refactoring';
    } else if (text.includes('architecture') || text.includes('microservice') || text.includes('system design') || text.includes('consensus')) {
      category = 'architecture';
    } else if (text.includes('test') || text.includes('playwright') || text.includes('unit test') || text.includes('suite')) {
      category = 'testing';
    } else if (text.includes('research') || text.includes('compare') || text.includes('benchmark')) {
      category = 'research';
    } else if (text.includes('api') || text.includes('endpoint') || text.includes('stripe') || text.includes('webhook') || text.includes('oauth')) {
      category = 'api_integration';
    } else if (text.includes('document') || text.includes('openapi') || text.includes('readme') || text.includes('spec')) {
      category = 'documentation';
    } else if (text.includes('multi-file') || text.includes('scaffold') || text.includes('controllers and models')) {
      category = 'multi_file';
    }

    // 2. Complexity Assessment (0 - 10)
    let complexity = 2; // baseline for simple question/instruction

    const highComplexityKeywords = [
      'architect', 'system design', 'microservice', 'distributed', 'consensus',
      'fullstack', 'migration', 'database schema', 'multi-tenant', 'compiler',
      'lexer', 'ast', 'virtual machine', 'concurrency', 'deadlock', 'memory leak',
      'cryptography', 'security audit', 'penetration', 'zero-knowledge'
    ];

    const mediumComplexityKeywords = [
      'refactor', 'component', 'api endpoint', 'integration', 'test suite',
      'playwright', 'unit test', 'docker', 'pipeline', 'workflow', 'crud',
      'validation', 'state management', 'middleware', 'dashboard',
      'mathematical proof', 'matrix multiplication', 'matrix', 'algorithm',
      'benchmark multiple', 'compare both', 'independently check'
    ];

    const simpleKeywords = [
      'fix typo', 'explain', 'what is', 'format', 'lint', 'rename', 'hello',
      'reverse string', 'add comment', 'calculate', 'css align', 'sort'
    ];

    let matchesHigh = 0;
    for (const kw of highComplexityKeywords) {
      if (text.includes(kw)) {
        matchesHigh++;
        reasons.push(`High-complexity signal: "${kw}"`);
      }
    }

    let matchesMedium = 0;
    for (const kw of mediumComplexityKeywords) {
      if (text.includes(kw)) {
        matchesMedium++;
        reasons.push(`Medium-complexity signal: "${kw}"`);
      }
    }

    let matchesSimple = 0;
    for (const kw of simpleKeywords) {
      if (text.includes(kw)) {
        matchesSimple++;
      }
    }

    if (matchesHigh > 0) {
      complexity = Math.min(10, 6 + matchesHigh * 1.5);
    } else if (matchesMedium > 0) {
      complexity = Math.min(7, 4 + matchesMedium * 1.0);
    } else if (matchesSimple > 0 || length < 100) {
      complexity = Math.max(1, Math.min(3, Math.ceil(length / 100)));
      reasons.push('Low-complexity simple instruction/query');
    }

    // Adjust complexity by length
    if (length > 2000) complexity = Math.min(10, complexity + 2);
    else if (length > 800) complexity = Math.min(10, complexity + 1);

    // 3. Risk Estimation (low | medium | high | critical)
    let risk: TaskRisk = 'low';
    const criticalRiskKeywords = ['production', 'deploy', 'drop database', 'secret', 'payment', 'stripe', 'delete all', 'auth vulnerability'];
    const highRiskKeywords = ['authentication', 'authorization', 'permission', 'security', 'crypto', 'billing', 'data loss'];
    const mediumRiskKeywords = ['database', 'migration', 'build pipeline', 'api change', 'config update'];

    if (criticalRiskKeywords.some(k => text.includes(k))) {
      risk = 'critical';
      reasons.push('Critical risk factors detected (production/auth/security/data)');
    } else if (highRiskKeywords.some(k => text.includes(k))) {
      risk = 'high';
      reasons.push('High risk security or core system modification');
    } else if (mediumRiskKeywords.some(k => text.includes(k))) {
      risk = 'medium';
    }

    // 4. Uncertainty Level
    let uncertainty: UncertaintyLevel = 'low';
    if (text.includes('explore') || text.includes('investigate') || text.includes('why is') || text.includes('unknown bug') || text.includes('benchmark')) {
      uncertainty = 'medium';
    }
    if (text.includes('research') && text.includes('compare') && length > 500) {
      uncertainty = 'high';
    }

    // 5. Parallelizability Detection
    const parallelIndicators = [
      'compare both', 'benchmark multiple', 'research these 3', 'survey',
      'fetch all 4', 'independently check', 'matrix of'
    ];
    const parallelizable = parallelIndicators.some(k => text.includes(k)) && complexity >= 3;

    // 6. Expected Tool Calls & Token Size
    let expectedToolCalls = 1;
    if (complexity >= 8) expectedToolCalls = 8;
    else if (complexity >= 5) expectedToolCalls = 4;
    else if (complexity >= 3) expectedToolCalls = 2;

    const estimatedContextTokens = Math.max(500, Math.ceil(length / 3.5) + (complexity * 800));

    // 7. Deep Reasoning & Review Need
    const requiresDeepReasoning = complexity >= 8 || risk === 'critical';
    const requiresReview = risk === 'high' || risk === 'critical' || complexity >= 7;

    // 8. Recommended Mode (SOLO is the default!)
    let recommendedMode: ExecutionMode = 'solo';

    if (complexity >= 8 || (complexity >= 7 && risk === 'critical')) {
      recommendedMode = 'supervisor';
      reasons.push('Supervisor mode selected: Highly complex multi-faceted architecture task');
    } else if (parallelizable) {
      recommendedMode = 'parallel';
      reasons.push('Parallel mode selected: Genuinely independent multi-branch research');
    } else if (complexity >= 5 || requiresReview) {
      recommendedMode = 'pipeline';
      reasons.push('Pipeline mode selected: Multi-step build with validation stage');
    } else {
      recommendedMode = 'solo';
      reasons.push('Solo mode selected: Task can be completed efficiently by a single agent');
    }

    return {
      taskId,
      complexity: Math.round(complexity),
      risk,
      uncertainty,
      category,
      parallelizable,
      expectedToolCalls,
      estimatedContextTokens,
      requiresDeepReasoning,
      requiresReview,
      recommendedMode,
      reasons
    };
  }
}

export const taskClassifier = new TaskClassifier();
