import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { taskOrchestrator } from "@/server/orchestrator/task-orchestrator";
import { NotFoundError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = taskOrchestrator.getTask(id);

    if (!task) {
      throw new NotFoundError("Task", id);
    }

    const cancelled = taskOrchestrator.cancelTask(id);
    return apiSuccess({ cancelled, taskId: id, status: task.status });
  } catch (error) {
    return apiError(error);
  }
}
