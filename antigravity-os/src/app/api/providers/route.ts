import { apiSuccess, apiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const providers = [
      { name: "ollama", type: "LOCAL_GPU", health: "HEALTHY", priority: 1, costPerMillion: 0.0 },
      { name: "deepseek", type: "CLOUD_REASONING", health: "HEALTHY", priority: 2, costPerMillion: 0.28 },
      { name: "openrouter", type: "FREE_SWARM_MESH", health: "HEALTHY", priority: 3, costPerMillion: 0.0 },
      { name: "gemini", type: "MULTI_KEY_POOL", health: "HEALTHY", priority: 4, costPerMillion: 0.075 },
      { name: "openai", type: "MULTI_KEY_POOL", health: "HEALTHY", priority: 5, costPerMillion: 2.5 },
    ];
    return apiSuccess(providers);
  } catch (error) {
    return apiError(error);
  }
}
