/**
 * ANTIGRAVITY OS — PERSONAL INTELLIGENCE V1
 * memory-store.ts: Persistent, inspectable, user-isolated Personal Memory Fabric
 */

import { prisma } from "../db";
import { HermesPolicy } from "@/plugins/hermes/HermesPolicy";
import {
  PersonalMemoryRecord,
  MemoryCategory,
  MemorySourceType,
  SensitivityLevel,
} from "./types";

export interface CreateMemoryParams {
  userId: string;
  category: MemoryCategory;
  content: string;
  summary?: string;
  sourceType?: MemorySourceType;
  sourceReference?: string;
  confidence?: number;
  importance?: number;
  pinned?: boolean;
  userConfirmed?: boolean;
  sensitivity?: SensitivityLevel;
  expiresAt?: Date | null;
}

export interface UpdateMemoryParams {
  category?: MemoryCategory;
  content?: string;
  summary?: string;
  importance?: number;
  pinned?: boolean;
  userConfirmed?: boolean;
  sensitivity?: SensitivityLevel;
  expiresAt?: Date | null;
}

export interface MemoryFilterParams {
  category?: MemoryCategory;
  pinnedOnly?: boolean;
  userConfirmedOnly?: boolean;
  includeDeleted?: boolean;
  sensitivityMax?: SensitivityLevel;
  limit?: number;
  offset?: number;
}

export class PersonalMemoryStore {
  private static instance: PersonalMemoryStore;

  private constructor() {}

  public static getInstance(): PersonalMemoryStore {
    if (!PersonalMemoryStore.instance) {
      PersonalMemoryStore.instance = new PersonalMemoryStore();
    }
    return PersonalMemoryStore.instance;
  }

  /**
   * Creates a new persistent memory with automatic secret redaction and deduplication
   */
  public async createMemory(params: CreateMemoryParams): Promise<PersonalMemoryRecord> {
    if (!params.userId) throw new Error("Memory store requires a valid userId");
    if (!params.content || params.content.trim().length === 0) {
      throw new Error("Memory content cannot be empty");
    }

    // 1. Sanitize input & redact potential secrets (API keys, passwords, bearer tokens)
    const { redactedText: sanitizedContent } = HermesPolicy.redactSecrets(params.content.trim());
    const rawSummary = params.summary?.trim() || sanitizedContent.substring(0, 120);
    const { redactedText: sanitizedSummary } = HermesPolicy.redactSecrets(rawSummary);

    // 2. Duplicate detection
    const existing = await prisma.personalMemory.findFirst({
      where: {
        userId: params.userId,
        content: sanitizedContent,
        deletedAt: null,
      },
    });

    if (existing) {
      // Refresh access time and return existing
      const updated = await prisma.personalMemory.update({
        where: { id: existing.id },
        data: {
          lastAccessedAt: new Date(),
          importance: Math.max(existing.importance, params.importance ?? 3),
        },
      });
      return this.mapToRecord(updated);
    }

    // 3. Create persistent record
    const created = await prisma.personalMemory.create({
      data: {
        userId: params.userId,
        category: params.category || "GENERAL",
        content: sanitizedContent,
        summary: sanitizedSummary,
        sourceType: params.sourceType || "USER_EXPLICIT",
        sourceReference: params.sourceReference || null,
        confidence: params.confidence ?? 1.0,
        importance: params.importance ?? 3,
        pinned: params.pinned ?? false,
        userConfirmed: params.userConfirmed ?? false,
        sensitivity: params.sensitivity || "PRIVATE",
        expiresAt: params.expiresAt || null,
        lastAccessedAt: new Date(),
      },
    });

    return this.mapToRecord(created);
  }

  /**
   * Retrieves memories for a specific user with strict ownership isolation
   */
  public async getMemories(
    userId: string,
    filters: MemoryFilterParams = {}
  ): Promise<PersonalMemoryRecord[]> {
    if (!userId) return [];

    const now = new Date();
    const whereClause: any = {
      userId,
      AND: [
        filters.includeDeleted ? {} : { deletedAt: null },
        {
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      ],
    };

    if (filters.category) {
      whereClause.category = filters.category;
    }
    if (filters.pinnedOnly) {
      whereClause.pinned = true;
    }
    if (filters.userConfirmedOnly) {
      whereClause.userConfirmed = true;
    }

    const records = await prisma.personalMemory.findMany({
      where: whereClause,
      orderBy: [
        { pinned: "desc" },
        { importance: "desc" },
        { updatedAt: "desc" },
      ],
      take: filters.limit || 50,
      skip: filters.offset || 0,
    });

    return records.map((r) => this.mapToRecord(r));
  }

  /**
   * Retrieves a single memory by ID with strict ownership validation
   */
  public async getMemoryById(id: string, userId: string): Promise<PersonalMemoryRecord | null> {
    const memory = await prisma.personalMemory.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!memory) return null;

    // Update last accessed time
    await prisma.personalMemory.update({
      where: { id: memory.id },
      data: { lastAccessedAt: new Date() },
    }).catch(() => {});

    return this.mapToRecord(memory);
  }

