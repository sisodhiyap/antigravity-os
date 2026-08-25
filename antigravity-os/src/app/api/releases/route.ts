import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { releaseStateMachine } from "@/server/deployment/release-state-machine";
import { deploymentOrchestrator } from "@/server/deployment/deployment-orchestrator";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const releases = releaseStateMachine.listReleases();
    return apiSuccess({
      releases,
      total: releases.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === "PROMOTE_TO_PRODUCTION") {
      const result = await deploymentOrchestrator.promoteToProduction(
        body.releaseId,
        body.approver || "Operator",
        body.decision || "APPROVED"
      );
      return apiSuccess(result);
    }

    const newRelease = releaseStateMachine.createRelease({
      projectId: body.projectId || "proj_default",
      workspaceId: body.workspaceId || "ws_default",
      version: body.version || "1.0.0",
      environment: body.environment || "staging",
      provider: body.provider || "local_staging",
    });

    return apiSuccess(newRelease, undefined, 201);
  } catch (err) {
    return apiError(err);
  }
}
