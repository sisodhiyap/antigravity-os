import { apiSuccess, apiError } from "@/lib/api-response";
import { benchmarkRunner } from "@/server/benchmark/benchmark-runner";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = benchmarkRunner.getBenchmarks();
    return apiSuccess(list);
  } catch (error) {
    return apiError(error);
  }
}
