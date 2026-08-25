export type RequestClassificationCategory =
  | 'FAST_LOCAL'
  | 'LOCAL_LARGE'
  | 'CLOUD'
  | 'VISION'
  | 'LONG_CONTEXT'
  | 'CODE'
  | 'REASONING'
  | 'CREATIVE'
  | 'AGENTIC'
  | 'TOOL_USE';

export type TaskComplexity = 'EASY' | 'MEDIUM' | 'HARD';

export interface IntelligentClassification {
  primaryCategory: RequestClassificationCategory;
  allCategories: RequestClassificationCategory[];
  complexity: TaskComplexity;
  estimatedPromptTokens: number;
  recommendedTier: 'FAST_LOCAL' | 'LOCAL_LARGE' | 'CLOUD' | 'VISION' | 'LONG_CONTEXT';
  escalationNeeded: boolean;
  escalationReason?: string;
  reason: string;
}

export function classifyTask(prompt: string, contextTokensOverride?: number): IntelligentClassification {
  const lower = prompt.toLowerCase();
  const estimatedTokens = contextTokensOverride || Math.max(1, Math.round(prompt.length / 4) + prompt.split(/\s+/).length);
  const categories: Set<RequestClassificationCategory> = new Set();

  let complexity: TaskComplexity = 'MEDIUM';
  let primaryCategory: RequestClassificationCategory = 'FAST_LOCAL';
  let recommendedTier: 'FAST_LOCAL' | 'LOCAL_LARGE' | 'CLOUD' | 'VISION' | 'LONG_CONTEXT' = 'FAST_LOCAL';
  let reason = 'Standard request routed to fast local-first engine.';
  let escalationNeeded = false;
  let escalationReason: string | undefined;

  // 1. Detect CODE category
  if (
    lower.includes('function') ||
    lower.includes('typescript') ||
    lower.includes('javascript') ||
    lower.includes('python') ||
    lower.includes('react') ||
    lower.includes('sql') ||
    lower.includes('class') ||
    lower.includes('api') ||
    lower.includes('refactor') ||
    lower.includes('debug') ||
    lower.includes('code') ||
    lower.includes('const ') ||
    lower.includes('import ')
  ) {
    categories.add('CODE');
  }

  // 2. Detect VISION category
  if (
    lower.includes('image') ||
    lower.includes('screenshot') ||
    lower.includes('visual') ||
    lower.includes('layout inspection') ||
    lower.includes('png') ||
    lower.includes('svg rendering') ||
    lower.includes('data:image')
  ) {
    categories.add('VISION');
    primaryCategory = 'VISION';
    recommendedTier = 'VISION';
    reason = 'Visual and layout analysis task routed to multimodal local vision engine (minicpm-v:latest).';
  }

  // 3. Detect LONG_CONTEXT category (> 3500 tokens)
  if (estimatedTokens > 3500 || lower.includes('entire codebase') || lower.includes('large document') || lower.includes('whole repo')) {
    categories.add('LONG_CONTEXT');
    escalationNeeded = true;
    escalationReason = `Large context detected (${estimatedTokens} tokens > 3.5K threshold). Escalating from fast local model.`;
    primaryCategory = 'LONG_CONTEXT';
    recommendedTier = 'LONG_CONTEXT';
    complexity = 'HARD';
    reason = `Long context (${estimatedTokens} tokens) requires large local context window or cloud mesh.`;
  }

  // 4. Detect AGENTIC and TOOL_USE
  if (
    lower.includes('swarm') ||
    lower.includes('multi-agent') ||
    lower.includes('pipeline') ||
    lower.includes('delegate') ||
    lower.includes('orchestrate')
  ) {
    categories.add('AGENTIC');
  }

  if (
    lower.includes('tool') ||
    lower.includes('function_call') ||
    lower.includes('mcp') ||
    lower.includes('execute_command') ||
    lower.includes('file_edit')
  ) {
    categories.add('TOOL_USE');
  }

  // 5. Detect REASONING and CREATIVE
  if (
    lower.includes('why') ||
    lower.includes('explain') ||
    lower.includes('analyze') ||
    lower.includes('consensus') ||
    lower.includes('algorithm') ||
    lower.includes('math') ||
    lower.includes('proof') ||
    lower.includes('architecture') ||
    lower.includes('system design')
  ) {
    categories.add('REASONING');
  }

  if (
    lower.includes('story') ||
    lower.includes('creative') ||
    lower.includes('copywrite') ||
    lower.includes('poem') ||
    lower.includes('pitch')
  ) {
    categories.add('CREATIVE');
  }

  // 6. Detect LOCAL_LARGE Complexity signals (escalation from Ollama)
  if (
    lower.includes('32b') ||
    lower.includes('70b') ||
    lower.includes('airllm') ||
    lower.includes('deep refactor') ||
    lower.includes('multi-file migration') ||
    lower.includes('distributed architecture') ||
    lower.includes('large architecture') ||
    lower.includes('consensus protocol')
  ) {
    categories.add('LOCAL_LARGE');
    categories.add('REASONING');
    complexity = 'HARD';
    primaryCategory = 'LOCAL_LARGE';
    recommendedTier = 'LOCAL_LARGE';
    reason = 'Complex architectural design requires 32B+ parameter reasoning on local layered engine (AirLLM).';
    escalationNeeded = true;
    escalationReason = 'High complexity architectural scope exceeds 7B/14B parameter capacity.';
  }

  // 7. Detect CLOUD preference/quality signals
  if (
    lower.includes('cloud-quality') ||
    lower.includes('openrouter') ||
    lower.includes('highest quality') ||
    lower.includes('gpt-4o') ||
    lower.includes('claude') ||
    lower.includes('production release review')
  ) {
    categories.add('CLOUD');
    primaryCategory = 'CLOUD';
    recommendedTier = 'CLOUD';
    reason = 'Explicit cloud-grade quality or production review requested; routed to distributed cloud swarm.';
  }

  // 8. Default FAST_LOCAL for routine editing/autocomplete
  if (categories.size === 0 || (categories.has('CODE') && !categories.has('LOCAL_LARGE') && !categories.has('LONG_CONTEXT') && !categories.has('VISION'))) {
    if (
      lower.includes('autocomplete') ||
      lower.includes('format') ||
      lower.includes('boilerplate') ||
      lower.includes('type definition') ||
      lower.includes('rename') ||
      lower.includes('echo') ||
      lower.length < 100
    ) {
      categories.add('FAST_LOCAL');
      primaryCategory = 'FAST_LOCAL';
      recommendedTier = 'FAST_LOCAL';
      complexity = 'EASY';
      reason = 'Routine autocomplete/boilerplate editing; routed to low-latency local model (qwen2.5-coder:14b/7b).';
    } else {
      categories.add('FAST_LOCAL');
      categories.add('CODE');
      primaryCategory = 'FAST_LOCAL';
      recommendedTier = 'FAST_LOCAL';
      complexity = 'MEDIUM';
      reason = 'Standard local coding request assigned to Ollama fast engine.';
    }
  }

  return {
    primaryCategory,
    allCategories: Array.from(categories),
    complexity,
    estimatedPromptTokens: estimatedTokens,
    recommendedTier,
    escalationNeeded,
    escalationReason,
    reason
  };
}
