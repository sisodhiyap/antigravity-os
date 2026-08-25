import { apiSuccess, apiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const models = [
      { id: "qwen2.5-coder:7b", provider: "ollama", contextWindow: 32768, tier: "local_free", status: "online" },
      { id: "deepseek-chat", provider: "deepseek", contextWindow: 65536, tier: "payg", status: "online" },
      { id: "meta-llama/llama-3.3-70b-instruct:free", provider: "openrouter", contextWindow: 131072, tier: "free_mesh", status: "online" },
      { id: "gemini-2.5-flash", provider: "gemini", contextWindow: 1048576, tier: "multi_key_pool", status: "online" },
      { id: "gpt-4o", provider: "openai", contextWindow: 128000, tier: "multi_key_pool", status: "online" },
    ];
    return apiSuccess(models);
  } catch (error) {
    return apiError(error);
  }
}
