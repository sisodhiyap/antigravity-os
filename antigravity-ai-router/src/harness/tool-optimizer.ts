/**
 * Antigravity Production-Grade Adaptive Harness - Tool Call Governor
 * Caches idempotent read operations; strictly avoids caching mutable actions;
 * invalidates cached reads whenever a file write or command execution occurs.
 */

import { CreditGovernor } from './credit-governor.js';

export class ToolCallOptimizer {
  private cache: Map<string, { result: any; timestamp: number }> = new Map();
  private ttlMs: number = 60000; // 1 minute read cache

  public isReadOnlyTool(toolName: string): boolean {
    return (
      toolName.startsWith('view_') ||
      toolName.startsWith('read_') ||
      toolName.startsWith('list_') ||
      toolName.startsWith('search_') ||
      toolName.startsWith('grep_')
    );
  }

  public isMutableTool(toolName: string): boolean {
    return (
      toolName.startsWith('write_') ||
      toolName.startsWith('replace_') ||
      toolName.startsWith('multi_replace_') ||
      toolName.startsWith('run_command') ||
      toolName.startsWith('execute_')
    );
  }

  public invalidateCache(targetHint?: string) {
    if (!targetHint) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(targetHint)) {
        this.cache.delete(key);
      }
    }
  }

  public async executeOptimizedToolCall<T>(
    toolName: string,
    args: Record<string, any>,
    governor: CreditGovernor,
    executor: () => Promise<T>
  ): Promise<T> {
    const isRead = this.isReadOnlyTool(toolName);
    const isWrite = this.isMutableTool(toolName);
    const cacheKey = `${toolName}:${JSON.stringify(args)}`;

    // 1. Check read cache
    if (isRead) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.ttlMs) {
        governor.recordToolCall(toolName, true); // Deduplicated hit
        return cached.result as T;
      }
    }

    // 2. Budget permission check
    const check = governor.canExecuteToolCall(toolName);
    if (!check.allowed) {
      throw new Error(`Tool call [${toolName}] blocked: ${check.reason}`);
    }

    // 3. Execute
    const result = await executor();
    governor.recordToolCall(toolName, false);

    // 4. Update cache or invalidate
    if (isRead) {
      this.cache.set(cacheKey, { result, timestamp: Date.now() });
    } else if (isWrite) {
      // Invalidate cache for modified file if TargetFile exists in args
      const target = args?.TargetFile || args?.AbsolutePath || args?.CommandLine || '';
      this.invalidateCache(target);
    }

    return result;
  }
}

export const toolCallOptimizer = new ToolCallOptimizer();
