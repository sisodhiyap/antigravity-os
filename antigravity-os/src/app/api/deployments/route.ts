import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { deploymentOrchestrator } from "@/server/deployment/deployment-orchestrator";
import { rollbackOrchestrator } from "@/server/deployment/rollback-orchestrator";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rollbackHistory = rollbackOrchestrator.getRollbackHistory();
    return apiSuccess({
      providers: ["local_staging", "vercel", "netlify"],
      rollbackHistory,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await deploymentOrchestrator.executeStagingPipeline({
      projectId: body.projectId || "proj_default",
      workspaceId: body.workspaceId || "ws_default",
      version: body.version || "1.0.0",
      providerName: body.providerName || "local_staging",
    });

    return apiSuccess(result, undefined, 201);
  } catch (err) {
    return apiError(err);
  }
}
