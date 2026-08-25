import { prisma } from '../lib/prisma/client.js';
import { safeExec } from './base.service.js';
import type { ApiResponse, PaginatedResult, PaginationParams } from '../types/api.types.js';
import type { Task, CreateTaskInput, TaskStatus } from '../types/database.types.js';
import type { Prisma } from '@prisma/client';

export class TaskService {
  /**
   * Retrieves a task by ID including its executions
   */
  static async getById(id: string): Promise<ApiResponse<Task | null>> {
    return safeExec(() =>
      prisma.task.findUnique({
        where: { id },
        include: {
          executions: {
            include: {
              toolExecutions: true,
            },
            orderBy: { stepNumber: 'asc' },
          },
          project: true,
        },
      })
    );
  }

  /**
   * Creates a new Task
   */
  static async create(input: CreateTaskInput): Promise<ApiResponse<Task>> {
    return safeExec(async () => {
      const task = await prisma.task.create({
        data: {
          title: input.title,
          description: input.description,
          priority: input.priority ?? 'MEDIUM',
          assignedAgent: input.assignedAgent,
          organizationId: input.organizationId,
          projectId: input.projectId,
          createdById: input.createdById,
          inputPayload: (input.inputPayload as Prisma.InputJsonValue) ?? {},
          maxIterations: input.maxIterations ?? 25,
          tokenBudget: input.tokenBudget ?? 200000,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: 'TASK_CREATED',
          entityType: 'TASK',
          entityId: task.id,
          actorId: input.createdById,
          metadata: { title: task.title, priority: task.priority },
        },
      });

      return task;
    });
  }

  /**
   * Updates task status and optional output/error
   */
  static async updateStatus(
    id: string,
    status: TaskStatus,
    outputResult?: Record<string, unknown>,
    errorMessage?: string
  ): Promise<ApiResponse<Task>> {
    return safeExec(async () => {
      const now = new Date();
      const updateData: Prisma.TaskUpdateInput = {
        status,
        updatedAt: now,
      };

      if (status === 'RUNNING') {
        updateData.startedAt = now;
      } else if (['COMPLETED', 'FAILED', 'CANCELLED', 'TIMED_OUT'].includes(status)) {
        updateData.completedAt = now;
      }

      if (outputResult !== undefined) {
        updateData.outputResult = outputResult as Prisma.InputJsonValue;
      }
      if (errorMessage !== undefined) {
        updateData.errorMessage = errorMessage;
      }

      return prisma.task.update({
        where: { id },
        data: updateData,
      });
    });
  }

  /**
   * Lists tasks for an organization with pagination
   */
  static async listByOrg(
    organizationId: string,
    params: PaginationParams = {}
  ): Promise<ApiResponse<PaginatedResult<Task>>> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    return safeExec(async () => {
      const [items, total] = await Promise.all([
        prisma.task.findMany({
          where: { organizationId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.task.count({ where: { organizationId } }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        items,
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      };
    });
  }
}
