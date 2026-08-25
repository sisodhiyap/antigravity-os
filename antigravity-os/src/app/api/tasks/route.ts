import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, apiError } from "@/lib/api-response";
import { taskOrchestrator } from "@/server/orchestrator/task-orchestrator";
import { ValidationError } from "@/lib/errors";

export const dynamic = "force-dynamic";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  assignedAgent: z.string().optional(),
  workspaceId: z.string().default("default"),
  projectId: z.string().optional(),
  autoExecute: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId") || undefined;
    const tasks = taskOrchestrator.getAllTasks(workspaceId);
    return apiSuccess(tasks);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid task payload", parsed.error.format());
    }

    const task = taskOrchestrator.createTask({
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      assignedAgent: parsed.data.assignedAgent as any,
      workspaceId: parsed.data.workspaceId,
      projectId: parsed.data.projectId,
    });

    if (parsed.data.autoExecute) {
      // Trigger execution asynchronously
      taskOrchestrator.executeTask(task.id).catch((err) => {
        console.error(`Task ${task.id} background execution error:`, err);
      });
    }

    return apiSuccess(task, undefined, 201);
  } catch (error) {
    return apiError(error);
  }
}
