/**
 * Antigravity Optimized Harness - Memory Policy Engine
 * L0 (Task Memory) -> L1 (Project Memory) -> L2 (Long-term Memory)
 * Prevents massive context dumps and deduplicates knowledge injection.
 */

export interface MemoryQuery {
  taskId: string;
  topic?: string;
  maxL1Items?: number;
  maxL2Items?: number;
}

export class MemoryPolicyManager {
  private l0TaskMemory: Map<string, string[]> = new Map();
  private l1ProjectFacts: string[] = [
    'Antigravity router: Port 8080, OpenAI compatible /v1',
    'Providers: Ollama (local), OpenRouter (free tier), Google Gemini Pool, Router9',
    'Runtime: TypeScript ESM with tsx engine'
  ];
  private l2LongTermMemory: string[] = [];

  public addTaskFact(taskId: string, fact: string) {
    const existing = this.l0TaskMemory.get(taskId) || [];
    existing.push(fact);
    this.l0TaskMemory.set(taskId, existing);
  }

  public getRelevantMemory(query: MemoryQuery): string[] {
    const memory: string[] = [];

    // L0: Always loaded for current task
    const l0 = this.l0TaskMemory.get(query.taskId) || [];
    memory.push(...l0);

    // L1: Loaded selectively
    const maxL1 = query.maxL1Items || 3;
    if (query.topic) {
      const topicLower = query.topic.toLowerCase();
      const filteredL1 = this.l1ProjectFacts.filter(f => f.toLowerCase().includes(topicLower));
      memory.push(...filteredL1.slice(0, maxL1));
    } else {
      memory.push(...this.l1ProjectFacts.slice(0, maxL1));
    }

    // L2: Loaded only if explicitly needed and query matches
    if (query.topic && (query.maxL2Items || 0) > 0) {
      const topicLower = query.topic.toLowerCase();
      const filteredL2 = this.l2LongTermMemory.filter(f => f.toLowerCase().includes(topicLower));
      memory.push(...filteredL2.slice(0, query.maxL2Items));
    }

    return [...new Set(memory)];
  }
}

export const memoryPolicyManager = new MemoryPolicyManager();
