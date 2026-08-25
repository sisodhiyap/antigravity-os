/**
 * Antigravity Production-Grade Adaptive Harness - Anti-Loop V2
 * Configurable protections against recursion, duplicate prompts, and review loop storms.
 */

export interface AntiLoopLimits {
  maxSpawnDepth: number;
  maxRetries: number;
  maxReviewRounds: number;
  maxDuplicateAttempts: number;
}

export class AntiLoopGuard {
  private promptHistory: Map<string, number> = new Map();
  private recursionDepth: Map<string, number> = new Map();
  private limits: AntiLoopLimits;

  constructor(customLimits?: Partial<AntiLoopLimits>) {
    this.limits = {
      maxSpawnDepth: 2,
      maxRetries: 1,
      maxReviewRounds: 1,
      maxDuplicateAttempts: 1,
      ...customLimits
    };
  }

  public checkPromptLoop(prompt: string): boolean {
    const hash = prompt.trim().slice(0, 150);
    const count = (this.promptHistory.get(hash) || 0) + 1;
    this.promptHistory.set(hash, count);
    return count > this.limits.maxDuplicateAttempts;
  }

  public trackSpawn(parentId: string, childId: string): boolean {
    const currentDepth = this.recursionDepth.get(parentId) || 0;
    if (currentDepth >= this.limits.maxSpawnDepth) {
      return false; // Prohibit recursion beyond max depth
    }
    this.recursionDepth.set(childId, currentDepth + 1);
    return true;
  }

  public resetTask(taskId: string) {
    this.recursionDepth.delete(taskId);
  }
}

export const antiLoopGuard = new AntiLoopGuard();
