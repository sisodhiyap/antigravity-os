import { aiRouter } from "../ai/router";
import { toolRegistry, ToolExecutionContext } from "../tools/registry";
import { memoryEngine } from "../memory/memory-engine";
import { AppError } from "@/lib/errors";

export type AgentRole =
  | "PRODUCT_MANAGER"
  | "UX_DESIGNER"
  | "ARCHITECT"
  | "BUILDER"
  | "QA_ENGINEER"
  | "SECURITY_ENGINEER"
  | "DEVOPS_ENGINEER"
  | "CREATIVE_DIRECTOR"
  | "VIDEO_PRODUCER"
  | "STOCK_RESEARCHER";

export interface AgentDefinition {
  role: AgentRole;
  name: string;
  description: string;
  capabilities: string[];
  allowedTools: string[];
  systemInstructions: string;
  preferredCategory: "CODE" | "REASONING" | "FAST" | "CREATIVE" | "GENERAL";
}

export interface AgentExecutionRequest {
  taskId: string;
  prompt: string;
  context?: Record<string, unknown>;
  workspaceId?: string;
  maxIterations?: number;
  signal?: AbortSignal;
}

export interface AgentExecutionResult {
  agentRole: AgentRole;
  status: "SUCCESS" | "FAILED" | "CANCELLED";
  output: string;
  iterations: number;
  toolsUsed: string[];
  latencyMs: number;
  costUsd?: number;
}

export class AgentSwarmEngine {
  private static instance: AgentSwarmEngine;
  private agents: Map<AgentRole, AgentDefinition> = new Map();

  private constructor() {
    this.registerRoster();
  }

  public static getInstance(): AgentSwarmEngine {
    if (!AgentSwarmEngine.instance) {
      AgentSwarmEngine.instance = new AgentSwarmEngine();
    }
    return AgentSwarmEngine.instance;
  }

  public getAgent(role: AgentRole): AgentDefinition | undefined {
    return this.agents.get(role);
  }

