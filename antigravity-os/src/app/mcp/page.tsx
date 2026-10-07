"use client";

import React, { useState } from "react";
import {
  Palette, Globe, Code2, GitBranch, Database, Search,
  Rocket, Bot, Network,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, StatusBadge } from "@/components/ui/DesignSystem";
import { clsx } from "clsx";

type MCPStatus = "live" | "auth_required" | "offline" | "not_configured";

interface MCPServer {
  name: string;
  category: string;
  description: string;
  status: MCPStatus;
  tools: number;
}

const MCP_SERVERS: MCPServer[] = [
  { name: "StitchMCP",        category: "DESIGN",     description: "AI design generation and screen editing",  status: "live",          tools: 14 },
  { name: "Playwright",       category: "BROWSER",    description: "Headless browser automation & testing",     status: "live",          tools: 24 },
  { name: "Puppeteer",        category: "BROWSER",    description: "Chrome DevTools protocol browser control",  status: "live",          tools: 8  },
  { name: "GitHub",           category: "GIT",        description: "Repository management & pull requests",     status: "auth_required", tools: 28 },
  { name: "Supabase",         category: "DATABASE",   description: "PostgreSQL + edge functions + storage",     status: "auth_required", tools: 32 },
  { name: "Firebase",         category: "DATABASE",   description: "Realtime DB, auth, storage, functions",     status: "auth_required", tools: 22 },
  { name: "Prisma",           category: "DATABASE",   description: "Type-safe ORM migrations & studio",         status: "live",          tools: 4  },
  { name: "Memory",           category: "RESEARCH",   description: "Knowledge graph & entity memory store",     status: "live",          tools: 10 },
  { name: "Dart/Flutter",     category: "CODE",       description: "Flutter analyzer, pub, hot reload",         status: "not_configured",tools: 16 },
  { name: "Blender",          category: "DESIGN",     description: "3D mesh generation & scene control",        status: "not_configured",tools: 26 },
  { name: "Notebooks",        category: "CODE",       description: "Jupyter notebook creation & execution",     status: "live",          tools: 10 },
  { name: "Visualization",    category: "CODE",       description: "Chart rendering and data visualization",    status: "live",          tools: 2  },
  { name: "Mobbin",           category: "DESIGN",     description: "Real app design reference library",         status: "auth_required", tools: 3  },
  { name: "OpenRouter AI",    category: "AUTOMATION", description: "Cloud LLM routing via OpenRouter API",      status: "auth_required", tools: 5  },
];

const CATEGORY_ICON: Record<string, React.ElementType> = {
  DESIGN: Palette, BROWSER: Globe, CODE: Code2, GIT: GitBranch,
  DATABASE: Database, RESEARCH: Search, RESEARCH2: Search,
  AUTOMATION: Bot, DEPLOYMENT: Rocket,
};

const STATUS_BADGE_MAP: Record<MCPStatus, { variant: any; label: string }> = {
  live:           { variant: "online",     label: "LIVE"           },
  auth_required:  { variant: "degraded",   label: "AUTH REQUIRED"  },
  offline:        { variant: "offline",    label: "OFFLINE"        },
  not_configured: { variant: "simulation", label: "NOT CONFIGURED" },
};

const CATEGORIES = ["ALL", "DESIGN", "BROWSER", "CODE", "GIT", "DATABASE", "RESEARCH", "AUTOMATION"];

export default function MCPHubPage() {
  const [activeCategory, setActiveCategory] = useState("ALL");

  const filtered = activeCategory === "ALL"
    ? MCP_SERVERS
    : MCP_SERVERS.filter((s) => s.category === activeCategory);

  const liveCount  = MCP_SERVERS.filter((s) => s.status === "live").length;
  const totalTools = MCP_SERVERS.reduce((acc, s) => acc + s.tools, 0);

  return (
    <AppShell>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[var(--ag-text)] font-satoshi">MCP Hub</h1>
        <p className="text-sm text-[var(--ag-text-sec)]">
          {liveCount} live servers · {totalTools} available tools · Model Context Protocol layer
        </p>
      </div>

      {/* Category Filter */}
      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label="Filter MCP servers by category"
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat !== "ALL" ? (CATEGORY_ICON[cat] || Network) : Network;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wide border transition-all duration-150",
                activeCategory === cat
                  ? "bg-[var(--ag-gold-alpha)] border-[var(--ag-gold)]/30 text-[var(--ag-gold)]"
                  : "border-[var(--ag-border)] text-[var(--ag-muted)] hover:text-[var(--ag-text-sec)]"
              )}
            >
              <Icon className="w-3 h-3" aria-hidden="true" />
              {cat}
            </button>
          );
        })}
      </div>

      {/* Server Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
        role="list"
        aria-label="MCP servers"
      >
        {filtered.map((server) => {
          const CatIcon = CATEGORY_ICON[server.category] || Network;
          const sb = STATUS_BADGE_MAP[server.status];
          return (
            <Card
              key={server.name}
              role="listitem"
              className={clsx(
                "p-4 space-y-3",
                server.status === "live" && "hover:border-[var(--ag-success)]/30",
                server.status === "offline" || server.status === "not_configured"
                  ? "opacity-60"
                  : ""
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--ag-elevated)] border border-[var(--ag-border)] flex items-center justify-center shrink-0">
                    <CatIcon className="w-4 h-4 text-[var(--ag-text-sec)]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[var(--ag-text)] leading-tight">{server.name}</p>
                    <p className="text-[10px] text-[var(--ag-muted)] uppercase tracking-wider">{server.category}</p>
                  </div>
                </div>
                <StatusBadge variant={sb.variant} label={sb.label} pulse={server.status === "live"} />
              </div>
              <p className="text-[11px] text-[var(--ag-text-sec)] leading-relaxed">{server.description}</p>
              <p className="text-[10px] text-[var(--ag-muted)]">{server.tools} tools available</p>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
