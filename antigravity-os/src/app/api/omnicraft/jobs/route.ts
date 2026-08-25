import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { authenticateRequest } from "@/server/auth-helper";

export async function GET(req: NextRequest) {
  try {
    await authenticateRequest(req);

    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");

    const jobs = await prisma.generationJob.findMany({
      where: projectId ? { projectId } : {},
      orderBy: { startedAt: "desc" },
      take: 100,
    });

    return Response.json({
      success: true,
      data: jobs.map((j) => ({
        jobId: j.jobId,
        projectId: j.projectId,
        capability: j.capability,
        provider: j.provider,
        model: j.model,
        status: j.status,
        executionMode: j.executionMode,
        startedAt: j.startedAt.toISOString(),
        completedAt: j.completedAt?.toISOString() || null,
        errorMessage: j.errorMessage || null,
      })),
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 401 });
  }
}
