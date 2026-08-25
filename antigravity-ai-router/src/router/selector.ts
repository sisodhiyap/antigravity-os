import { IntelligentClassification } from './classifier.js';
import { ResourceMonitor, ResourceSnapshot, MemorySafetyAssessment } from './resource-monitor.js';

export type UserRoutingPreference =
  | 'FAST'
  | 'BALANCED'
  | 'QUALITY'
  | 'LOCAL_ONLY'
  | 'CLOUD_ONLY'
  | 'CHEAPEST';

export interface IntelligentRouteDecision {
  selectedModel: string;
  selectedProvider: string;
  targetTier: 'FAST_LOCAL' | 'LOCAL_LARGE' | 'CLOUD' | 'VISION' | 'LONG_CONTEXT';
  endpoint: string;
  fallbackChain: string[];
  reason: string;
  escalated: boolean;
  escalationReason?: string;
  memorySafety: MemorySafetyAssessment;
  resourceSnapshot: ResourceSnapshot;
  userPreferenceApplied: UserRoutingPreference;
}

export interface RouteSelectionOptions {
  classification: IntelligentClassification;
  userPreference?: UserRoutingPreference;
  overrideRamAvailableGb?: number;
  forceModel?: string;
}

export function selectIntelligentModel(options: RouteSelectionOptions): IntelligentRouteDecision {
  const { classification, userPreference = 'BALANCED', overrideRamAvailableGb, forceModel } = options;
  const monitor = ResourceMonitor.getInstance();
  const snapshot = monitor.getSnapshot();

  let targetTier = classification.recommendedTier;
  let selectedModel = 'qwen2.5-coder:14b';
  let selectedProvider = 'ollama';
  let endpoint = 'http://127.0.0.1:11434/api/generate';
  let fallbackChain: string[] = ['nvidia/nemotron-3.5-lightning:free', 'airllm/Qwen/Qwen3-32B'];
  let reason = classification.reason;
  let escalated = classification.escalationNeeded;
  let escalationReason = classification.escalationReason;

  // 1. Apply User Preferences
  if (userPreference === 'CLOUD_ONLY') {
    targetTier = 'CLOUD';
    selectedProvider = 'openrouter';
    selectedModel = 'nvidia/nemotron-3.5-lightning:free';
    endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    fallbackChain = ['qwen/qwen3-coder:free', 'deepseek/deepseek-v4-flash:free', 'openrouter/free'];
    reason = 'User preference [CLOUD_ONLY] enforced. Local models bypassed.';
  } else if (userPreference === 'LOCAL_ONLY') {
    if (classification.primaryCategory === 'LOCAL_LARGE' || classification.primaryCategory === 'REASONING') {
      targetTier = 'LOCAL_LARGE';
      selectedProvider = 'airllm';
      selectedModel = 'airllm/Qwen/Qwen3-32B';
      endpoint = 'http://127.0.0.1:8000/v1/chat/completions';
      fallbackChain = ['qwen2.5-coder:14b', 'qwen2.5-coder:7b'];
    } else {
      targetTier = 'FAST_LOCAL';
      selectedProvider = 'ollama';
      selectedModel = 'qwen2.5-coder:14b';
      endpoint = 'http://127.0.0.1:11434/api/generate';
      fallbackChain = ['airllm/Qwen/Qwen3-32B', 'qwen2.5-coder:7b'];
    }
    reason = 'User preference [LOCAL_ONLY] enforced. Cloud models disabled.';
  } else if (userPreference === 'FAST') {
    targetTier = 'FAST_LOCAL';
    selectedProvider = 'ollama';
    selectedModel = 'qwen2.5-coder:7b';
    endpoint = 'http://127.0.0.1:11434/api/generate';
    fallbackChain = ['qwen2.5-coder:14b', 'nvidia/nemotron-3.5-lightning:free'];
    reason = 'User preference [FAST] active: Lowest-latency local editing model prioritized.';
  } else if (userPreference === 'QUALITY') {
    targetTier = 'CLOUD';
    selectedProvider = 'openrouter';
    selectedModel = 'qwen/qwen3-coder:free';
    endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    fallbackChain = ['airllm/Qwen/Qwen3-32B', 'nvidia/nemotron-3.5-lightning:free'];
    reason = 'User preference [QUALITY] active: SOTA model chain selected.';
  } else {
    // BALANCED / CHEAPEST (Default Intelligent Decision Matrix)
    switch (targetTier) {
      case 'VISION':
        selectedProvider = 'ollama';
        selectedModel = 'minicpm-v:latest';
        endpoint = 'http://127.0.0.1:11434/api/generate';
        fallbackChain = ['nvidia/nemotron-3.5-lightning:free', 'gemini-1.5-flash'];
        break;

      case 'LONG_CONTEXT':
        if (classification.estimatedPromptTokens <= 16384) {
          selectedProvider = 'airllm';
          selectedModel = 'airllm/Qwen/Qwen3-32B';
          endpoint = 'http://127.0.0.1:8000/v1/chat/completions';
          fallbackChain = ['nvidia/nemotron-3.5-lightning:free', 'qwen2.5-coder:14b'];
        } else {
          selectedProvider = 'openrouter';
          selectedModel = 'nvidia/nemotron-3.5-lightning:free';
          endpoint = 'https://openrouter.ai/api/v1/chat/completions';
          fallbackChain = ['qwen/qwen3-coder:free', 'airllm/Qwen/Qwen3-32B'];
          escalated = true;
          escalationReason = `Context size (${classification.estimatedPromptTokens} tokens) exceeds local 16K limit. Escalated to OpenRouter 128K context.`;
        }
        break;

      case 'LOCAL_LARGE':
        selectedProvider = 'airllm';
        selectedModel = 'airllm/Qwen/Qwen3-32B';
        endpoint = 'http://127.0.0.1:8000/v1/chat/completions';
        fallbackChain = ['nvidia/nemotron-3.5-lightning:free', 'qwen2.5-coder:14b'];
        break;

      case 'CLOUD':
        selectedProvider = 'openrouter';
        selectedModel = 'nvidia/nemotron-3.5-lightning:free';
        endpoint = 'https://openrouter.ai/api/v1/chat/completions';
        fallbackChain = ['qwen2.5-coder:14b', 'airllm/Qwen/Qwen3-32B'];
        break;

      case 'FAST_LOCAL':
      default:
        selectedProvider = 'ollama';
        selectedModel = classification.complexity === 'EASY' ? 'qwen2.5-coder:7b' : 'qwen2.5-coder:14b';
        endpoint = 'http://127.0.0.1:11434/api/generate';
        fallbackChain = ['nvidia/nemotron-3.5-lightning:free', 'airllm/Qwen/Qwen3-32B'];
        break;
    }
  }

  // 2. Resource & Memory Safety Guard
  let memorySafety = monitor.evaluateMemorySafety(
    selectedProvider,
    selectedModel,
    classification.estimatedPromptTokens,
    overrideRamAvailableGb
  );

  // If AirLLM selected but memory is insufficient, escalate gracefully to OpenRouter
  if (selectedProvider === 'airllm' && !memorySafety.isSafe) {
    escalated = true;
    escalationReason = `Resource Guard: ${memorySafety.reason} Escalating from AirLLM to OpenRouter cloud swarm.`;
    selectedProvider = 'openrouter';
    selectedModel = 'nvidia/nemotron-3.5-lightning:free';
    endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    fallbackChain = ['qwen2.5-coder:14b', 'qwen/qwen3-coder:free'];
    reason = `Resource Guard Intervention: ${escalationReason}`;

    // Re-evaluate memory safety for fallback provider
    memorySafety = monitor.evaluateMemorySafety(
      selectedProvider,
      selectedModel,
      classification.estimatedPromptTokens,
      overrideRamAvailableGb
    );
  }

  // 3. Force Model Override if provided
  if (forceModel) {
    if (forceModel.startsWith('airllm') || forceModel.includes('32B')) {
      selectedProvider = 'airllm';
      selectedModel = forceModel;
      endpoint = 'http://127.0.0.1:8000/v1/chat/completions';
    } else if (forceModel.includes('openrouter') || forceModel.includes('nvidia') || forceModel.includes(':free')) {
      selectedProvider = 'openrouter';
      selectedModel = forceModel;
      endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    } else {
      selectedProvider = 'ollama';
      selectedModel = forceModel;
      endpoint = 'http://127.0.0.1:11434/api/generate';
    }
    reason = `Explicit model override [${forceModel}] locked.`;
  }

  return {
    selectedModel,
    selectedProvider,
    targetTier,
    endpoint,
    fallbackChain,
    reason,
    escalated,
    escalationReason,
    memorySafety,
    resourceSnapshot: snapshot,
    userPreferenceApplied: userPreference
  };
}

/**
 * Backward compatibility wrapper for existing code
 */
export function selectModel(classification: any): any {
  const intelligent = selectIntelligentModel({
    classification: {
      primaryCategory: classification.recommendedType === 'local_large' ? 'LOCAL_LARGE' : 'FAST_LOCAL',
      allCategories: [classification.category || 'CODE'],
      complexity: classification.complexity || 'MEDIUM',
      estimatedPromptTokens: 512,
      recommendedTier: classification.recommendedType === 'local_large' ? 'LOCAL_LARGE' : 'FAST_LOCAL',
      escalationNeeded: false,
      reason: classification.reason || 'Standard routing'
    }
  });

  return {
    modelId: intelligent.selectedModel,
    provider: intelligent.selectedProvider,
    type: intelligent.targetTier === 'LOCAL_LARGE' ? 'local_large' : intelligent.targetTier === 'CLOUD' ? 'free' : 'local',
    endpoint: intelligent.endpoint,
    fallbackChain: intelligent.fallbackChain
  };
}
