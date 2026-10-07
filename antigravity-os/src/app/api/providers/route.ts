import { NextRequest, NextResponse } from "next/server";
import { aiRouter } from "@/server/ai/router";

export const dynamic = "force-dynamic";

interface ProviderSpec {
  name: string;
  type: string;
  priority: number;
  costPerMillion: number;
  defaultModel: string;
}

const PROVIDER_METADATA: Record<string, ProviderSpec> = {
  ollama: { name: "ollama", type: "LOCAL_GPU", priority: 1, costPerMillion: 0.0, defaultModel: "qwen2.5-coder:7b" },
  groq: { name: "groq", type: "CLOUD_FAST", priority: 2, costPerMillion: 0.05, defaultModel: "llama-3.3-70b-versatile" },
  deepseek: { name: "deepseek", type: "CLOUD_REASONING", priority: 3, costPerMillion: 0.28, defaultModel: "deepseek-chat" },
  openrouter: { name: "openrouter", type: "FREE_SWARM_MESH", priority: 4, costPerMillion: 0.0, defaultModel: "meta-llama/llama-3.3-70b-instruct:free" },
  gemini: { name: "gemini", type: "MULTI_KEY_POOL", priority: 5, costPerMillion: 0.075, defaultModel: "gemini-2.5-flash" },
  openai: { name: "openai", type: "MULTI_KEY_POOL", priority: 6, costPerMillion: 2.50, defaultModel: "gpt-4o-mini" },
  nvidia: { name: "nvidia", type: "CLOUD_ENTERPRISE", priority: 7, costPerMillion: 0.20, defaultModel: "nvidia/nemotron-3.5-lightning-30b-a3b" },
  airllm: { name: "airllm", type: "LOCAL_OFFLOAD", priority: 8, costPerMillion: 0.0, defaultModel: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B" },
};

export async function GET() {
  try {
    const healthChecks = await aiRouter.checkAllProviders();
    const checkMap = new Map(healthChecks.map(c => [c.name, c]));

    const providers = Object.entries(PROVIDER_METADATA).map(([name, meta]) => {
      const check = checkMap.get(name);
      const isAvailable = check?.available ?? false;
      const status = isAvailable ? "HEALTHY" : (name === "ollama" || name === "airllm") ? "OFFLINE" : "CONFIG_REQUIRED";

      return {
        name,
        type: meta.type,
        health: status,
        status: isAvailable ? "online" : "offline",
        available: isAvailable,
        priority: meta.priority,
        costPerMillion: meta.costPerMillion,
        defaultModel: meta.defaultModel,
        error: check?.error,
      };
    });

    return NextResponse.json({
      success: true,
      providers,
      data: providers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to inspect AI providers" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, provider, prompt, model } = body;

    const adapter = aiRouter.getAdapter(provider);
    if (!adapter) {
      return NextResponse.json(
        { success: false, error: `Unknown provider: ${provider}` },
        { status: 400 }
      );
    }

    if (action === "test_connection") {
      const start = performance.now();
      const available = await adapter.isAvailable();
      const latencyMs = Math.round(performance.now() - start);

      return NextResponse.json({
        success: true,
        provider,
        available,
        latencyMs,
        status: available ? "HEALTHY" : "UNAVAILABLE",
      });
    }

    if (action === "test_inference") {
      const start = performance.now();
      const testPrompt = prompt || "Hello Antigravity. Confirm connectivity in 5 words or less.";
      const response = await adapter.complete({
        prompt: testPrompt,
        model,
        maxTokens: 30,
        temperature: 0.1,
        timeoutMs: 15000,
      });

      return NextResponse.json({
        success: true,
        provider,
        model: response.model,
        content: response.content,
        latencyMs: response.latencyMs,
        promptTokens: response.promptTokens,
        completionTokens: response.completionTokens,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unsupported action: ${action}. Expected 'test_connection' or 'test_inference'.` },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Inference or connection test failed" },
      { status: 500 }
    );
  }
}
