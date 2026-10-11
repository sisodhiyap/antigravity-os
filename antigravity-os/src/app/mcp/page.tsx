"use client";

import React, { useState, useEffect } from "react";
import {
  Palette, Globe, Code2, GitBranch, Database, Search,
  Rocket, Bot, Network, Cpu, ShieldAlert, CheckCircle2,
  Play, Sparkles, Video, Mail, HardDrive, Youtube, Layers,
  ExternalLink, Zap, RefreshCw, BarChart3,
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
  { name: "StitchMCP", category: "DESIGN", description: "AI design generation and screen editing", status: "live", tools: 14 },
  { name: "Playwright", category: "BROWSER", description: "Headless browser automation & testing", status: "live", tools: 24 },
  { name: "Puppeteer", category: "BROWSER", description: "Chrome DevTools protocol browser control", status: "live", tools: 8 },
  { name: "GitHub", category: "GIT", description: "Repository management & pull requests", status: "auth_required", tools: 28 },
  { name: "Supabase", category: "DATABASE", description: "PostgreSQL + edge functions + storage", status: "auth_required", tools: 32 },
  { name: "Firebase", category: "DATABASE", description: "Realtime DB, auth, storage, functions", status: "auth_required", tools: 22 },
  { name: "Prisma", category: "DATABASE", description: "Type-safe ORM migrations & studio", status: "live", tools: 4 },
  { name: "Memory", category: "RESEARCH", description: "Knowledge graph & entity memory store", status: "live", tools: 10 },
  { name: "Dart/Flutter", category: "CODE", description: "Flutter analyzer, pub, hot reload", status: "not_configured", tools: 16 },
  { name: "Blender", category: "DESIGN", description: "3D mesh generation & scene control", status: "live", tools: 26 },
  { name: "Notebooks", category: "CODE", description: "Jupyter notebook creation & execution", status: "live", tools: 10 },
  { name: "Visualization", category: "CODE", description: "Chart rendering and data visualization", status: "live", tools: 2 },
  { name: "Mobbin", category: "DESIGN", description: "Real app design reference library", status: "auth_required", tools: 3 },
  { name: "OpenRouter AI", category: "AUTOMATION", description: "Cloud LLM routing via OpenRouter API", status: "auth_required", tools: 5 },
  { name: "FFmpeg Fabric", category: "MEDIA", description: "Hardware video encoding and subtitle rendering", status: "live", tools: 4 },
  { name: "ComfyUI Media", category: "MEDIA", description: "Modular diffusion pipeline & node graph", status: "live", tools: 8 },
  { name: "Hugging Face Hub", category: "RESEARCH", description: "Model card search and serverless inference", status: "live", tools: 6 },
];

const CATEGORY_ICON: Record<string, React.ElementType> = {
  DESIGN: Palette, BROWSER: Globe, CODE: Code2, GIT: GitBranch,
  DATABASE: Database, RESEARCH: Search, AUTOMATION: Bot, DEPLOYMENT: Rocket, MEDIA: Video,
};

const STATUS_BADGE_MAP: Record<MCPStatus, { variant: any; label: string }> = {
  live: { variant: "online", label: "LIVE" },
  auth_required: { variant: "degraded", label: "AUTH REQUIRED" },
  offline: { variant: "offline", label: "OFFLINE" },
  not_configured: { variant: "simulation", label: "NOT CONFIGURED" },
};

const CATEGORIES = ["ALL", "DESIGN", "BROWSER", "CODE", "GIT", "DATABASE", "RESEARCH", "MEDIA", "AUTOMATION"];

