import { env } from "@/config/env";
import { AIProviderError } from "@/lib/errors";

export interface AICompletionRequest {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface AICompletionResponse {
  content: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
}

export interface IAIProviderAdapter {
  name: string;
  isAvailable(): Promise<boolean>;
  complete(req: AICompletionRequest): Promise<AICompletionResponse>;
}

/**
 * Local Ollama Provider (GPU Accelerated, zero-cost, local privacy)
 */
export class OllamaProviderAdapter implements IAIProviderAdapter {
  public name = "ollama";

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${env.server.OLLAMA_BASE_URL}/api/tags`, {
        signal: AbortSignal.timeout(1500),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async complete(req: AICompletionRequest): Promise<AICompletionResponse> {
    const start = performance.now();
    const model = req.model || "qwen2.5-coder:7b";

    try {
      const combinedSignal = req.signal || AbortSignal.timeout(req.timeoutMs || 60000);
      const res = await fetch(`${env.server.OLLAMA_BASE_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt: req.prompt,
          system: req.systemPrompt,
          stream: false,
          options: {
            temperature: req.temperature ?? 0.2,
            num_predict: req.maxTokens ?? 2048,
          },
        }),
        signal: combinedSignal,
      });

      if (!res.ok) {
        throw new Error(`Ollama returned status ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      const latencyMs = Math.round(performance.now() - start);

      return {
        content: data.response || "",
        provider: "ollama",
        model,
        promptTokens: data.prompt_eval_count || Math.round(req.prompt.length / 4),
        completionTokens: data.eval_count || Math.round((data.response || "").length / 4),
        latencyMs,
      };
    } catch (err: any) {
      throw new AIProviderError("ollama", err.message || "Failed to execute Ollama request");
    }
  }
}

/**
 * DeepSeek Provider (Direct DeepSeek API)
 */
export class DeepSeekProviderAdapter implements IAIProviderAdapter {
  public name = "deepseek";

  async isAvailable(): Promise<boolean> {
    return !!env.server.DEEPSEEK_API_KEY;
  }

  async complete(req: AICompletionRequest): Promise<AICompletionResponse> {
    const start = performance.now();
    const model = req.model || "deepseek-chat";

    try {
      const combinedSignal = req.signal || AbortSignal.timeout(req.timeoutMs || 60000);
      const res = await fetch(`${env.server.DEEPSEEK_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.server.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            ...(req.systemPrompt ? [{ role: "system", content: req.systemPrompt }] : []),
            { role: "user", content: req.prompt },
          ],
          temperature: req.temperature ?? 0.3,
          max_tokens: req.maxTokens ?? 2048,
        }),
        signal: combinedSignal,
      });

      if (!res.ok) {
        throw new Error(`DeepSeek API error ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      const latencyMs = Math.round(performance.now() - start);
      const content = data.choices?.[0]?.message?.content || "";

      return {
        content,
        provider: "deepseek",
        model,
        promptTokens: data.usage?.prompt_tokens || Math.round(req.prompt.length / 4),
        completionTokens: data.usage?.completion_tokens || Math.round(content.length / 4),
        latencyMs,
      };
    } catch (err: any) {
      throw new AIProviderError("deepseek", err.message || "Failed to execute DeepSeek request");
    }
  }
}

/**
 * OpenRouter Provider (Free tier fallback mesh)
 */
export class OpenRouterProviderAdapter implements IAIProviderAdapter {
  public name = "openrouter";

  async isAvailable(): Promise<boolean> {
    return !!env.server.OPENROUTER_API_KEY;
  }

  async complete(req: AICompletionRequest): Promise<AICompletionResponse> {
    const start = performance.now();
    const model = req.model || "nvidia/nemotron-3.5-lightning:free";

    try {
      const combinedSignal = req.signal || AbortSignal.timeout(req.timeoutMs || 60000);
      const res = await fetch(`${env.server.OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.server.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://antigravity.ai",
          "X-Title": "Antigravity OS",
        },
        body: JSON.stringify({
          model,
          messages: [
            ...(req.systemPrompt ? [{ role: "system", content: req.systemPrompt }] : []),
            { role: "user", content: req.prompt },
          ],
          temperature: req.temperature ?? 0.3,
          max_tokens: req.maxTokens ?? 2048,
        }),
        signal: combinedSignal,
      });

      if (!res.ok) {
        throw new Error(`OpenRouter API error ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      const latencyMs = Math.round(performance.now() - start);
      const content = data.choices?.[0]?.message?.content || "";

      return {
        content,
        provider: "openrouter",
        model,
        promptTokens: data.usage?.prompt_tokens || Math.round(req.prompt.length / 4),
        completionTokens: data.usage?.completion_tokens || Math.round(content.length / 4),
        latencyMs,
      };
    } catch (err: any) {
      throw new AIProviderError("openrouter", err.message || "Failed to execute OpenRouter request");
    }
  }
}

/**
 * Local AirLLM Provider (Low-VRAM Layered Large Model Engine on http://127.0.0.1:8000/v1)
 */
export class AirLLMProviderAdapter implements IAIProviderAdapter {
  public name = "airllm";

  async isAvailable(): Promise<boolean> {
    try {
      const baseUrl = (process.env.AIRLLM_BASE_URL || "http://127.0.0.1:8000/v1").replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/models`, {
        signal: AbortSignal.timeout(1500),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async complete(req: AICompletionRequest): Promise<AICompletionResponse> {
    const start = performance.now();
    const model = req.model || "Qwen/Qwen3-32B";
    const baseUrl = (process.env.AIRLLM_BASE_URL || "http://127.0.0.1:8000/v1").replace(/\/$/, "");

    try {
      const combinedSignal = req.signal || AbortSignal.timeout(req.timeoutMs || 120000);
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            ...(req.systemPrompt ? [{ role: "system", content: req.systemPrompt }] : []),
            { role: "user", content: req.prompt }
          ],
          temperature: req.temperature ?? 0.3,
          max_tokens: req.maxTokens ?? 2048,
        }),
        signal: combinedSignal,
      });

      if (!res.ok) {
        throw new Error(`AirLLM returned status ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      const latencyMs = Math.round(performance.now() - start);
      const content = data.choices?.[0]?.message?.content || "";

      return {
        content,
        provider: "airllm",
        model,
        promptTokens: data.usage?.prompt_tokens || Math.round(req.prompt.length / 4),
        completionTokens: data.usage?.completion_tokens || Math.round(content.length / 4),
        latencyMs,
      };
    } catch (err: any) {
      throw new AIProviderError("airllm", err.message || "Failed to execute AirLLM request");
    }
  }
}
