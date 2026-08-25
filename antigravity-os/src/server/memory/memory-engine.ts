export interface MemoryEntry {
  id: string;
  content: string;
  category: "GENERAL" | "CODE_PATTERN" | "ARCHITECTURE" | "BUG_FIX" | "EXECUTION_TRACE";
  tags: string[];
  workspaceId: string;
  projectId?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface GraphNode {
  id: string;
  label: string;
  nodeType: "FILE" | "SERVICE" | "AGENT" | "TOOL" | "CONCEPT";
  workspaceId: string;
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  relation: "CALLS" | "IMPORTS" | "DEFINES" | "DEPENDS_ON" | "ORCHESTRATES";
}

export class UnifiedMemoryEngine {
  private static instance: UnifiedMemoryEngine;
  private memories: Map<string, MemoryEntry> = new Map();
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];

  private constructor() {
    this.seedInitialKnowledge();
  }

  public static getInstance(): UnifiedMemoryEngine {
    if (!UnifiedMemoryEngine.instance) {
      UnifiedMemoryEngine.instance = new UnifiedMemoryEngine();
    }
    return UnifiedMemoryEngine.instance;
  }

  public remember(entry: Omit<MemoryEntry, "id" | "createdAt">): MemoryEntry {
    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullEntry: MemoryEntry = {
      ...entry,
      id,
      createdAt: new Date().toISOString(),
    };
    this.memories.set(id, fullEntry);
    return fullEntry;
  }

  public retrieve(workspaceId: string, query: string, category?: string, limit = 5): MemoryEntry[] {
    const results: MemoryEntry[] = [];
    const qLower = query.toLowerCase();

    for (const mem of this.memories.values()) {
      if (mem.workspaceId !== workspaceId && mem.workspaceId !== "global") continue;
      if (category && mem.category !== category) continue;

      if (
        mem.content.toLowerCase().includes(qLower) ||
        mem.tags.some((t) => t.toLowerCase().includes(qLower))
      ) {
        results.push(mem);
      }

      if (results.length >= limit) break;
    }

    return results;
  }

  public addNode(node: GraphNode) {
    this.nodes.set(node.id, node);
  }

  public addEdge(edge: GraphEdge) {
    this.edges.push(edge);
  }

  public getGraph(workspaceId: string) {
    const nodes = Array.from(this.nodes.values()).filter(
      (n) => n.workspaceId === workspaceId || n.workspaceId === "global"
    );
    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = this.edges.filter((e) => nodeIds.has(e.sourceId) && nodeIds.has(e.targetId));

    return { nodes, edges };
  }

  private seedInitialKnowledge() {
    this.remember({
      content: "Antigravity OS uses Next.js 15 App Router, React 19, and Tailwind CSS with real-time SSE streaming.",
      category: "ARCHITECTURE",
      tags: ["nextjs", "antigravity-os", "architecture"],
      workspaceId: "global",
    });

    this.remember({
      content: "AI Router supports Ollama GPU offload, DeepSeek reasoning, and OpenRouter free mesh fallback.",
      category: "ARCHITECTURE",
      tags: ["ai-router", "fallback", "ollama"],
      workspaceId: "global",
    });
  }
}

export const memoryEngine = UnifiedMemoryEngine.getInstance();
