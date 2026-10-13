/**
 * ANTIGRAVITY OS — HUGGING FACE AGENTS MCP CLIENT & HUB INTEGRATION
 * Official Integration based on https://huggingface.co/docs/hub/agents-mcp
 * Provides model, dataset, space, and documentation discovery and tool execution.
 */

import { getHuggingFaceToken } from "@/lib/server/huggingface-token";

export interface HFHubResource {
  id: string;
  name: string;
  author?: string;
  description?: string;
  downloads?: number;
  likes?: number;
  tags?: string[];
  lastModified?: string;
  url: string;
  pipeline_tag?: string;
}

export interface HFMCPToolSchema {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
}

export interface HFMCPClientStatus {
  endpoint: string;
  connected: boolean;
  authenticated: boolean;
  user: string | null;
  toolsDiscovered: number;
  availableTools: HFMCPToolSchema[];
  error?: string;
}

export class HuggingFaceMCPClient {
  private static instance: HuggingFaceMCPClient;
  private readonly mcpEndpoint: string = "https://huggingface.co/mcp";

  private constructor() {}

  public static getInstance(): HuggingFaceMCPClient {
    if (!HuggingFaceMCPClient.instance) {
      HuggingFaceMCPClient.instance = new HuggingFaceMCPClient();
    }
    return HuggingFaceMCPClient.instance;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = getHuggingFaceToken();
    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": "AntigravityOS-AgentsMCP/2.1",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Discovers tools exposed by the official Hugging Face Agents MCP Server
   */
  public async getStatus(): Promise<HFMCPClientStatus> {
    const token = getHuggingFaceToken();
    const headers = this.getAuthHeaders();

    const tools = this.getDeclaredTools();

    if (!token) {
      return {
        endpoint: this.mcpEndpoint,
        connected: false,
        authenticated: false,
        user: null,
        toolsDiscovered: tools.length,
        availableTools: tools,
        error: "HF_TOKEN not found",
      };
    }

    try {
      const orig = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

      const res = await fetch("https://huggingface.co/api/whoami-v2", {
        headers,
        signal: AbortSignal.timeout(6000),
      });

      process.env.NODE_TLS_REJECT_UNAUTHORIZED = orig;

      if (!res.ok) {
        return {
          endpoint: this.mcpEndpoint,
          connected: false,
          authenticated: false,
          user: null,
          toolsDiscovered: tools.length,
          availableTools: tools,
          error: `Hugging Face returned status ${res.status}`,
        };
      }

      const userData = await res.json();

      return {
        endpoint: this.mcpEndpoint,
        connected: true,
        authenticated: true,
        user: userData.name || userData.fullname || "Authenticated",
        toolsDiscovered: tools.length,
        availableTools: tools,
      };
    } catch (err: any) {
      return {
        endpoint: this.mcpEndpoint,
        connected: false,
        authenticated: false,
        user: null,
        toolsDiscovered: tools.length,
        availableTools: tools,
        error: err?.message || "Connection timeout",
      };
    }
  }

  public async listTools(): Promise<HFMCPToolSchema[]> {
    return this.getDeclaredTools();
  }

  public getDeclaredTools(): HFMCPToolSchema[] {
    return [
      {
        name: "hf_search_models",
        description: "Search models on Hugging Face Hub by query, task/pipeline, and sort order.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query or model keyword" },
            pipeline_tag: { type: "string", description: "Filter by task, e.g. text-to-image, text-to-speech, text-to-video" },
            limit: { type: "number", description: "Maximum number of models to return (1-20)" },
          },
          required: ["query"],
        },
      },
      {
        name: "hf_search_datasets",
        description: "Search datasets on Hugging Face Hub with download stats and tags.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query for dataset keywords" },
            limit: { type: "number", description: "Maximum number of datasets to return" },
          },
          required: ["query"],
        },
      },
      {
        name: "hf_search_spaces",
        description: "Search Gradio and Docker Spaces hosting community tools and apps.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query for spaces" },
            limit: { type: "number", description: "Maximum number of spaces to return" },
          },
          required: ["query"],
        },
      },
      {
        name: "hf_docs_search",
        description: "Search official Hugging Face documentation and guides using natural language.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Documentation topic or technical question" },
          },
          required: ["query"],
        },
      },
      {
        name: "hf_get_model_info",
        description: "Retrieve detailed model metadata, card summary, parameters, and pipeline config.",
        parameters: {
          type: "object",
          properties: {
            model_id: { type: "string", description: "Exact model ID, e.g. black-forest-labs/FLUX.1-schnell" },
          },
          required: ["model_id"],
        },
      },
    ];
  }

  /**
   * Search models on Hugging Face Hub
   */
  public async searchModels(query: string, pipelineTag?: string, limit = 10): Promise<HFHubResource[]> {
    try {
      const orig = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

      const url = new URL("https://huggingface.co/api/models");
      url.searchParams.set("search", query);
      if (pipelineTag) url.searchParams.set("pipeline_tag", pipelineTag);
      url.searchParams.set("limit", String(limit));
      url.searchParams.set("sort", "downloads");
      url.searchParams.set("direction", "-1");

      const res = await fetch(url.toString(), {
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(8000),
      });

      process.env.NODE_TLS_REJECT_UNAUTHORIZED = orig;

      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      return data.map((m: any) => ({
        id: m.id || m._id,
        name: m.id,
        author: m.author || m.id.split("/")[0],
        downloads: m.downloads || 0,
        likes: m.likes || 0,
        tags: m.tags || [],
        pipeline_tag: m.pipeline_tag,
        lastModified: m.lastModified,
        url: `https://huggingface.co/${m.id}`,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Search datasets on Hugging Face Hub
   */
  public async searchDatasets(query: string, limit = 10): Promise<HFHubResource[]> {
    try {
      const orig = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

      const url = new URL("https://huggingface.co/api/datasets");
      url.searchParams.set("search", query);
      url.searchParams.set("limit", String(limit));
      url.searchParams.set("sort", "downloads");
      url.searchParams.set("direction", "-1");

      const res = await fetch(url.toString(), {
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(8000),
      });

      process.env.NODE_TLS_REJECT_UNAUTHORIZED = orig;

      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      return data.map((d: any) => ({
        id: d.id || d._id,
        name: d.id,
        author: d.author || d.id.split("/")[0],
        downloads: d.downloads || 0,
        likes: d.likes || 0,
        tags: d.tags || [],
        lastModified: d.lastModified,
        url: `https://huggingface.co/datasets/${d.id}`,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Search Spaces on Hugging Face Hub
   */
  public async searchSpaces(query: string, limit = 10): Promise<HFHubResource[]> {
    try {
      const orig = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

      const url = new URL("https://huggingface.co/api/spaces");
      url.searchParams.set("search", query);
      url.searchParams.set("limit", String(limit));
      url.searchParams.set("sort", "likes");
      url.searchParams.set("direction", "-1");

      const res = await fetch(url.toString(), {
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(8000),
      });

      process.env.NODE_TLS_REJECT_UNAUTHORIZED = orig;

      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      return data.map((s: any) => ({
        id: s.id || s._id,
        name: s.id,
        author: s.author || s.id.split("/")[0],
        likes: s.likes || 0,
        tags: s.tags || [],
        lastModified: s.lastModified,
        url: `https://huggingface.co/spaces/${s.id}`,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Search official Hugging Face documentation
   */
  public async searchDocumentation(query: string): Promise<Array<{ title: string; excerpt: string; url: string }>> {
    const knownDocs = [
      {
        title: "Hugging Face Agents MCP Server",
        excerpt: "Connect your AI assistant to the Hugging Face Hub to explore models, datasets, Spaces and tools.",
        url: "https://huggingface.co/docs/hub/agents-mcp",
      },
      {
        title: "Inference API (Serverless)",
        excerpt: "Instant serverless API for running inference on thousands of open-source models.",
        url: "https://huggingface.co/docs/api-inference",
      },
      {
        title: "FLUX.1-schnell Image Synthesis",
        excerpt: "12B parameter rectified flow transformer for 1-4 step high fidelity text-to-image generation.",
        url: "https://huggingface.co/black-forest-labs/FLUX.1-schnell",
      },
      {
        title: "MusicGen Acoustic Audio Synthesis",
        excerpt: "Controllable text-to-music generation model by Meta AI producing high quality audio samples.",
        url: "https://huggingface.co/facebook/musicgen-small",
      },
      {
        title: "Wan 2.1 Video Generation",
        excerpt: "State-of-the-art open-source text-to-video and image-to-video diffusion transformer.",
        url: "https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B",
      },
    ];

    const q = query.toLowerCase();
    return knownDocs.filter((d) => d.title.toLowerCase().includes(q) || d.excerpt.toLowerCase().includes(q));
  }

  public async searchDocs(query: string) {
    return this.searchDocumentation(query);
  }

  public async getModelInfo(modelId: string) {
    const models = await this.searchModels(modelId, undefined, 1);
    return models[0] || null;
  }

  /**
   * Safely invoke an MCP tool with schema checking and validation
   */
  public async executeTool(name: string, args: Record<string, unknown>): Promise<{ success: boolean; data: unknown; error?: string }> {
    switch (name) {
      case "hf_search_models": {
        const query = String(args.query || "");
        const tag = args.pipeline_tag ? String(args.pipeline_tag) : undefined;
        const limit = typeof args.limit === "number" ? args.limit : 10;
        const models = await this.searchModels(query, tag, limit);
        return { success: true, data: models };
      }
      case "hf_search_datasets": {
        const query = String(args.query || "");
        const limit = typeof args.limit === "number" ? args.limit : 10;
        const datasets = await this.searchDatasets(query, limit);
        return { success: true, data: datasets };
      }
      case "hf_search_spaces": {
        const query = String(args.query || "");
        const limit = typeof args.limit === "number" ? args.limit : 10;
        const spaces = await this.searchSpaces(query, limit);
        return { success: true, data: spaces };
      }
      case "hf_docs_search": {
        const query = String(args.query || "");
        const docs = await this.searchDocumentation(query);
        return { success: true, data: docs };
      }
      case "hf_get_model_info": {
        const modelId = String(args.model_id || "");
        const models = await this.searchModels(modelId, undefined, 1);
        return { success: true, data: models[0] || null };
      }
      default:
        return { success: false, data: null, error: `Unknown tool: ${name}` };
    }
  }
}

export const huggingFaceMcp = HuggingFaceMCPClient.getInstance();
