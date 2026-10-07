export type MCPStatus =
  | "CONFIGURED"
  | "CONNECTED"
  | "HEALTHY"
  | "DEGRADED"
  | "AUTH_REQUIRED"
  | "FAILED"
  | "DISABLED";

export interface MCPServerInfo {
  name: string;
  category: "DESIGN" | "3D" | "BROWSER_QA" | "DATABASE" | "CODE" | "MEMORY" | "DATA" | "MEDIA" | "VIDEO";
  transport: "STDIO" | "SSE" | "EMBEDDED";
  toolsCount: number;
  resourcesCount: number;
  status: MCPStatus;
  requiresAuth: boolean;
  isAuthSupplied: boolean;
  capabilities: string[];
  models?: string[];
  estimatedCostPerUnitUsd?: number;
}

export class MCPGovernanceRegistry {
  private static instance: MCPGovernanceRegistry;
  private servers: Map<string, MCPServerInfo> = new Map();

  private constructor() {
    this.registerInstalledServers();
  }

  public static getInstance(): MCPGovernanceRegistry {
    if (!MCPGovernanceRegistry.instance) {
      MCPGovernanceRegistry.instance = new MCPGovernanceRegistry();
    }
    return MCPGovernanceRegistry.instance;
  }

  private registerInstalledServers() {
    // 1. Google Stitch MCP
    this.servers.set("StitchMCP", {
      name: "StitchMCP",
      category: "DESIGN",
      transport: "STDIO",
      toolsCount: 15,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["generate_screen_from_text", "create_design_system", "generate_variants", "edit_screens"],
    });

    // 2. Blender 3D MCP
    this.servers.set("blender", {
      name: "blender",
      category: "3D",
      transport: "STDIO",
      toolsCount: 22,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["execute_blender_code", "search_polyhaven_assets", "download_polyhaven_asset", "get_scene_info"],
    });

    // 3. Playwright MCP
    this.servers.set("playwright", {
      name: "playwright",
      category: "BROWSER_QA",
      transport: "STDIO",
      toolsCount: 18,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["browser_navigate", "browser_take_screenshot", "browser_click", "browser_evaluate"],
    });

    // 4. Prisma Studio MCP
    this.servers.set("prisma-mcp-server", {
      name: "prisma-mcp-server",
      category: "DATABASE",
      transport: "STDIO",
      toolsCount: 3,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["migrate-status", "migrate-dev", "Prisma-Studio"],
    });

    // 5. GitHub MCP
    const hasGitHub = Boolean(process.env.GITHUB_TOKEN || process.env.GH_TOKEN);
    this.servers.set("github", {
      name: "github",
      category: "CODE",
      transport: "STDIO",
      toolsCount: 26,
      resourcesCount: 0,
      status: hasGitHub ? "HEALTHY" : "AUTH_REQUIRED",
      requiresAuth: true,
      isAuthSupplied: hasGitHub,
      capabilities: ["create_pull_request", "create_or_update_file", "search_repositories", "get_file_contents"],
    });

    // 6. Memory Graph MCP
    this.servers.set("memory", {
      name: "memory",
      category: "MEMORY",
      transport: "STDIO",
      toolsCount: 8,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["create_entities", "read_graph", "search_nodes", "add_observations"],
    });

    // 7. Puppeteer MCP
    this.servers.set("puppeteer", {
      name: "puppeteer",
      category: "BROWSER_QA",
      transport: "STDIO",
      toolsCount: 7,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["puppeteer_navigate", "puppeteer_screenshot", "puppeteer_click", "puppeteer_evaluate"],
    });

    // 8. Mobbin & Visualization MCP
    this.servers.set("mobbin", {
      name: "mobbin",
      category: "DESIGN",
      transport: "STDIO",
      toolsCount: 3,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["search_screens", "search_flows", "search_sections"],
    });

    // 9. Chrome DevTools MCP
    this.servers.set("chrome-devtools", {
      name: "chrome-devtools",
      category: "BROWSER_QA",
      transport: "STDIO",
      toolsCount: 3,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["chrome_inspect", "chrome_evaluate", "chrome_console_logs"],
    });

    // 10. Sentry MCP
    this.servers.set("sentry", {
      name: "sentry",
      category: "CODE",
      transport: "STDIO",
      toolsCount: 2,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["sentry_get_issues", "sentry_resolve_issue"],
    });

    // 11. Context7 MCP
    this.servers.set("context7", {
      name: "context7",
      category: "CODE",
      transport: "STDIO",
      toolsCount: 2,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["context_search", "context_extract"],
    });

    // 12. n8n MCP
    this.servers.set("n8n", {
      name: "n8n",
      category: "DATA",
      transport: "STDIO",
      toolsCount: 2,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["n8n_list_workflows", "n8n_execute_workflow"],
    });

    // 13. Notion MCP
    this.servers.set("notion", {
      name: "notion",
      category: "DATA",
      transport: "STDIO",
      toolsCount: 3,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["notion_search", "notion_get_page", "notion_create_page"],
    });

    // 14. Fetch/Web Research MCP
    this.servers.set("fetch-research", {
      name: "fetch-research",
      category: "DATA",
      transport: "STDIO",
      toolsCount: 2,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["research_fetch", "research_search"],
    });

    // 15. Linear MCP
    this.servers.set("linear", {
      name: "linear",
      category: "CODE",
      transport: "STDIO",
      toolsCount: 2,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["linear_create_issue", "linear_list_issues"],
    });

    // 16. Suno AI Music MCP (AceDataCloud/SunoMCP)
    this.servers.set("SunoMCP", {
      name: "SunoMCP",
      category: "MEDIA",
      transport: "STDIO",
      toolsCount: 5,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["generate_music", "get_music_details", "generate_lyrics", "extend_audio"],
    });

    // 17. MCP Video Generator (kevinten-ai/mcp-video-gen)
    this.servers.set("mcp-video-gen", {
      name: "mcp-video-gen",
      category: "VIDEO",
      transport: "STDIO",
      toolsCount: 4,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["generate_video_from_text", "generate_video_from_image", "query_video_status"],
    });

    // 18. Automated Video Generator (itsPremkumar/Automated-Video-Generator)
    this.servers.set("automated-video-generator", {
      name: "automated-video-generator",
      category: "VIDEO",
      transport: "STDIO",
      toolsCount: 6,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["generate_subtitles", "synthesize_narration", "compile_video_clip", "render_short_video"],
    });

    // 19. Free Video Maker (bilalnaseer/free-video-maker)
    this.servers.set("free-video-maker", {
      name: "free-video-maker",
      category: "VIDEO",
      transport: "STDIO",
      toolsCount: 4,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["create_video_timeline", "render_remotion_video", "export_mp4_video"],
    });

    // 20. Fooocus Offline SDXL (lllyasviel/Fooocus)
    this.servers.set("fooocus", {
      name: "fooocus",
      category: "DESIGN",
      transport: "STDIO",
      toolsCount: 5,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["generate_fooocus_image", "inpaint_fooocus", "upscale_fooocus", "describe_image"],
    });

    // 21. ComfyUI Modular Media Fabric (ComfyUI)
    this.servers.set("comfyui", {
      name: "comfyui",
      category: "MEDIA",
      transport: "STDIO",
      toolsCount: 8,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["execute_comfyui_graph", "queue_prompt", "get_history", "load_custom_nodes"],
    });

    // 22. Open WebUI (open-webui/open-webui)
    this.servers.set("open-webui", {
      name: "open-webui",
      category: "DATA",
      transport: "STDIO",
      toolsCount: 6,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["chat_completions", "rag_knowledge_search", "ollama_model_bridge", "web_search_rag"],
    });

    // 23. Flowise Visual AI Agent Builder (FlowiseAI/Flowise)
    this.servers.set("flowise", {
      name: "flowise",
      category: "CODE",
      transport: "STDIO",
      toolsCount: 5,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["execute_chatflow", "list_chatflows", "execute_agentflow", "custom_tools_bridge"],
    });

    // 24. Video2X Super-Resolution & Interpolator (k4yt3x/video2x)
    this.servers.set("video2x", {
      name: "video2x",
      category: "VIDEO",
      transport: "STDIO",
      toolsCount: 5,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["upscale_video_2x", "upscale_video_4x", "interpolate_frames_rife", "real_esrgan_enhance"],
    });

    // 25. 4K Video Upscaler Pipeline (yuvraj108c/4k-video-upscaler-colab)
    this.servers.set("4k-video-upscaler", {
      name: "4k-video-upscaler",
      category: "VIDEO",
      transport: "STDIO",
      toolsCount: 4,
      resourcesCount: 0,
      status: "HEALTHY",
      requiresAuth: false,
      isAuthSupplied: true,
      capabilities: ["upscale_to_4k", "lanczos_unsharp_filter", "studio_h264_render", "faststart_optimization"],
    });
  }

  public getAllServers(): MCPServerInfo[] {
    return Array.from(this.servers.values());
  }

  public getServer(name: string): MCPServerInfo | undefined {
    return this.servers.get(name);
  }
}

export const mcpRegistry = MCPGovernanceRegistry.getInstance();
