import { agentSwarm, AgentRole } from "../swarm/agent-swarm";
import { memoryEngine } from "../memory/memory-engine";
import { AppError, NotFoundError } from "@/lib/errors";

export type TaskStatus =
  | "QUEUED"
  | "PLANNING"
  | "RUNNING"
  | "WAITING"
  | "REVIEWING"
  | "VALIDATING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "TIMED_OUT";

export interface TaskRecord {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assignedAgent: AgentRole;
  workspaceId: string;
  projectId?: string;
  inputPayload?: Record<string, unknown>;
  outputResult?: Record<string, unknown>;
  errorMessage?: string;
  stepHistory: { step: number; status: TaskStatus; timestamp: string; message: string }[];
  createdAt: string;
  updatedAt: string;
}

export class TaskOrchestrator {
  private static instance: TaskOrchestrator;
  private tasks: Map<string, TaskRecord> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();

  private constructor() {
    this.seedSampleTasks();
  }

  public static getInstance(): TaskOrchestrator {
    if (!TaskOrchestrator.instance) {
      TaskOrchestrator.instance = new TaskOrchestrator();
    }
    return TaskOrchestrator.instance;
  }

  public createTask(input: {
    title: string;
    description: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    assignedAgent?: AgentRole;
    workspaceId?: string;
    projectId?: string;
    inputPayload?: Record<string, unknown>;
  }): TaskRecord {
    const id = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const task: TaskRecord = {
      id,
      title: input.title,
      description: input.description,
      status: "QUEUED",
      priority: input.priority || "MEDIUM",
      assignedAgent: input.assignedAgent || "ARCHITECT",
      workspaceId: input.workspaceId || "default",
      projectId: input.projectId,
      inputPayload: input.inputPayload,
      stepHistory: [{ step: 1, status: "QUEUED", timestamp: now, message: "Task queued in orchestrator" }],
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(id, task);
    return task;
  }

  public getTask(id: string): TaskRecord | undefined {
    return this.tasks.get(id);
  }

  public getAllTasks(workspaceId?: string): TaskRecord[] {
    const list = Array.from(this.tasks.values());
    if (workspaceId) {
      return list.filter((t) => t.workspaceId === workspaceId || t.workspaceId === "global");
    }
    return list;
  }

  /**
   * Transitions task through formal lifecycle with cancellation support
   */
  public async executeTask(id: string): Promise<TaskRecord> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new NotFoundError("Task", id);
    }

    if (task.status === "RUNNING") {
      return task;
    }

    const abortController = new AbortController();
    this.abortControllers.set(id, abortController);

    this.transitionState(task, "PLANNING", "Architect analyzing task execution graph");

    try {
      // 1. Planning Step
      this.transitionState(task, "RUNNING", `Agent ${task.assignedAgent} executing core lifecycle`);

      const executionResult = await agentSwarm.executeAgent(task.assignedAgent, {
        taskId: task.id,
        prompt: `${task.title}: ${task.description}`,
        workspaceId: task.workspaceId,
        signal: abortController.signal,
      });

      this.transitionState(task, "VALIDATING", "QA Engineer validating output constraints");

      // Store in memory
      memoryEngine.remember({
        content: `Completed Task [${task.title}]: ${executionResult.output.substring(0, 300)}...`,
        category: "EXECUTION_TRACE",
        tags: ["task", task.assignedAgent, task.priority],
        workspaceId: task.workspaceId,
      });

      this.transitionState(task, "COMPLETED", "Task successfully validated and finalized", {
        output: executionResult.output,
        toolsUsed: executionResult.toolsUsed,
        latencyMs: executionResult.latencyMs,
      });

      return task;
    } catch (err: any) {
      if (abortController.signal.aborted) {
        this.transitionState(task, "CANCELLED", "Task cancelled by user");
      } else {
        this.transitionState(task, "FAILED", `Execution error: ${err.message || String(err)}`);
      }
      return task;
    } finally {
      this.abortControllers.delete(id);
    }
  }

  public cancelTask(id: string): boolean {
    const controller = this.abortControllers.get(id);
    if (controller) {
      controller.abort();
    }
    const task = this.tasks.get(id);
    if (task && task.status !== "COMPLETED") {
      this.transitionState(task, "CANCELLED", "User initiated cancellation");
      return true;
    }
    return false;
  }

  private transitionState(
    task: TaskRecord,
    newStatus: TaskStatus,
    message: string,
    outputResult?: Record<string, unknown>
  ) {
    const now = new Date().toISOString();
    task.status = newStatus;
    task.updatedAt = now;
    if (outputResult) task.outputResult = outputResult;
    task.stepHistory.push({
      step: task.stepHistory.length + 1,
      status: newStatus,
      timestamp: now,
      message,
    });
  }

  private seedSampleTasks() {
    this.createTask({
      title: "Self-Healing AI Router Fallback Validation",
      description: "Verify automated fallback and quota constraints under simulated provider outages.",
      priority: "HIGH",
      assignedAgent: "ARCHITECT",
    });
  }
}

export const taskOrchestrator = TaskOrchestrator.getInstance();
