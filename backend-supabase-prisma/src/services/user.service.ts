import { prisma } from '../lib/prisma/client.js';
import { safeExec } from './base.service.js';
import type { ApiResponse, PaginatedResult, PaginationParams } from '../types/api.types.js';
import type { 
  UserWithProfile, 
  CreateUserInput, 
  UpdateUserInput 
} from '../types/database.types.js';
import type { Prisma } from '@prisma/client';

export class UserService {
  /**
   * Retrieves a user and their profile by primary ID
   */
  static async getById(id: string): Promise<ApiResponse<UserWithProfile | null>> {
    return safeExec(() =>
      prisma.user.findUnique({
        where: { id },
        include: { profile: true },
      })
    );
  }

  /**
   * Retrieves a user and their profile by email address
   */
  static async getByEmail(email: string): Promise<ApiResponse<UserWithProfile | null>> {
    return safeExec(() =>
      prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      })
    );
  }

  /**
   * Creates or registers a new User record with an associated Profile
   */
  static async create(input: CreateUserInput): Promise<ApiResponse<UserWithProfile>> {
    return safeExec(async () => {
      const createdUser = await prisma.user.create({
        data: {
          id: input.id,
          email: input.email,
          role: input.role ?? 'USER',
          profile: {
            create: {
              displayName: input.displayName ?? input.email.split('@')[0],
              avatarUrl: input.avatarUrl,
              bio: input.bio,
              metadata: (input.metadata as Prisma.InputJsonValue) ?? {},
            },
          },
        },
        include: { profile: true },
      });

      // Record audit log
      await prisma.auditLog.create({
        data: {
          action: 'USER_CREATED',
          entityType: 'USER',
          entityId: createdUser.id,
          actorId: createdUser.id,
          metadata: { email: createdUser.email, role: createdUser.role },
        },
      });

      return createdUser;
    });
  }

  /**
   * Updates user metadata, profile information, or system role
   */
  static async update(
    id: string,
    input: UpdateUserInput,
    actorId?: string
  ): Promise<ApiResponse<UserWithProfile>> {
    return safeExec(async () => {
      const updateData: Prisma.UserUpdateInput = {};

      if (input.email) updateData.email = input.email;
      if (input.role) updateData.role = input.role;
      if (input.status) updateData.status = input.status;

      if (input.displayName || input.avatarUrl || input.bio !== undefined || input.metadata) {
        updateData.profile = {
          upsert: {
            create: {
              displayName: input.displayName,
              avatarUrl: input.avatarUrl,
              bio: input.bio,
              metadata: (input.metadata as Prisma.InputJsonValue) ?? {},
            },
            update: {
              displayName: input.displayName,
              avatarUrl: input.avatarUrl,
              bio: input.bio,
              metadata: input.metadata ? (input.metadata as Prisma.InputJsonValue) : undefined,
            },
          },
        };
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        include: { profile: true },
      });

      // Record audit log
      await prisma.auditLog.create({
        data: {
          action: 'USER_UPDATED',
          entityType: 'USER',
          entityId: updatedUser.id,
          actorId: actorId ?? updatedUser.id,
          metadata: { fieldsUpdated: Object.keys(input) },
        },
      });

      return updatedUser;
    });
  }

  /**
   * Lists users with pagination and role filtering
   */
  static async list(
    params: PaginationParams & { role?: CreateUserInput['role'] } = {}
  ): Promise<ApiResponse<PaginatedResult<UserWithProfile>>> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    return safeExec(async () => {
      const where: Prisma.UserWhereInput = {};
      if (params.role) where.role = params.role;

      const [items, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: { profile: true },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
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

  /**
   * Deactivates a user account
   */
  static async deactivate(id: string, actorId?: string): Promise<ApiResponse<UserWithProfile>> {
    return safeExec(async () => {
      const user = await prisma.user.update({
        where: { id },
        data: { status: 'DEACTIVATED' },
        include: { profile: true },
      });

      await prisma.auditLog.create({
        data: {
          action: 'USER_DEACTIVATED',
          entityType: 'USER',
          entityId: user.id,
          actorId: actorId ?? user.id,
        },
      });

      return user;
    });
  }
}
