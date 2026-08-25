import { apiSuccess, apiError } from "@/lib/api-response";
import { quotaEngine } from "@/server/ai/quota";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = quotaEngine.getAllStats();
    return apiSuccess(stats);
  } catch (error) {
    return apiError(error);
  }
}
