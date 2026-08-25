import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { benchmarkRunner } from "@/server/benchmark/benchmark-runner";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await benchmarkRunner.runBenchmark(id);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
