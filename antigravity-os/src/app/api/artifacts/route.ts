import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, apiError } from "@/lib/api-response";
import { artifactSystem, ArtifactCategory } from "@/server/artifacts/artifact-system";
import { ValidationError } from "@/lib/errors";

export const dynamic = "force-dynamic";

const saveArtifactSchema = z.object({
  name: z.string().min(1),
  category: z.enum([
    "REQUIREMENTS",
    "PRODUCT",
    "UX",
    "ARCHITECTURE",
    "IMPLEMENTATION",
    "TESTING",
    "SECURITY",
    "DEPLOYMENT",
  ]),
  projectId: z.string().default("default"),
  taskId: z.string().default("task_manual"),
  agentRole: z.string().default("BUILDER"),
  source: z.enum(["USER", "SYSTEM", "AI", "TOOL", "TEST"]).default("USER"),
  content: z.any(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || undefined;
    const category = (searchParams.get("category") as ArtifactCategory) || undefined;

    const artifacts = artifactSystem.listArtifacts(projectId, category);
    return apiSuccess(artifacts);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = saveArtifactSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid artifact payload", parsed.error.format());
    }

    const artifact = artifactSystem.saveArtifact(parsed.data);
    return apiSuccess(artifact, undefined, 201);
  } catch (error) {
    return apiError(error);
  }
}
