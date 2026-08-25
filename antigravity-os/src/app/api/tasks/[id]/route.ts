import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { taskOrchestrator } from "@/server/orchestrator/task-orchestrator";
import { NotFoundError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = taskOrchestrator.getTask(id);

    if (!task) {
      throw new NotFoundError("Task", id);
    }

    return apiSuccess(task);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updatedTask = await taskOrchestrator.executeTask(id);
    return apiSuccess(updatedTask);
  } catch (error) {
    return apiError(error);
  }
}
