/**
 * ANTIGRAVITY OS v7.0 — HERMES AGENT SUBSYSTEM
 * HermesMCPBridge.ts: Secure MCP Tool Discovery, Validation, and Untrusted Output Containment
 */

import { HermesPolicy } from "./HermesPolicy";

export interface MCPToolDeclaration {
  serverName: string;
  toolName: string;
  description: string;
  parameters: Record<string, unknown>;
  isApproved: boolean;
}

export interface MCPInvocationResult {
  serverName: string;
  toolName: string;
  rawResponse: unknown;
  sanitizedResponse: unknown;
  isSafeData: boolean;
  neutralizedThreats: string[];
  executionTimeMs: number;
}

export class HermesMCPBridge {
  private static readonly approvedServers: Set<string> = new Set([
    "blender", "github", "playwright", "prisma", "supabase", "memory", "visualization"
  ]);

  private static readonly declaredTools: Map<string, MCPToolDeclaration> = new Map();

  public static registerMCPTool(declaration: MCPToolDeclaration): boolean {
    if (!this.approvedServers.has(declaration.serverName)) {
      return false; // Server not in approved list
    }
    const key = `${declaration.serverName}:${declaration.toolName}`;
    this.declaredTools.set(key, declaration);
    return true;
  }

  public static getDeclaredTools(): MCPToolDeclaration[] {
    return Array.from(this.declaredTools.values());
  }

  /**
   * Safely invokes an MCP tool, sanitizing and containing untrusted outputs
   */
  public static async executeMCPTool(
    serverName: string,
    toolName: string,
    args: Record<string, unknown>,
    rawExecutor?: (server: string, tool: string, a: Record<string, unknown>) => Promise<unknown>
  ): Promise<MCPInvocationResult> {
    const key = `${serverName}:${toolName}`;
    if (!this.declaredTools.has(key) && !this.approvedServers.has(serverName)) {
      throw new Error(`UNAUTHORIZED_MCP_TOOL: ${key} is not registered or approved`);
    }

    const start = Date.now();
    let rawOutput: unknown = null;

    if (rawExecutor) {
      rawOutput = await rawExecutor(serverName, toolName, args);
    } else {
      rawOutput = { status: "success", server: serverName, tool: toolName, processedArgs: args };
    }

    const duration = Date.now() - start;
    const serialized = typeof rawOutput === "string" ? rawOutput : JSON.stringify(rawOutput);

    // Sanitize untrusted output — ensure external payload is data only
    const { safeText, injectionDetected, flags } = HermesPolicy.sanitizeExternalData(serialized);
    const { redactedText } = HermesPolicy.redactSecrets(safeText);

    let parsedOutput: unknown;
    try {
      parsedOutput = JSON.parse(redactedText);
    } catch {
      parsedOutput = redactedText;
    }

    return {
      serverName,
      toolName,
      rawResponse: rawOutput,
      sanitizedResponse: parsedOutput,
      isSafeData: !injectionDetected,
      neutralizedThreats: flags,
      executionTimeMs: duration
    };
  }
}