  public getAllAgents(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  /**
   * Executes an autonomous agent step lifecycle with bounded iterations and memory integration
   */
  public async executeAgent(
    role: AgentRole,
    req: AgentExecutionRequest
  ): Promise<AgentExecutionResult> {
    const agent = this.agents.get(role);
    if (!agent) {
      throw new AppError("NOT_FOUND", `Agent role '${role}' not found`, 404);
    }

    const start = performance.now();
    const maxIterations = req.maxIterations || 10;
    const workspaceId = req.workspaceId || "default";
    const toolsUsed: string[] = [];

    // Retrieve contextual memory
    const relevantMemories = memoryEngine.retrieve(workspaceId, req.prompt, undefined, 3);
    const memoryContext = relevantMemories.map((m) => `[Memory]: ${m.content}`).join("\n");

    const systemPrompt = `${agent.systemInstructions}\n\nRelevant Platform Knowledge:\n${memoryContext}`;

    // Execute through Central AI Router
    const aiResponse = await aiRouter.execute({
      prompt: req.prompt,
      systemPrompt,
      taskCategory: agent.preferredCategory,
      workspaceId,
      signal: req.signal,
    });

    // Optionally invoke allowed tool if requested
    if (agent.allowedTools.includes("search_memory")) {
      const toolCtx: ToolExecutionContext = {
        taskId: req.taskId,
        agentRole: role,
        workspaceId,
        signal: req.signal,
      };
      await toolRegistry.executeTool("search_memory", { query: req.prompt, limit: 2 }, toolCtx);
      toolsUsed.push("search_memory");
    }

    const latencyMs = Math.round(performance.now() - start);

    return {
      agentRole: role,
      status: "SUCCESS",
      output: aiResponse.content,
      iterations: 1,
      toolsUsed,
      latencyMs,
    };
  }

  private registerRoster() {
    this.agents.set("PRODUCT_MANAGER", {
      role: "PRODUCT_MANAGER",
      name: "Nexus PM",
      description: "Understands intent, defines acceptance criteria, MVP scope, and product specifications",
      capabilities: ["User Stories", "Scope Definition", "Roadmap Planning"],
      allowedTools: ["search_memory"],
      systemInstructions: "You are the Product Manager for Antigravity. Deliver clear, actionable specs and user stories.",
      preferredCategory: "REASONING",
    });

    this.agents.set("UX_DESIGNER", {
      role: "UX_DESIGNER",
      name: "Aura Designer",
      description: "Establishes design tokens, wireframes, WCAG AA contrast, and glassmorphic UI specs",
      capabilities: ["Glassmorphism UI", "WCAG AA", "Component Design"],
      allowedTools: ["search_memory"],
      systemInstructions: "You are the Principal UX/UI Designer. Produce refined, accessible, cyberpunk aesthetic design systems.",
      preferredCategory: "CREATIVE",
    });

    this.agents.set("ARCHITECT", {
      role: "ARCHITECT",
      name: "Vector Architect",
      description: "Designs system architecture, typed APIs, database schemas, and AI router fallbacks",
      capabilities: ["System Architecture", "API Design", "Schema Modeling"],
      allowedTools: ["search_memory", "system_diagnostics"],
      systemInstructions: "You are the Chief System Architect. Enforce zero-any strict TypeScript, resilience, and clean separation.",
      preferredCategory: "REASONING",
    });

    this.agents.set("BUILDER", {
      role: "BUILDER",
      name: "Forge Builder",
      description: "Implements production-grade React 19 / Next.js 15 frontend and typed backend services",
      capabilities: ["Full-Stack Engineering", "TypeScript Strict", "Component Assembly"],
      allowedTools: ["search_memory"],
      systemInstructions: "You are the Lead Full-Stack Builder. Write modular, highly maintainable, typed code.",
      preferredCategory: "CODE",
    });

    this.agents.set("QA_ENGINEER", {
      role: "QA_ENGINEER",
      name: "Sentinel QA",
      description: "Executes automated tests, Playwright checks, regression suites, and validation contracts",
      capabilities: ["Unit Testing", "E2E Testing", "Regression Auditing"],
      allowedTools: ["search_memory", "system_diagnostics"],
      systemInstructions: "You are the Lead QA Automation Engineer. Validate edge cases, types, and error states.",
      preferredCategory: "REASONING",
    });

    this.agents.set("SECURITY_ENGINEER", {
      role: "SECURITY_ENGINEER",
      name: "Cipher Security",
      description: "Performs secret scanning, RLS policy audits, OWASP checks, and sandboxing governance",
      capabilities: ["OWASP Auditing", "RLS Verification", "Secret Defense"],
      allowedTools: ["search_memory", "system_diagnostics"],
      systemInstructions: "You are the Principal Security Engineer. Zero tolerance for exposed secrets or flawed RLS.",
      preferredCategory: "REASONING",
    });

    this.agents.set("DEVOPS_ENGINEER", {
      role: "DEVOPS_ENGINEER",
      name: "Stratus DevOps",
      description: "Oversees Docker containers, CI/CD pipelines, Vercel/Netlify deployments, and cloud telemetry",
      capabilities: ["Docker", "Deployments", "Cloud Telemetry"],
      allowedTools: ["system_diagnostics"],
      systemInstructions: "You are the Lead DevOps Engineer. Maintain high uptime and reliable deployment pipelines.",
      preferredCategory: "FAST",
    });

    this.agents.set("CREATIVE_DIRECTOR", {
      role: "CREATIVE_DIRECTOR",
      name: "Prism Creative",
      description: "Directs visual asset generation, color harmonies, and marketing multimedia pipelines",
      capabilities: ["Visual Assets", "Brand Identity", "Design Direction"],
      allowedTools: ["search_memory"],
      systemInstructions: "You are the Creative Director. Provide rich, distinct visual concepts.",
      preferredCategory: "CREATIVE",
    });

    this.agents.set("VIDEO_PRODUCER", {
      role: "VIDEO_PRODUCER",
      name: "Motion Video",
      description: "Orchestrates Remotion walkthroughs and Blender 3D video rendering queues",
      capabilities: ["Remotion", "3D Rendering", "Video Pipelines"],
      allowedTools: ["system_diagnostics"],
      systemInstructions: "You are the Motion Video Producer. Produce compelling video architectures.",
      preferredCategory: "CREATIVE",
    });

    this.agents.set("STOCK_RESEARCHER", {
      role: "STOCK_RESEARCHER",
      name: "Alpha Market",
      description: "Performs market intelligence, financial modeling, and data analytics synthesis",
      capabilities: ["Market Research", "Financial Modeling", "Data Analysis"],
      allowedTools: ["search_memory"],
      systemInstructions: "You are the Senior Market & Quantitative Analyst. Provide rigorous financial insights.",
      preferredCategory: "REASONING",
    });
  }
}

export const agentSwarm = AgentSwarmEngine.getInstance();
