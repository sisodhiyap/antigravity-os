import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, apiError } from "@/lib/api-response";
import { memoryEngine } from "@/server/memory/memory-engine";
import { ValidationError } from "@/lib/errors";

export const dynamic = "force-dynamic";

const addMemorySchema = z.object({
  content: z.string().min(1, "Content is required"),
  category: z.enum(["GENERAL", "CODE_PATTERN", "ARCHITECTURE", "BUG_FIX", "EXECUTION_TRACE"]).default("GENERAL"),
  tags: z.array(z.string()).default([]),
  workspaceId: z.string().default("default"),
  projectId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId") || "default";
    const query = searchParams.get("query") || "";
    const category = searchParams.get("category") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 10;

    const memories = memoryEngine.retrieve(workspaceId, query, category, limit);
    const graph = memoryEngine.getGraph(workspaceId);

    return apiSuccess({ memories, graph });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = addMemorySchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid memory payload", parsed.error.format());
    }

    const memory = memoryEngine.remember(parsed.data);
    return apiSuccess(memory, undefined, 201);
  } catch (error) {
    return apiError(error);
  }
}
