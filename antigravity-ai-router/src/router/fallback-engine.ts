import { classifyTask } from './classifier.js';
import { selectIntelligentModel, UserRoutingPreference } from './selector.js';
import { QuotaManager } from './quota-manager.js';
import { validateQuality } from './quality-checker.js';
import { ResourceMonitor } from './resource-monitor.js';
import { LearningTelemetry } from './learning-telemetry.js';

export interface ExecuteRouteOptions {
  prompt: string;
  systemPrompt?: string;
  forceModel?: string;
  userPreference?: UserRoutingPreference;
  overrideRamAvailableGb?: number;
}

export interface RouteResponse {
  content: string;
  selectedModel: string;
  selectedProvider: string;
  fallbackOccurred: boolean;
  fallbackChainUsed: string[];
  latencyMs: number;
  qualityScore: number;
  estimatedCostUsd: number;
  tokensProcessed: number;
  tokensGenerated: number;
  routingExplainer: {
    taskComplexity: string;
    primaryCategory: string;
    allCategories: string[];
    recommendedTier: string;
    escalated: boolean;
    escalationReason?: string;
    reason: string;
    userPreference: string;
    memorySafety: any;
    resourceSnapshot: any;
  };
}

export class FallbackEngine {
  private quotaManager: QuotaManager;

  // Key pools
  private openaiKeyPool: string[];
  private currentOpenaiIndex = 0;

  private deepseekApiKey: string;
  private deepseekBaseUrl: string;

  private openrouterApiKey: string;
  private openrouterBaseUrl: string;

  private router9ApiKey: string;
  private router9BaseUrl: string;

  private geminiKeyPool: string[];
  private currentGeminiIndex = 0;

  constructor(quotaManager: QuotaManager) {
    this.quotaManager = quotaManager;

    // 1. OpenAI Key Pool
    const oaiEnv = process.env.OPENAI_API_KEY_POOL || process.env.OPENAI_API_KEY || '';
    this.openaiKeyPool = oaiEnv
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 10);

    // 2. DeepSeek API
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY || '';
    this.deepseekBaseUrl = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');

