import {
  AICompletionRequest,
  AICompletionResponse,
  IAIProviderAdapter,
  OllamaProviderAdapter,
  OpenAIProviderAdapter,
  GeminiProviderAdapter,
  GroqProviderAdapter,
  NvidiaProviderAdapter,
  DeepSeekProviderAdapter,
  OpenRouterProviderAdapter,
  AirLLMProviderAdapter,
} from "./providers";
import { quotaEngine } from "./quota";
import { AIProviderError, BudgetExceededError } from "@/lib/errors";

export interface RoutedCompletionOptions extends AICompletionRequest {
  taskCategory?: "CODE" | "REASONING" | "FAST" | "CREATIVE" | "GENERAL" | "LARGE" | "LOW_VRAM" | "FAST_LOCAL" | "LOCAL_LARGE" | "CLOUD" | "VISION" | "LONG_CONTEXT";
  workspaceId?: string;
  provider?: string;
  userPreference?: "FAST" | "BALANCED" | "QUALITY" | "LOCAL_ONLY" | "CLOUD_ONLY" | "CHEAPEST";
}

export class CentralAIRouter {
  private static instance: CentralAIRouter;
  private adapters: Map<string, IAIProviderAdapter> = new Map();
  private circuitBreakers: Map<string, { failureCount: number; cooldownUntil: number }> = new Map();

  private constructor() {
    this.registerAdapter(new OllamaProviderAdapter());
    this.registerAdapter(new OpenAIProviderAdapter());
    this.registerAdapter(new GeminiProviderAdapter());
    this.registerAdapter(new GroqProviderAdapter());
    this.registerAdapter(new NvidiaProviderAdapter());
    this.registerAdapter(new DeepSeekProviderAdapter());
    this.registerAdapter(new OpenRouterProviderAdapter());
    this.registerAdapter(new AirLLMProviderAdapter());
  }

  public static getInstance(): CentralAIRouter {
    if (!CentralAIRouter.instance) {
      CentralAIRouter.instance = new CentralAIRouter();
    }
    return CentralAIRouter.instance;
  }

  public registerAdapter(adapter: IAIProviderAdapter) {
    this.adapters.set(adapter.name, adapter);
  }

  public getAdapter(name: string): IAIProviderAdapter | undefined {
    return this.adapters.get(name);
  }

  public getRegisteredAdapters(): IAIProviderAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Health-checks all registered adapters live and returns truthful status
   */
  public async checkAllProviders(): Promise<Array<{ name: string; available: boolean; error?: string }>> {
    const results: Array<{ name: string; available: boolean; error?: string }> = [];
    for (const [name, adapter] of this.adapters.entries()) {
      try {
        const available = await adapter.isAvailable();
        results.push({ name, available });
      } catch (err: any) {
        results.push({ name, available: false, error: err.message || "Failed health check" });
      }
    }
    return results;
  }

  /**
   * Resolves smart capability-based fallback priority chain based on task category
   */
  public getPriorityChain(category: string = "GENERAL"): string[] {
    switch (category) {
      case "FAST":
      case "FAST_LOCAL":
        return ["groq", "ollama", "openrouter", "openai", "gemini", "nvidia", "deepseek", "airllm"];
      case "CODE":
        return ["deepseek", "openai", "groq", "gemini", "openrouter", "ollama", "nvidia", "airllm"];
      case "REASONING":
        return ["openai", "gemini", "deepseek", "groq", "nvidia", "openrouter", "ollama", "airllm"];
      case "CREATIVE":
        return ["gemini", "openai", "openrouter", "groq", "deepseek", "nvidia", "ollama"];
      case "LOCAL_LARGE":
      case "LARGE":
      case "LOW_VRAM":
        return ["airllm", "ollama", "groq", "openrouter", "openai"];
      case "CLOUD":
        return ["groq", "openai", "gemini", "openrouter", "nvidia", "deepseek"];
      case "LONG_CONTEXT":
        return ["gemini", "openai", "openrouter", "groq", "airllm"];
      default:
        return ["groq", "openai", "gemini", "openrouter", "deepseek", "nvidia", "ollama", "airllm"];
    }
  }

  private isCircuitOpen(providerName: string): boolean {
    const cb = this.circuitBreakers.get(providerName);
    if (!cb) return false;
    if (Date.now() < cb.cooldownUntil) {
      return true; // Still cooling down
    }
    // Cooldown passed, reset
    this.circuitBreakers.delete(providerName);
    return false;
  }

  private recordFailure(providerName: string) {
    const cb = this.circuitBreakers.get(providerName) || { failureCount: 0, cooldownUntil: 0 };
    cb.failureCount += 1;
    if (cb.failureCount >= 3) {
      cb.cooldownUntil = Date.now() + 30000; // 30s circuit break
    }
    this.circuitBreakers.set(providerName, cb);
  }

  private recordSuccess(providerName: string) {
    this.circuitBreakers.delete(providerName);
  }

  /**
   * Executes AI completion with intelligent routing, circuit breaking, quota checks, and fallback
   */
  public async execute(options: RoutedCompletionOptions): Promise<AICompletionResponse & { fallbackChainUsed: string[] }> {
    const workspaceId = options.workspaceId || "default";

    // 1. Budget Governance Check
    if (!quotaEngine.checkBudget(workspaceId)) {
      throw new BudgetExceededError(50.0, 50.0, `Workspace [${workspaceId}]`);
    }

    const priorityChain = options.provider
      ? [options.provider, ...this.getPriorityChain(options.taskCategory).filter(p => p !== options.provider)]
      : this.getPriorityChain(options.taskCategory);
    const fallbackChainUsed: string[] = [];
    let lastError: Error | null = null;

    for (const providerName of priorityChain) {
      if (this.isCircuitOpen(providerName)) {
        continue;
      }

      const adapter = this.adapters.get(providerName);
      if (!adapter) continue;

      fallbackChainUsed.push(providerName);

      try {
        const available = await adapter.isAvailable();
        if (!available) {
          continue;
        }

        const response = await adapter.complete(options);

        // Record metrics and quota
        quotaEngine.recordUsage(
          response.provider,
          response.promptTokens,
          response.completionTokens,
          response.model,
          workspaceId
        );

        this.recordSuccess(providerName);

        return {
          ...response,
          fallbackChainUsed,
        };
      } catch (err: any) {
        lastError = err;
        this.recordFailure(providerName);
      }
    }

    throw new AIProviderError(
      priorityChain.join(" -> "),
      lastError?.message || "All AI providers in fallback chain failed or were unavailable"
    );
  }
}

export const aiRouter = CentralAIRouter.getInstance();
