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
  | "STOCK_RESEARCHER"
  | "GRAPHIC_DESIGNER"
  | "BRAND_DESIGNER"
  | "MOTION_DESIGNER"
  | "AUDIO_PRODUCER"
  | "THREE_D_ARTIST"
  | "CREATIVE_RESEARCHER";

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

    this.agents.set("GRAPHIC_DESIGNER", {
      role: "GRAPHIC_DESIGNER",
      name: "Vector Graphic Specialist",
      description: "Creates vector illustrations, SVG assets, iconography, and visual hierarchy",
      capabilities: ["Vector Graphics", "SVG Architecture", "Icon Design"],
      allowedTools: ["search_memory"],
      systemInstructions: "You are the Graphic Design Specialist. Produce sharp, scalable vector assets and icon sets.",
      preferredCategory: "CREATIVE",
    });

    this.agents.set("BRAND_DESIGNER", {
      role: "BRAND_DESIGNER",
      name: "Identity Brand Specialist",
      description: "Defines typography rules, brand color palettes, guidelines, and tone-of-voice",
      capabilities: ["Brand Systems", "Color Palette Curation", "Typography Pairing"],
      allowedTools: ["search_memory"],
      systemInstructions: "You are the Brand Identity Specialist. Craft cohesive, authoritative brand guidelines.",
      preferredCategory: "CREATIVE",
    });

    this.agents.set("MOTION_DESIGNER", {
      role: "MOTION_DESIGNER",
      name: "Kinetic Motion Specialist",
      description: "Architects micro-interactions, spring physics, Remotion sequences, and transitions",
      capabilities: ["Spring Physics", "Framer Motion", "Remotion Timelines"],
      allowedTools: ["search_memory"],
      systemInstructions: "You are the Motion Design Specialist. Craft seamless, purposeful micro-animations.",
      preferredCategory: "CREATIVE",
    });

    this.agents.set("AUDIO_PRODUCER", {
      role: "AUDIO_PRODUCER",
      name: "Sonic Audio Specialist",
      description: "Directs neural speech synthesis, voice inflection, sound effects, and spectrogram mixing",
      capabilities: ["Neural TTS", "Audio Mixing", "Sound Design"],
      allowedTools: ["search_memory"],
      systemInstructions: "You are the Audio Production Specialist. Ensure pristine audio fidelity and natural pacing.",
      preferredCategory: "CREATIVE",
    });

    this.agents.set("THREE_D_ARTIST", {
      role: "THREE_D_ARTIST",
      name: "Spatial 3D Specialist",
      description: "Develops Three.js shaders, GLTF procedural models, and Blender scene geometries",
      capabilities: ["Three.js WebGL", "GLTF Architecture", "Blender Procedural Shaders"],
      allowedTools: ["system_diagnostics"],
      systemInstructions: "You are the 3D Procedural Artist. Build efficient, visually striking 3D environments.",
      preferredCategory: "CREATIVE",
    });

    this.agents.set("CREATIVE_RESEARCHER", {
      role: "CREATIVE_RESEARCHER",
      name: "Lumina Creative Researcher",
      description: "Analyzes design benchmarks, competitive aesthetics, user sentiment, and art movements",
      capabilities: ["Design Auditing", "Aesthetic Research", "Visual Benchmarking"],
      allowedTools: ["search_memory"],
      systemInstructions: "You are the Creative Researcher. Uncover design trends and empirical benchmarks.",
      preferredCategory: "REASONING",
    });
  }
}

export const agentSwarm = AgentSwarmEngine.getInstance();