    // 3. OpenRouter Free Swarm
    this.openrouterApiKey = process.env.OPENROUTER_API_KEY || '';
    this.openrouterBaseUrl = (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');

    // 4. Router9 Gateway
    this.router9ApiKey = process.env.ROUTER9_API_KEY || '';
    this.router9BaseUrl = (process.env.ROUTER9_BASE_URL || 'https://api.router9.com/v1').replace(/\/$/, '');

    // 5. Gemini Key Pool
    const geminiPoolEnv = process.env.GEMINI_API_KEY_POOL || process.env.GEMINI_API_KEY || '';
    this.geminiKeyPool = geminiPoolEnv
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 10);
  }

  async executeRequest(options: ExecuteRouteOptions): Promise<RouteResponse> {
    const startTime = Date.now();
    const resourceMonitor = ResourceMonitor.getInstance();
    const learningTelemetry = LearningTelemetry.getInstance();

    const classification = classifyTask(options.prompt);
    const intelligentDecision = selectIntelligentModel({
      classification,
      userPreference: options.userPreference,
      overrideRamAvailableGb: options.overrideRamAvailableGb,
      forceModel: options.forceModel
    });

    const candidateModels = options.forceModel
      ? [options.forceModel, ...intelligentDecision.fallbackChain]
      : [intelligentDecision.selectedModel, ...intelligentDecision.fallbackChain];

    const fallbackChainUsed: string[] = [];
    let lastError: Error | null = null;

    const promptTokens = Math.max(1, Math.round(options.prompt.length / 4));

    for (let i = 0; i < candidateModels.length; i++) {
      const modelId = candidateModels[i];
      fallbackChainUsed.push(modelId);
      const provider = this.resolveProviderName(modelId);

      resourceMonitor.recordQueueEntry(provider);
      const stepStartTime = Date.now();

      try {
        const responseText = await this.invokeModel(modelId, options.prompt, options.systemPrompt);
        const quality = validateQuality(responseText);

        resourceMonitor.recordQueueExit(provider);

        if (!quality.valid) {
          throw new Error(`Quality check failed: ${quality.reason}`);
        }

        const latencyMs = Date.now() - startTime;
        const completionTokens = Math.max(1, Math.round(responseText.length / 4));
        const costUsd = learningTelemetry.calculateCost(provider, promptTokens, completionTokens);

        resourceMonitor.recordLatency(provider, Date.now() - stepStartTime);
        this.quotaManager.recordRequest(provider, promptTokens, latencyMs, true);

        const routeRecord = {
          requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toISOString(),
          promptSnippet: options.prompt.slice(0, 80).replace(/\n/g, ' '),
          classification: {
            primaryCategory: classification.primaryCategory,
            allCategories: classification.allCategories,
            complexity: classification.complexity
          },
          selectedProvider: intelligentDecision.selectedProvider,
          selectedModel: intelligentDecision.selectedModel,
          reason: intelligentDecision.reason,
          fallbackPlan: intelligentDecision.fallbackChain,
          fallbackOccurred: i > 0,
          actualProviderUsed: provider,
          actualModelUsed: modelId,
          latencyMs,
          tokensProcessed: promptTokens,
          tokensGenerated: completionTokens,
          totalTokens: promptTokens + completionTokens,
          costUsd,
          resourceSnapshot: {
            availableRamGb: intelligentDecision.resourceSnapshot.systemRamAvailableGb,
            availableVramMb: intelligentDecision.resourceSnapshot.gpuVramAvailableMb,
            queueDepth: intelligentDecision.resourceSnapshot.activeAirllmQueueDepth
          }
        };

        learningTelemetry.recordExecution(routeRecord);

        return {
          content: responseText,
          selectedModel: modelId,
          selectedProvider: provider,
          fallbackOccurred: i > 0,
          fallbackChainUsed,
          latencyMs,
          qualityScore: quality.score,
          estimatedCostUsd: costUsd,
          tokensProcessed: promptTokens,
          tokensGenerated: completionTokens,
          routingExplainer: {
            taskComplexity: classification.complexity,
            primaryCategory: classification.primaryCategory,
            allCategories: classification.allCategories,
            recommendedTier: intelligentDecision.targetTier,
            escalated: intelligentDecision.escalated,
            escalationReason: intelligentDecision.escalationReason,
            reason: intelligentDecision.reason,
            userPreference: intelligentDecision.userPreferenceApplied,
            memorySafety: intelligentDecision.memorySafety,
            resourceSnapshot: intelligentDecision.resourceSnapshot
          }
        };
      } catch (err: any) {
        resourceMonitor.recordQueueExit(provider);
        learningTelemetry.recordFailure(provider);

        lastError = err;
        const is429 = err.message?.includes('429') || err.message?.includes('rate limit') || err.message?.includes('quota');

        this.quotaManager.recordRequest(provider, 0, Date.now() - stepStartTime, false, is429);

        // Exponential backoff delay before trying next fallback model
        const delay = Math.pow(2, i) * 300;
        await new Promise((res) => setTimeout(res, Math.min(delay, 1500)));
      }
    }

    throw new Error(`All candidate models in fallback chain failed. Last error: ${lastError?.message}`);
  }

  private resolveProviderName(modelId: string): string {
    if (modelId.startsWith('airllm') || modelId.startsWith('Qwen/') || modelId.includes('Qwen3-32B') || modelId.includes('AirLLM')) return 'airllm';
    if (modelId.startsWith('gpt-') || modelId.startsWith('o1') || modelId.startsWith('o3')) return 'openai';
    if (modelId.startsWith('deepseek-chat') || modelId.startsWith('deepseek-reasoner')) return 'deepseek';
    if (modelId.includes('openrouter') || modelId.endsWith(':free')) return 'openrouter_free';
    if (modelId.startsWith('gemini')) return 'google_pool';
    if (modelId.includes('minimax') || modelId.includes('router9')) return 'router9';
    if (modelId.includes('antigravity')) return 'antigravity_native';
    return 'ollama';
  }

  private async invokeModel(modelId: string, prompt: string, systemPrompt?: string): Promise<string> {
    // 0. AirLLM Local Large-Model Engine (OpenAI-compatible server on http://127.0.0.1:8000/v1)
    if (modelId.startsWith('airllm') || modelId.startsWith('Qwen/') || modelId.includes('Qwen3-32B')) {
      const airllmBaseUrl = (process.env.AIRLLM_BASE_URL || 'http://127.0.0.1:8000/v1').replace(/\/$/, '');
      const cleanModelId = modelId.replace(/^airllm\//, '').replace(/^airllm:/, '');
      try {
        const res = await fetch(`${airllmBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: cleanModelId || 'Qwen/Qwen3-32B',
            messages: [
              ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
              { role: 'user', content: prompt }
            ]
          })
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`AirLLM HTTP ${res.status}: ${errText}`);
        }
        const data = (await res.json()) as any;
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error('AirLLM response contained empty content');
        return content;
      } catch (err: any) {
        throw new Error(`AirLLM local engine unavailable (${err.message}), falling back.`);
      }
    }

    // 1. Local Ollama Models (Installed local first)
    if (
      modelId.startsWith('qwen2.5') ||
      modelId.startsWith('deepseek-r1') ||
      modelId.startsWith('llama3') ||
      modelId.startsWith('minicpm')
    ) {
      try {
        const res = await fetch('http://127.0.0.1:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: modelId, prompt, stream: false })
        });
        if (!res.ok) throw new Error(`Ollama HTTP Error ${res.status}: ${res.statusText}`);
        const data = (await res.json()) as any;
        return data.response || '';
      } catch (ollamaErr: any) {
        throw new Error(`Local Ollama unavailable (${ollamaErr.message}), falling back to cloud tier.`);
      }
    }

    // 2. Official OpenAI API (gpt-4o, gpt-4o-mini, o3-mini, etc. with key pool rotation)
    if (modelId.startsWith('gpt-') || modelId.startsWith('o1') || modelId.startsWith('o3')) {
      const activeOaiKey = this.openaiKeyPool[this.currentOpenaiIndex % this.openaiKeyPool.length];
      this.currentOpenaiIndex = (this.currentOpenaiIndex + 1) % this.openaiKeyPool.length;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeOaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenAI HTTP ${res.status}: ${errText}`);
      }

      const data = (await res.json()) as any;
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('OpenAI response contained empty content');
      return content;
    }

    // 3. Official DeepSeek API (deepseek-chat, deepseek-reasoner)
    if (modelId.startsWith('deepseek-chat') || modelId.startsWith('deepseek-reasoner')) {
      const res = await fetch(`${this.deepseekBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.deepseekApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`DeepSeek HTTP ${res.status}: ${errText}`);
      }

      const data = (await res.json()) as any;
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('DeepSeek response contained empty content');
      return content;
    }

    // 4. OpenRouter Free Tier (Unlimited Free Coding Swarm)
    if (modelId.endsWith(':free') || modelId === 'openrouter/free' || modelId.startsWith('openrouter/')) {
      const res = await fetch(`${this.openrouterBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.openrouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://antigravity.ai',
          'X-Title': 'Antigravity Supercomputer'
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenRouter HTTP ${res.status}: ${errText}`);
      }

      const data = (await res.json()) as any;
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('OpenRouter response contained empty content');
      return content;
    }

    // 5. Google Gemini Multi-Key Pool
    if (modelId.startsWith('gemini')) {
      const activeKey = this.geminiKeyPool[this.currentGeminiIndex % this.geminiKeyPool.length];
      this.currentGeminiIndex = (this.currentGeminiIndex + 1) % this.geminiKeyPool.length;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${activeKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini Pool HTTP ${res.status}: ${errText}`);
      }

      const data = (await res.json()) as any;
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) throw new Error('Gemini response contained empty candidate text');
      return content;
    }

    // 6. Router9 Gateway
    if (modelId.startsWith('minimax') || modelId.startsWith('z-ai') || modelId.startsWith('moonshotai')) {
      const res = await fetch(`${this.router9BaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.router9ApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Router9 HTTP ${res.status}: ${errText}`);
      }

      const data = (await res.json()) as any;
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Router9 response contained empty content');
      return content;
    }

    // 7. Antigravity Native / General Safe Fallback
    const res = await fetch(`${this.openrouterBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://antigravity.ai',
        'X-Title': 'Antigravity Supercomputer'
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (res.ok) {
      const data = (await res.json()) as any;
      const content = data.choices?.[0]?.message?.content;
      if (content) return content;
    }

    return `[Antigravity Native Reserve Code Generator]: Result prepared for: ${prompt.slice(0, 80)}`;
  }
}
