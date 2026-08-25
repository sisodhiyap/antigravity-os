import { apiSuccess, apiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return apiSuccess({
      ready: true,
      timestamp: new Date().toISOString(),
      subsystems: {
        kernel: "ONLINE",
        orchestrator: "READY",
        swarm: "10_AGENTS_INITIALIZED",
        memory: "SYNCED",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