  /**
   * Updates an existing memory with ownership verification
   */
  public async updateMemory(
    id: string,
    userId: string,
    updates: UpdateMemoryParams
  ): Promise<PersonalMemoryRecord> {
    const existing = await prisma.personalMemory.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!existing) {
      throw new Error(`Memory record not found or unauthorized: ${id}`);
    }

    const data: any = {};
    if (updates.category) data.category = updates.category;
    if (updates.content) {
      const { redactedText } = HermesPolicy.redactSecrets(updates.content.trim());
      data.content = redactedText;
    }
    if (updates.summary) {
      const { redactedText } = HermesPolicy.redactSecrets(updates.summary.trim());
      data.summary = redactedText;
    }
    if (updates.importance !== undefined) data.importance = updates.importance;
    if (updates.pinned !== undefined) data.pinned = updates.pinned;
    if (updates.userConfirmed !== undefined) data.userConfirmed = updates.userConfirmed;
    if (updates.sensitivity) data.sensitivity = updates.sensitivity;
    if (updates.expiresAt !== undefined) data.expiresAt = updates.expiresAt;

    const updated = await prisma.personalMemory.update({
      where: { id },
      data,
    });

    return this.mapToRecord(updated);
  }

  /**
   * Deletes a memory (soft-delete by default, or permanent on request)
   */
  public async deleteMemory(id: string, userId: string, permanent = false): Promise<boolean> {
    const existing = await prisma.personalMemory.findFirst({
      where: { id, userId },
    });
    if (!existing) return false;

    if (permanent) {
      await prisma.personalMemory.delete({ where: { id } });
    } else {
      await prisma.personalMemory.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    }

    return true;
  }

  /**
   * Searches memories using keyword relevance, token overlap, and recency scoring
   */
  public async searchMemories(
    userId: string,
    query: string,
    limit = 10
  ): Promise<Array<PersonalMemoryRecord & { score: number }>> {
    const memories = await this.getMemories(userId, { limit: 150 });
    const qLower = query.toLowerCase().trim();
    const queryTokens = qLower.split(/\s+/).filter((t) => t.length > 2);

    const scored: Array<PersonalMemoryRecord & { score: number }> = [];

    for (const mem of memories) {
      let score = 0;
      const contentLower = mem.content.toLowerCase();
      const summaryLower = mem.summary.toLowerCase();

      // Exact substring match
      if (contentLower.includes(qLower)) {
        score += 10.0;
      }
      if (summaryLower.includes(qLower)) {
        score += 8.0;
      }

      // Token overlap
      for (const token of queryTokens) {
        if (contentLower.includes(token)) score += 2.0;
        if (summaryLower.includes(token)) score += 1.5;
        if (mem.category.toLowerCase().includes(token)) score += 3.0;
      }

      // Metadata boost
      if (mem.pinned) score += 4.0;
      if (mem.userConfirmed) score += 2.0;
      score += (mem.importance / 5) * 2.0;

      // Recency factor (within last 7 days gets up to 1.5 boost)
      const ageDays = (Date.now() - new Date(mem.lastAccessedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (ageDays < 7) {
        score += (7 - ageDays) * 0.2;
      }

      if (score > 0) {
        scored.push({ ...mem, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }

  /**
   * Exports memories as sanitized JSON for backup or migration
   */
  public async exportMemories(userId: string): Promise<object> {
    const memories = await this.getMemories(userId, { limit: 1000 });
    return {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      userId,
      count: memories.length,
      memories: memories.map((m) => ({
        id: m.id,
        category: m.category,
        content: m.content,
        summary: m.summary,
        sourceType: m.sourceType,
        sourceReference: m.sourceReference,
        confidence: m.confidence,
        importance: m.importance,
        pinned: m.pinned,
        userConfirmed: m.userConfirmed,
        sensitivity: m.sensitivity,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      })),
    };
  }

  private mapToRecord(r: any): PersonalMemoryRecord {
    return {
      id: r.id,
      userId: r.userId,
      category: r.category as MemoryCategory,
      content: r.content,
      summary: r.summary,
      sourceType: r.sourceType as MemorySourceType,
      sourceReference: r.sourceReference,
      confidence: r.confidence,
      importance: r.importance,
      pinned: r.pinned,
      userConfirmed: r.userConfirmed,
      sensitivity: r.sensitivity as SensitivityLevel,
      expiresAt: r.expiresAt ? r.expiresAt.toISOString() : null,
      lastAccessedAt: r.lastAccessedAt ? r.lastAccessedAt.toISOString() : r.createdAt.toISOString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      deletedAt: r.deletedAt ? r.deletedAt.toISOString() : null,
    };
  }
}

export const personalMemoryStore = PersonalMemoryStore.getInstance();
