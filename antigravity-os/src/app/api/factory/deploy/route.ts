import { NextRequest } from "next/server";
import { authenticateRequest } from "@/server/auth-helper";
import { deploymentManager } from "@/server/factory/deployment-manager";

/**
 * POST /api/factory/deploy
 * Commits the current project directory using Git, verifies, and triggers Vercel/GitHub/Docker deployments.
 */
export async function POST(req: NextRequest) {
  try {
    await authenticateRequest(req);
    const body = await req.json();
    const { projectName, provider } = body;

    if (!projectName) {
      return Response.json({ success: false, error: "Project name is required" }, { status: 400 });
    }

    const deployRecord = await deploymentManager.deploy(projectName, provider || "Vercel");
    return Response.json({ success: true, data: deployRecord });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
