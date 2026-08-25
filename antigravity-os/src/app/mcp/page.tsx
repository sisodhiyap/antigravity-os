"use client";

import React from "react";
import { useSystemStore } from "@/stores/useSystemStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { Network, CheckCircle2, Zap, Shield, Layers, Box, Terminal } from "lucide-react";

export default function McpPage() {
  const { telemetry } = useSystemStore();

  const mcpServerDetails = [
    {
      name: "prisma-mcp-server",
      mode: "Eager",
      toolCount: 3,
      description: "Automated schema synchronization, database migrations (migrate-dev, migrate-status), and interactive Prisma Studio inspection.",
      tools: ["migrate-status", "migrate-dev", "Prisma-Studio"],
    },
    {
      name: "StitchMCP",
      mode: "Lazy",
      toolCount: 15,
      description: "Google Stitch UI generation, automated design system synthesis from DESIGN.md, screen variant generation, and component upload.",
      tools: ["create_project", "generate_screen_from_text", "edit_screens", "create_design_system", "generate_variants", "apply_design_system", "upload_design_md"],
    },
    {
      name: "blender",
      mode: "Lazy",
      toolCount: 25,
      description: "Headless 3D mesh modeling, Python bpy execution, Hyper3D / Hunyuan3D model synthesis, PolyHaven textures, and Sketchfab imports.",
      tools: ["execute_blender_code", "get_scene_info", "generate_hyper3d_model_via_text", "generate_hunyuan3d_model", "search_polyhaven_assets", "download_sketchfab_model"],
    },
    {
      name: "playwright",
      mode: "Lazy",
      toolCount: 25,
      description: "High-speed headless browser automation, visual regression screenshot captures, full DOM snapshots, network mocking, and WCAG AA audits.",
      tools: ["browser_navigate", "browser_click", "browser_type", "browser_take_screenshot", "browser_snapshot", "browser_console_messages", "browser_run_code_unsafe"],
    },
    {
      name: "puppeteer",
      mode: "Lazy",
      toolCount: 7,
      description: "Auxiliary Chrome DevTools browser orchestration, PDF compilation, and dynamic JavaScript page evaluation.",
      tools: ["puppeteer_navigate", "puppeteer_screenshot", "puppeteer_click", "puppeteer_fill", "puppeteer_select", "puppeteer_evaluate"],
    },
    {
      name: "github",
      mode: "Lazy",
      toolCount: 26,
      description: "Automated GitHub repository management, pull request reviews, commit pushes, branch creation, issue tracking, and code searching.",
      tools: ["create_repository", "create_pull_request", "list_issues", "create_branch", "push_files", "merge_pull_request", "search_code"],
    },
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-cyber-neon/30 shadow-glow-neon/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Network className="w-5 h-5 text-cyber-neon" />
            <span>MODEL CONTEXT PROTOCOL (MCP) WORKSTATION HUB</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Standardized tool interfaces connecting AI models directly to Blender, Playwright, GitHub, Stitch, and Prisma.
          </p>
        </div>

        <Badge variant="neon" dot className="py-1 px-3 text-xs">
          6 SERVERS / 81+ TOOLS ACTIVE
        </Badge>
      </div>

      {/* MCP Server Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {mcpServerDetails.map((server) => (
          <Card key={server.name} glow="neon" className="space-y-3">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyber-neon/15 border border-cyber-neon/30 flex items-center justify-center text-cyber-neon">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm">{server.name}</CardTitle>
                  <span className="text-[10px] text-slate-500">
                    Mode: <span className="text-slate-300 font-semibold">{server.mode}</span>
                  </span>
                </div>
              </div>
              <Badge variant="neon" dot>
                {server.toolCount} TOOLS
              </Badge>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <p className="text-xs text-slate-300 leading-relaxed">
                {server.description}
              </p>

              <div>
                <div className="text-[10px] text-slate-500 uppercase mb-1.5">Registered Tool Capabilities:</div>
                <div className="flex flex-wrap gap-1.5">
                  {server.tools.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-[10px] text-cyber-cyan font-mono"
                    >
                      `{t}`
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