export default function MCPHubPage() {
  const [activeTab, setActiveTab] = useState<"SERVERS" | "STRANDS" | "GOOGLE" | "CREATIVE">("SERVERS");
  const [activeCategory, setActiveCategory] = useState("ALL");

  // Strands Decider State
  const [decidePrompt, setDecidePrompt] = useState("Generate a 10-slide pitch deck for sovereign AI operating system");
  const [decisionResult, setDecisionResult] = useState<any>(null);
  const [isDeciding, setIsDeciding] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<any>(null);
  const [isRunningBench, setIsRunningBench] = useState(false);

  // Google & Creative Tool States
  const [googleStatus, setGoogleStatus] = useState<any[]>([]);
  const [creativeTools, setCreativeTools] = useState<any[]>([]);

  useEffect(() => {
    // Probe initial health & integrations
    fetch("/api/capabilities")
      .then((r) => r.json())
      .then((json) => {
        if (json.capabilities) {
          const gCap = json.capabilities.find((c: any) => c.id === "google-workspace-gateway");
          if (gCap) {
            setGoogleStatus([
              { name: "Gmail", status: gCap.connectionStatus === "CONNECTED" ? "CONNECTED" : "AUTH_REQUIRED", scope: "gmail.readonly, compose", icon: Mail },
              { name: "Google Drive", status: gCap.connectionStatus === "CONNECTED" ? "CONNECTED" : "AUTH_REQUIRED", scope: "drive.readonly, file", icon: HardDrive },
              { name: "YouTube Creator", status: "AUTH_REQUIRED", scope: "youtube.readonly", icon: Youtube },
              { name: "Google Flow", status: "STANDBY", scope: "flow.workspace.handoff", icon: Video },
            ]);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleRunDecision = async () => {
    setIsDeciding(true);
    setDecisionResult(null);
    try {
      const res = await fetch("/api/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: decidePrompt }),
      });
      const data = await res.json();
      if (data.success) {
        setDecisionResult(data.data);
      }
    } catch (e: any) {
      setDecisionResult({ error: e.message });
    } finally {
      setIsDeciding(false);
    }
  };

  const handleRunBenchmark = async () => {
    setIsRunningBench(true);
    try {
      const res = await fetch("/api/decide/benchmark", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setBenchmarkResult(data.data);
      }
    } catch (e: any) {
      setBenchmarkResult({ error: e.message });
    } finally {
      setIsRunningBench(false);
    }
  };

  const filtered = activeCategory === "ALL"
    ? MCP_SERVERS
    : MCP_SERVERS.filter((s) => s.category === activeCategory);

  const liveCount = MCP_SERVERS.filter((s) => s.status === "live").length;
  const totalTools = MCP_SERVERS.reduce((acc, s) => acc + s.tools, 0);

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ag-text)] font-satoshi">
              MCP Hub & Creative Fabric
            </h1>
            <p className="text-xs text-[var(--ag-text-sec)]">
              {liveCount} live servers · {totalTools} available tools · Strands Decider System One · Verified Creative Toolchains
            </p>
          </div>

          {/* Primary View Switcher */}
          <div className="flex items-center gap-1 bg-[var(--ag-elevated)] p-1 rounded-xl border border-[var(--ag-border)]">
            <button
              onClick={() => setActiveTab("SERVERS")}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all",
                activeTab === "SERVERS"
                  ? "bg-[var(--ag-gold-alpha)] text-[var(--ag-gold)] border border-[var(--ag-gold)]/30"
                  : "text-[var(--ag-muted)] hover:text-[var(--ag-text)]"
              )}
            >
              MCP Servers ({MCP_SERVERS.length})
            </button>
            <button
              onClick={() => setActiveTab("STRANDS")}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5",
                activeTab === "STRANDS"
                  ? "bg-[var(--ag-gold-alpha)] text-[var(--ag-gold)] border border-[var(--ag-gold)]/30"
                  : "text-[var(--ag-muted)] hover:text-[var(--ag-text)]"
              )}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Strands Decider
            </button>
            <button
              onClick={() => setActiveTab("GOOGLE")}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all",
                activeTab === "GOOGLE"
                  ? "bg-[var(--ag-gold-alpha)] text-[var(--ag-gold)] border border-[var(--ag-gold)]/30"
                  : "text-[var(--ag-muted)] hover:text-[var(--ag-text)]"
              )}
            >
              Google & Flow
            </button>
          </div>
        </div>

        {/* ── TAB 1: MCP SERVERS ──────────────────────────────────────────────── */}
        {activeTab === "SERVERS" && (
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter MCP servers">
              {CATEGORIES.map((cat) => {
                const Icon = cat !== "ALL" ? (CATEGORY_ICON[cat] || Network) : Network;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((server) => {
                const CatIcon = CATEGORY_ICON[server.category] || Network;
                const sb = STATUS_BADGE_MAP[server.status];
                return (
                  <Card
                    key={server.name}
                    className={clsx(
                      "p-4 space-y-3 transition-all",
                      server.status === "live" && "hover:border-[var(--ag-success)]/40",
                      server.status === "offline" || server.status === "not_configured" ? "opacity-60" : ""
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
          </div>
        )}

        {/* ── TAB 2: STRANDS DECIDER WORKBENCH ─────────────────────────────────── */}
        {activeTab === "STRANDS" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--ag-border)] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--ag-text)]">System One Decision Workbench</h2>
                    <p className="text-[11px] text-[var(--ag-text-sec)]">Sub-5ms calibrated confidence routing & approval gating</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  SYSTEM ONE READY
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--ag-text-sec)] uppercase tracking-wider">
                  Test Prompt / Task Description
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={decidePrompt}
                    onChange={(e) => setDecidePrompt(e.target.value)}
                    className="flex-1 bg-[var(--ag-elevated)] border border-[var(--ag-border)] rounded-lg px-3 py-2 text-xs text-[var(--ag-text)] focus:outline-none focus:border-[var(--ag-gold)]"
                    placeholder="Enter any task (e.g., 'Delete database', 'Generate pitch deck', 'Explain architecture')..."
                  />
                  <button
                    onClick={handleRunDecision}
                    disabled={isDeciding || !decidePrompt.trim()}
                    className="px-4 py-2 bg-[var(--ag-gold-alpha)] border border-[var(--ag-gold)]/40 text-[var(--ag-gold)] rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-[var(--ag-gold)]/20 transition-all disabled:opacity-50"
                  >
                    {isDeciding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    Decide
                  </button>
                </div>
              </div>

              {decisionResult && (
                <div className="p-4 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-[var(--ag-border)] pb-2">
                    <span className="text-amber-400 font-bold uppercase">{decisionResult.decisionCategory}</span>
                    <span className="text-[var(--ag-muted)]">Latency: {decisionResult.latencyMs}ms</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className="text-[var(--ag-muted)] block">Route Action:</span>
                      <span className="text-[var(--ag-text)] font-semibold">{decisionResult.selectedRouteOrAction}</span>
                    </div>
                    <div>
                      <span className="text-[var(--ag-muted)] block">Calibrated Conf:</span>
                      <span className="text-emerald-400 font-semibold">{((decisionResult.confidence || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-[var(--ag-muted)] block">Risk Level:</span>
                      <span className={clsx("font-semibold", decisionResult.riskClassification === "CRITICAL" ? "text-rose-400" : "text-sky-400")}>
                        {decisionResult.riskClassification}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--ag-muted)] block">Engine:</span>
                      <span className="text-[var(--ag-text)]">{decisionResult.executionEngine}</span>
                    </div>
                  </div>
                  {decisionResult.requiredTools?.length > 0 && (
                    <div className="text-[11px]">
                      <span className="text-[var(--ag-muted)] block mb-1">Required Tools:</span>
                      <div className="flex flex-wrap gap-1">
                        {decisionResult.requiredTools.map((t: string) => (
                          <span key={t} className="px-2 py-0.5 rounded bg-black/40 text-[var(--ag-gold)] border border-[var(--ag-gold)]/20">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--ag-border)] pb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-[var(--ag-text)]">Empirical Benchmark</h3>
                </div>
                <button
                  onClick={handleRunBenchmark}
                  disabled={isRunningBench}
                  className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-semibold flex items-center gap-1 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {isRunningBench ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Run 25-Task Test"}
                </button>
              </div>

              {benchmarkResult ? (
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-[var(--ag-border)]/50">
                    <span className="text-[var(--ag-muted)]">Sample Tasks:</span>
                    <span className="text-[var(--ag-text)] font-semibold">{benchmarkResult.sampleCount}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--ag-border)]/50">
                    <span className="text-[var(--ag-muted)]">Measured p50:</span>
                    <span className="text-emerald-400 font-bold">{benchmarkResult.p50Ms} ms</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--ag-border)]/50">
                    <span className="text-[var(--ag-muted)]">Measured p95:</span>
                    <span className="text-emerald-400 font-bold">{benchmarkResult.p95Ms} ms</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--ag-border)]/50">
                    <span className="text-[var(--ag-muted)]">Classification Accuracy:</span>
                    <span className="text-sky-400 font-bold">{((benchmarkResult.accuracyRate || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--ag-border)]/50">
                    <span className="text-[var(--ag-muted)]">Avg Calibrated Conf:</span>
                    <span className="text-amber-400 font-bold">{((benchmarkResult.avgConfidence || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[var(--ag-muted)]">Timeout Rate:</span>
                    <span className="text-emerald-400 font-bold">{benchmarkResult.timeoutRate}%</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--ag-muted)] leading-relaxed">
                  Click &apos;Run 25-Task Test&apos; to evaluate p50/p95 latency and calibrated confidence against the live Strands Decider engine.
                </p>
              )}
            </Card>
          </div>
        )}

        {/* ── TAB 3: GOOGLE & FLOW SERVICES ───────────────────────────────────── */}
        {activeTab === "GOOGLE" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                name: "Gmail Assistant",
                status: "AUTH_REQUIRED",
                scopes: "gmail.readonly, compose",
                desc: "Search, summarize threads, create drafts. Sending requires user approval.",
                icon: Mail,
              },
              {
                name: "Google Drive Vault",
                status: "AUTH_REQUIRED",
                scopes: "drive.readonly, file",
                desc: "Asset indexing, document retrieval, and workspace staging.",
                icon: HardDrive,
              },
              {
                name: "YouTube Creator Studio",
                status: "AUTH_REQUIRED",
                scopes: "youtube.readonly",
                desc: "Video metadata, analytics, upload staging. Publishing requires approval.",
                icon: Youtube,
              },
              {
                name: "Google Flow Video Pipeline",
                status: "STANDBY",
                scopes: "flow.workspace.handoff",
                desc: "Prompt preparation and direct browser handoff for Google Labs Flow.",
                icon: Video,
              },
            ].map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.name} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[var(--ag-elevated)] border border-[var(--ag-border)] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-sky-400" />
                      </div>
                      <span className="text-xs font-semibold text-[var(--ag-text)]">{service.name}</span>
                    </div>
                    <span className={clsx(
                      "text-[9px] px-2 py-0.5 rounded font-mono font-semibold border",
                      service.status === "CONNECTED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    )}>
                      {service.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--ag-text-sec)] leading-relaxed">{service.desc}</p>
                  <p className="text-[10px] text-[var(--ag-muted)] font-mono">Scopes: {service.scopes}</p>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
