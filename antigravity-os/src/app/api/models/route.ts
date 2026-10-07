import { NextRequest, NextResponse } from "next/server";
import { aiRouter } from "@/server/ai/router";
import { env } from "@/config/env";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const healthChecks = await aiRouter.checkAllProviders();
    const checkMap = new Map(healthChecks.map(c => [c.name, c.available]));

    // Query Ollama local models dynamically if available
    let ollamaModels: Array<{ id: string; provider: string; contextWindow: number; tier: string; status: string }> = [];
    if (checkMap.get("ollama")) {
      try {
        const res = await fetch(`${env.server.OLLAMA_BASE_URL}/api/tags`, { signal: AbortSignal.timeout(1200) });
        if (res.ok) {
          const data = await res.json();
          ollamaModels = (data.models || []).map((m: any) => ({
            id: m.name,
            provider: "ollama",
            contextWindow: 32768,
            tier: "local_free",
            status: "online",
          }));
        }
      } catch {
        // Fallback to offline placeholder
      }
    }
    if (ollamaModels.length === 0) {
      ollamaModels = [
        { id: "qwen2.5-coder:7b", provider: "ollama", contextWindow: 32768, tier: "local_free", status: checkMap.get("ollama") ? "online" : "offline" }
      ];
    }

    const staticKnownModels = [
      { id: "llama-3.3-70b-versatile", provider: "groq", contextWindow: 128000, tier: "cloud_ultra_fast", status: checkMap.get("groq") ? "online" : "config_required" },
      { id: "gemini-2.5-flash", provider: "gemini", contextWindow: 1048576, tier: "multi_key_pool", status: checkMap.get("gemini") ? "online" : "config_required" },
      { id: "gpt-4o-mini", provider: "openai", contextWindow: 128000, tier: "multi_key_pool", status: checkMap.get("openai") ? "online" : "config_required" },
      { id: "gpt-4o", provider: "openai", contextWindow: 128000, tier: "multi_key_pool", status: checkMap.get("openai") ? "online" : "config_required" },
      { id: "deepseek-chat", provider: "deepseek", contextWindow: 65536, tier: "cloud_reasoning", status: checkMap.get("deepseek") ? "online" : "config_required" },
      { id: "meta-llama/llama-3.3-70b-instruct:free", provider: "openrouter", contextWindow: 131072, tier: "free_mesh", status: checkMap.get("openrouter") ? "online" : "config_required" },
      { id: "nvidia/nemotron-3.5-lightning-30b-a3b", provider: "nvidia", contextWindow: 65536, tier: "cloud_enterprise", status: checkMap.get("nvidia") ? "online" : "config_required" },
      { id: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B", provider: "airllm", contextWindow: 32768, tier: "local_offload", status: checkMap.get("airllm") ? "online" : "offline" },
    ];

    const allModels = [...ollamaModels, ...staticKnownModels];

    return NextResponse.json({
      success: true,
      models: allModels,
      data: allModels,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list models" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt = "", policy = "BALANCED", taskCategory } = body;

    const lower = prompt.toLowerCase();
    let detectedCategory = taskCategory;
    if (!detectedCategory) {
      if (lower.includes("code") || lower.includes("refactor") || lower.includes("function") || lower.includes("bug") || lower.includes("typescript")) {
        detectedCategory = "CODE";
      } else if (lower.includes("architect") || lower.includes("why") || lower.includes("reason") || lower.includes("math") || lower.includes("proof")) {
        detectedCategory = "REASONING";
      } else if (lower.includes("quick") || lower.includes("summary") || lower.includes("short")) {
        detectedCategory = "FAST";
      } else if (lower.includes("write") || lower.includes("story") || lower.includes("poem") || lower.includes("creative")) {
        detectedCategory = "CREATIVE";
      } else {
        detectedCategory = "GENERAL";
      }
    }

    const priorityChain = aiRouter.getPriorityChain(detectedCategory);
    const healthChecks = await aiRouter.checkAllProviders();
    const checkMap = new Map(healthChecks.map(c => [c.name, c.available]));

    // Find first available provider in priority chain
    let selectedProvider = priorityChain[0];
    for (const p of priorityChain) {
      if (checkMap.get(p)) {
        selectedProvider = p;
        break;
      }
    }

    const fallbacks = priorityChain.filter(p => p !== selectedProvider).slice(0, 3);

    const modelMap: Record<string, string> = {
      ollama: "qwen2.5-coder:7b (Local GPU)",
      groq: "llama-3.3-70b-versatile (500+ tok/s)",
      openai: "gpt-4o-mini (Multi-Key)",
      gemini: "gemini-2.5-flash (1M Context)",
      deepseek: "deepseek-chat (V3)",
      openrouter: "meta-llama/llama-3.3-70b (Free Mesh)",
      nvidia: "nemotron-3.5-lightning (NIM)",
      airllm: "DeepSeek-R1-Distill-14B (Layer-by-Layer)",
    };

    return NextResponse.json({
      success: true,
      provider: selectedProvider,
      model: modelMap[selectedProvider] || "Default",
      category: detectedCategory,
      reason: `Classified as ${detectedCategory} task under ${policy} policy. Selected ${selectedProvider.toUpperCase()} for optimal throughput and zero budget leak.`,
      fallback: fallbacks.join(" -> ") || "None",
      priorityChain,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to simulate routing" },
      { status: 500 }
    );
  }
}
