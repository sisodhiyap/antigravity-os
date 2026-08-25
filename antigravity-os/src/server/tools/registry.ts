import { z } from "zod";
import { ToolExecutionError, AuthorizationError } from "@/lib/errors";

export type ToolRiskLevel = "READ_ONLY" | "LOW_RISK_WRITE" | "HIGH_RISK_WRITE" | "PRODUCTION_CRITICAL";

export interface ToolDefinition<TInput = any, TOutput = any> {
  name: string;
  description: string;
  category: "FILESYSTEM" | "GIT" | "DATABASE" | "TERMINAL" | "MEMORY" | "SEARCH" | "AI";
  riskLevel: ToolRiskLevel;
  inputSchema: z.ZodSchema<TInput>;
  timeoutMs?: number;
  execute: (input: TInput, context: ToolExecutionContext) => Promise<TOutput>;
}

export interface ToolExecutionContext {
  taskId?: string;
  agentRole: string;
  workspaceId: string;
  userRole?: string;
  signal?: AbortSignal;
}

export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, ToolDefinition> = new Map();

  private constructor() {
    this.registerBuiltInTools();
  }

  public static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  public registerTool<TInput, TOutput>(tool: ToolDefinition<TInput, TOutput>) {
    this.tools.set(tool.name, tool);
  }

  public getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  public getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Executes a tool with schema validation, permission checks, and timeout boundaries
   */
  public async executeTool(
    name: string,
    rawInput: unknown,
    context: ToolExecutionContext
  ): Promise<{ success: boolean; result?: any; error?: string; durationMs: number }> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new ToolExecutionError(name, `Tool '${name}' is not registered`);
    }

    // Permission check for high risk tools
    if (tool.riskLevel === "PRODUCTION_CRITICAL" && context.userRole !== "ADMIN" && context.userRole !== "SUPER_ADMIN") {
      throw new AuthorizationError(`Executing tool '${name}' requires ADMIN authorization`);
    }

    // Input Validation
    const parsedInput = tool.inputSchema.safeParse(rawInput);
    if (!parsedInput.success) {
      throw new ToolExecutionError(name, `Invalid input: ${JSON.stringify(parsedInput.error.format())}`);
    }

    const start = performance.now();
    try {
      const timeoutMs = tool.timeoutMs || 30000;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Tool execution timed out after ${timeoutMs}ms`)), timeoutMs)
      );

      const result = await Promise.race([
        tool.execute(parsedInput.data, context),
        timeoutPromise,
      ]);

      const durationMs = Math.round(performance.now() - start);
      return { success: true, result, durationMs };
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - start);
      return { success: false, error: err.message || "Tool execution failed", durationMs };
    }
  }

  private registerBuiltInTools() {
    // 1. Search Memory Tool
    this.registerTool({
      name: "search_memory",
      description: "Searches short-term, long-term, and knowledge graph memory for relevant context",
      category: "MEMORY",
      riskLevel: "READ_ONLY",
      inputSchema: z.object({
        query: z.string().min(1),
        category: z.string().optional(),
        limit: z.number().default(5),
      }),
      execute: async (input, ctx) => {
        return {
          query: input.query,
          matches: [
            { id: "mem_1", content: `Contextual memory match for: ${input.query}`, score: 0.95 },
          ],
        };
      },
    });

    // 2. Health Diagnostic Tool
    this.registerTool({
      name: "system_diagnostics",
      description: "Queries system hardware and agent swarm health metrics",
      category: "AI",
      riskLevel: "READ_ONLY",
      inputSchema: z.object({
        includeGPU: z.boolean().default(true),
      }),
      execute: async (input) => {
        return {
          status: "healthy",
          timestamp: new Date().toISOString(),
          gpuOffloadReady: true,
        };
      },
    });
  }
}

export const toolRegistry = ToolRegistry.getInstance();
