/**
 * ANTIGRAVITY OS — SOVEREIGN SELF-SUSTAINING AI FABRIC
 * cost/token-optimizer.ts: Token-Saving Strategies including Deterministic Output Caching,
 * Context Minimization, and Redundant Call Deduplication without leaking secrets.
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { CacheEntryMetadata } from "./types";
import { HermesPolicy } from "@/plugins/hermes/HermesPolicy";
import { resolveFabricStoragePath } from "./usage-ledger";

export interface CachedResponse {
  key: string;
  output: string;
  tokensSaved: number;
  metadata: Record<string, any>;
  cachedAt: string;
}

export class TokenOptimizer {
  private static instance: TokenOptimizer;
  private readonly cache: Map<string, { data: CachedResponse; meta: CacheEntryMetadata }> = new Map();
  private readonly ttlMs: number = 24 * 60 * 60 * 1000; // 24-hour default validity
  private readonly storagePath: string;

  public static getInstance(): TokenOptimizer {
    if (!TokenOptimizer.instance) {
      TokenOptimizer.instance = new TokenOptimizer();
    }
    return TokenOptimizer.instance;
  }

  private constructor() {
    this.storagePath = resolveFabricStoragePath("cache.json");
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.storagePath)) {
        const raw = fs.readFileSync(this.storagePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.entries)) {
          for (const item of parsed.entries) {
            if (item.key && item.data && item.meta) {
              // verify not expired
              if (Date.now() <= new Date(item.meta.expiresAt).getTime()) {
                this.cache.set(item.key, { data: item.data, meta: item.meta });
              }
            }
          }
        }
      }
    } catch {
      // Fallback silently if cache loading fails
    }
  }

  private saveToDisk(): void {
    try {
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const entries = Array.from(this.cache.entries()).map(([key, val]) => ({
        key,
        data: val.data,
        meta: val.meta,
      }));
      fs.writeFileSync(
        this.storagePath,
        JSON.stringify({ updatedAt: new Date().toISOString(), count: entries.length, entries }, null, 2),
        "utf-8"
      );
    } catch {
      // Fallback silently if cache saving fails
    }
  }

  /**
   * Generates a deterministic, normalized cache key derived from inputs, model, and config.
   */
  public generateCacheKey(params: {
    taskType: string;
    normalizedPrompt: string;
    model: string;
    workspaceId?: string;
    configFingerprint?: string;
  }): string {
    const rawKey = `${params.workspaceId || "global"}:${params.taskType}:${params.model}:${params.normalizedPrompt.trim().toLowerCase()}:${params.configFingerprint || "v1"}`;
    return crypto.createHash("sha256").update(rawKey).digest("hex");
  }

  /**
   * Looks up a cached deterministic output.
   * Returns undefined if missing, expired, or invalidated.
   */
  public getCachedOutput(key: string): CachedResponse | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check expiration
    if (Date.now() > new Date(entry.meta.expiresAt).getTime()) {
      this.cache.delete(key);
      return undefined;
    }

    entry.meta.accessCount += 1;
    return entry.data;
  }

  /**
   * Stores a deterministic result into cache with secret redaction and token accounting.
   */
  public storeCachedOutput(
    key: string,
    params: {
      taskType: string;
      output: string;
      tokensSaved: number;
      model: string;
      workspaceId?: string;
      metadata?: Record<string, any>;
      customTtlMs?: number;
    }
  ): boolean {
    // Security check: ensure no raw secrets are persisted in cache
    const { safeText, injectionDetected } = HermesPolicy.sanitizeExternalData(params.output);
    const { redactedText: safeOutput } = HermesPolicy.redactSecrets(safeText);

    // If injection was detected in output, refuse to cache
    if (injectionDetected) {
      return false;
    }

    const now = new Date();
    const ttl = params.customTtlMs || this.ttlMs;
    const expiresAt = new Date(now.getTime() + ttl).toISOString();

    const cachedData: CachedResponse = {
      key,
      output: safeOutput,
      tokensSaved: params.tokensSaved,
      metadata: params.metadata || {},
      cachedAt: now.toISOString(),
    };

    const meta: CacheEntryMetadata = {
      key,
      hash: crypto.createHash("sha256").update(safeOutput).digest("hex"),
      workspaceId: params.workspaceId || "global",
      taskType: params.taskType,
      model: params.model,
      tokensSaved: params.tokensSaved,
      createdAt: now.toISOString(),
      expiresAt,
      accessCount: 1,
    };

    this.cache.set(key, { data: cachedData, meta });
    this.saveToDisk();
    return true;
  }

  /**
   * Invalidates caches for a workspace or when underlying files change
   */
  public invalidateWorkspace(workspaceId: string): number {
    let purged = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.meta.workspaceId === workspaceId) {
        this.cache.delete(key);
        purged++;
      }
    }
    if (purged > 0) {
      this.saveToDisk();
    }
    return purged;
  }

  public clearAllCache(): void {
    this.cache.clear();
    this.saveToDisk();
  }

  /**
   * Context Minimization: Slices long history into relevant context and compact summary
   */
  public minimizeContext(
    fullContext: string,
    maxTokenBudget: number = 4000
  ): { minimizedPrompt: string; tokensEstimated: number; wasTruncated: boolean } {
    // Approximate 4 chars per token rule of thumb
    const maxChars = maxTokenBudget * 4;

    if (fullContext.length <= maxChars) {
      return {
        minimizedPrompt: fullContext,
        tokensEstimated: Math.ceil(fullContext.length / 4),
        wasTruncated: false,
      };
    }

    // Extract relevant header, middle slice, and tail
    const sliceSize = Math.floor(maxChars / 2);
    const header = fullContext.substring(0, sliceSize);
    const footer = fullContext.substring(fullContext.length - sliceSize);

    const minimized = `${header}\n\n[... CONTEXT COMPACTED BY ANTIGRAVITY TOKEN GOVERNOR ...]\n\n${footer}`;
    return {
      minimizedPrompt: minimized,
      tokensEstimated: Math.ceil(minimized.length / 4),
      wasTruncated: true,
    };
  }

  public getCacheStats() {
    let totalTokensSaved = 0;
    let totalHits = 0;

    for (const entry of this.cache.values()) {
      totalTokensSaved += entry.meta.tokensSaved * entry.meta.accessCount;
      totalHits += entry.meta.accessCount - 1;
    }

    return {
      activeEntriesCount: this.cache.size,
      totalHitsCount: Math.max(0, totalHits),
      totalTokensSaved,
    };
  }
}

export const tokenOptimizer = TokenOptimizer.getInstance();
