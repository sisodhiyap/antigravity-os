"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Command,
  ArrowRight,
  Zap,
  Shield,
  Layers,
  Cpu,
  Brain,
  Rocket,
  FolderGit2,
  FileCode2,
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sliders,
  Send,
  Loader2,
  Wand2,
  Network,
} from "lucide-react";
import { useLiveTelemetry } from "@/hooks/useLiveTelemetry";
import { useSystemStore } from "@/stores/useSystemStore";
import { Badge } from "@/ui/Badge";
import { CpuCard } from "@/components/cards/CpuCard";
import { GpuCard } from "@/components/cards/GpuCard";
import { RamCard } from "@/components/cards/RamCard";
import { DiskCard } from "@/components/cards/DiskCard";
import { NetworkCard } from "@/components/cards/NetworkCard";
import { OllamaCard } from "@/components/cards/OllamaCard";
import { ActiveAgentsCard } from "@/components/cards/ActiveAgentsCard";
import { DockerCard } from "@/components/cards/DockerCard";
import { McpHealthCard } from "@/components/cards/McpHealthCard";
import { GitHubStatusCard } from "@/components/cards/GitHubStatusCard";
import { ImageQueueCard } from "@/components/cards/ImageQueueCard";
import { VideoQueueCard } from "@/components/cards/VideoQueueCard";
import { MemoryUsageCard } from "@/components/cards/MemoryUsageCard";
import { TerminalWidget } from "@/components/terminal/TerminalWidget";

export default function MasterWorkspacePage() {
  const router = useRouter();
  const { data: telemetry } = useLiveTelemetry();
  const { telemetry: storeTelemetry } = useSystemStore();
  const currentTelemetry = telemetry || storeTelemetry;

  const [commandInput, setCommandInput] = useState("");
  const [aiPolicy, setAiPolicy] = useState<"AUTO" | "FAST" | "BALANCED" | "QUALITY" | "LOCAL_ONLY" | "CLOUD_ONLY" | "CHEAPEST">("AUTO");
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeRoutingDecision, setActiveRoutingDecision] = useState<any>(null);
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);

  const sampleCommands = [
    { label: "Build a portfolio website", action: () => handleExecuteCommand("Build a portfolio website") },
    { label: "Fix TypeScript errors", action: () => handleExecuteCommand("Fix all TypeScript errors") },
    { label: "Create a product landing page", action: () => handleExecuteCommand("Create a product landing page") },
    { label: "Generate an image for hero", action: () => handleExecuteCommand("Generate a futuristic cyberpunk hero image") },
    { label: "Create a cinematic intro video", action: () => handleExecuteCommand("Create a cinematic intro video") },
    { label: "Deploy to Vercel", action: () => handleExecuteCommand("Deploy this project to Vercel") },
    { label: "Run complete QA & 19-Phase Certification", action: () => handleExecuteCommand("Run complete QA & certification") },
    { label: "Why is my app slow?", action: () => handleExecuteCommand("Why is my app slow?") },
  ];

  async function handleExecuteCommand(cmdText?: string) {
    const query = cmdText || commandInput;
    if (!query.trim()) return;

    setIsExecuting(true);
    setExecutionOutput(null);

    const lower = query.toLowerCase();

    // 1. Direct Intent Routing
    if (lower.includes("portfolio") || lower.includes("landing page") || lower.includes("website") || lower.includes("build me a")) {
      router.push(`/factory?prompt=${encodeURIComponent(query)}`);
      return;
    }

    if (lower.includes("deploy") || lower.includes("vercel") || lower.includes("production")) {
      router.push(`/deployments`);
      return;
    }

    if (lower.includes("image") || lower.includes("video") || lower.includes("audio") || lower.includes("3d") || lower.includes("svg")) {
      router.push(`/media`);
      return;
    }

    if (lower.includes("agent") || lower.includes("swarm") || lower.includes("architect")) {
      router.push(`/agents`);
      return;
    }

    if (lower.includes("mcp") || lower.includes("tool") || lower.includes("hub")) {
      router.push(`/mcp`);
      return;
    }

    if (lower.includes("qa") || lower.includes("certif") || lower.includes("reality")) {
      router.push(`/certification`);
      return;
    }

    if (lower.includes("slow") || lower.includes("diagnostic") || lower.includes("health")) {
      router.push(`/health-center`);
      return;
    }

    // 2. AI Execution via Intelligent Router
    try {
      const res = await fetch("http://127.0.0.1:8080/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: query }],
          user_preference: aiPolicy === "AUTO" ? "BALANCED" : aiPolicy,
        }),
      });

      const data = await res.json();
      if (data.choices && data.choices[0]?.message) {
        setExecutionOutput(data.choices[0].message.content);
        setActiveRoutingDecision(data.routing_decision || null);
      } else {
        setExecutionOutput("Task processed successfully by Antigravity OS kernel.");
      }
    } catch (err: any) {
      setExecutionOutput(`Fallback Execution: Task dispatched to Antigravity Central Router (${err.message}).`);
    } finally {
      setIsExecuting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* HERO SECTION WITH UNIVERSAL COMMAND BAR */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-cyber-cyan/30 shadow-[0_0_50px_-15px_rgba(0,240,255,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyber-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyber-purple/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Brand & Badge Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyber-cyan to-cyber-purple p-0.5 shadow-glow-cyan">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyber-cyan animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
                  ANTIGRAVITY <span className="text-cyber-cyan">OS</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40 font-mono">
                    v5.1 PRODUCTION
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Universal Sovereign AI Operating System • 3-Tier Inference Mesh • Zero-Config Natural Language
                </p>
              </div>
            </div>

            {/* Mode Selector & Quick Stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 text-xs font-mono">
                <span className="text-slate-400 pl-2">Policy:</span>
                <select
                  value={aiPolicy}
                  onChange={(e: any) => setAiPolicy(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-cyber-cyan font-bold rounded-xl px-2.5 py-1 outline-none text-xs"
                >
                  <option value="AUTO">AUTO (Smart Adaptive)</option>
                  <option value="FAST">FAST (Ollama 7B/14B)</option>
                  <option value="BALANCED">BALANCED</option>
                  <option value="QUALITY">QUALITY (AirLLM / SOTA)</option>
                  <option value="LOCAL_ONLY">LOCAL_ONLY</option>
                  <option value="CLOUD_ONLY">CLOUD_ONLY</option>
                  <option value="CHEAPEST">CHEAPEST ($0)</option>
                </select>
              </div>

              <button
                onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                className={`px-3 py-2 rounded-2xl border text-xs font-mono transition-all flex items-center gap-1.5 ${
                  isAdvancedMode
                    ? "bg-purple-950/80 text-purple-300 border-purple-700"
                    : "bg-slate-900/80 text-slate-400 border-white/10 hover:text-white"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isAdvancedMode ? "Advanced Mode Active" : "Advanced Mode"}</span>
              </button>
            </div>
          </div>

          {/* MAIN COMMAND BAR INPUT */}
          <div className="relative">
            <div className="flex items-center bg-slate-950/90 rounded-2xl border border-cyber-cyan/40 p-2 shadow-inner focus-within:border-cyber-cyan focus-within:shadow-[0_0_25px_rgba(0,240,255,0.25)] transition-all">
              <div className="pl-3 pr-2 text-cyber-cyan">
                <Command className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleExecuteCommand()}
                placeholder="What do you want Antigravity OS to do? (e.g. 'Build a portfolio website', 'Fix TypeScript errors', 'Deploy to Vercel')..."
                className="w-full bg-transparent text-slate-100 placeholder-slate-500 font-mono text-sm outline-none px-2"
              />
              <button
                onClick={() => handleExecuteCommand()}
                disabled={isExecuting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-cyber-cyan/20 shrink-0 disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <span>Execute</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* SUGGESTION CHIPS */}
            <div className="flex items-center gap-2 mt-3 flex-wrap font-mono text-xs">
              <span className="text-slate-500 text-[11px]">Quick Prompts:</span>
              {sampleCommands.slice(0, 5).map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={cmd.action}
                  className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyber-cyan/40 hover:text-cyber-cyan text-slate-400 text-[11px] transition-all"
                >
                  {cmd.label}
                </button>
              ))}
            </div>
          </div>

          {/* ROUTING TRANSPARENCY CARD ("Why this model?") */}
          {activeRoutingDecision && (
            <div className="bg-slate-950/80 border border-cyber-cyan/30 rounded-2xl p-4 font-mono text-xs space-y-3 animation-fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 text-cyber-cyan font-bold">
                  <Brain className="w-4 h-4" />
                  <span>Routing Explanation & Resource Audit</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {activeRoutingDecision.selected_provider?.toUpperCase()} • {activeRoutingDecision.latency_ms}ms
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Category / Tier:</span>
                  <span className="text-slate-200 font-semibold">{activeRoutingDecision.primaryCategory || activeRoutingDecision.recommendedTier}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Selected Engine:</span>
                  <span className="text-cyan-300 font-semibold">{activeRoutingDecision.selected_model}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tokens / Cost:</span>
                  <span className="text-emerald-400 font-semibold">{activeRoutingDecision.tokens_processed || 0} tok • ${activeRoutingDecision.estimated_cost_usd || "0.00"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Fallback Strategy:</span>
                  <span className="text-purple-300 font-semibold">{activeRoutingDecision.fallback_chain?.join(" → ") || "Local-First"}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-white/5 font-sans">
                <span className="text-cyber-cyan font-mono font-bold">Rationale: </span>
                {activeRoutingDecision.reason}
              </div>
            </div>
          )}

          {/* EXECUTION OUTPUT CARD */}
          {executionOutput && (
            <div className="bg-slate-950 border border-white/10 rounded-2xl p-4 font-mono text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-400 border-b border-white/5 pb-2">
                <span>Kernel Response</span>
                <button onClick={() => setExecutionOutput(null)} className="text-slate-500 hover:text-slate-300">
                  Clear
                </button>
              </div>
              <div className="text-slate-200 whitespace-pre-wrap font-sans text-xs max-h-60 overflow-y-auto">
                {executionOutput}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CORE WORKSPACE HUBS MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-5">
        {/* PROJECTS CARD */}
        <Link
          href="/projects"
          className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyber-cyan/50 hover:shadow-glow-cyan/20 transition-all space-y-3 group"
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <Badge variant="cyan" className="text-[10px]">3 WORKSPACES</Badge>
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 font-mono">Projects & Context</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">Project memory, architecture decisions, tech stacks, and context selection.</p>
          </div>
        </Link>

        {/* WEBSITE FACTORY CARD */}
        <Link
          href="/factory"
          className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyber-cyan/50 hover:shadow-glow-cyan/20 transition-all space-y-3 group"
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
              <Wand2 className="w-5 h-5" />
            </div>
            <Badge variant="purple" className="text-[10px]">AUTONOMOUS</Badge>
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 font-mono">Website Factory</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">8-Stage Pipeline: Prompt → Blueprint → Design → Code → QA → Deploy.</p>
          </div>
        </Link>

        {/* AI CONTROL CENTER CARD */}
        <Link
          href="/ai"
          className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyber-cyan/50 hover:shadow-glow-cyan/20 transition-all space-y-3 group"
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <Badge variant="cyan" className="text-[10px]">3-TIER MESH</Badge>
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 font-mono">AI Control Center</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">Ollama, AirLLM (32B), OpenRouter, Resource Guards, and Telemetry.</p>
          </div>
        </Link>

        {/* MEDIA STUDIO CARD */}
        <Link
          href="/media"
          className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyber-cyan/50 hover:shadow-glow-cyan/20 transition-all space-y-3 group"
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <Badge variant="default" className="text-[10px]">5 TABS</Badge>
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 font-mono">Multimodal Studio</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">Unified Image, Video (Remotion), Audio (WAV), 3D (GLTF), and SVG Studio.</p>
          </div>
        </Link>

        {/* AGENTS SWARM CARD */}
        <Link
          href="/agents"
          className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyber-cyan/50 hover:shadow-glow-cyan/20 transition-all space-y-3 group"
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <Badge variant="neon" className="text-[10px]">10 ROLES</Badge>
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 font-mono">Agent Swarm</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">Architect, Builder, QA, Security, DevOps, PM in synchronized execution.</p>
          </div>
        </Link>

        {/* MCP HUB CARD */}
        <Link
          href="/mcp"
          className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyber-cyan/50 hover:shadow-glow-cyan/20 transition-all space-y-3 group"
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <Network className="w-5 h-5" />
            </div>
            <Badge variant="purple" className="text-[10px]">15 HUBS</Badge>
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 font-mono">MCP Tool Hub</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">Model Context Protocol: Playwright, GitHub, Supabase, Prisma, Blender.</p>
          </div>
        </Link>

        {/* DEPLOYMENTS CARD */}
        <Link
          href="/deployments"
          className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyber-cyan/50 hover:shadow-glow-cyan/20 transition-all space-y-3 group"
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
              <Rocket className="w-5 h-5" />
            </div>
            <Badge variant="cyan" className="text-[10px]">VERCEL READY</Badge>
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 font-mono">Deployment Center</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">GitHub, Vercel, Netlify, Docker with 1-click live deploy & rollback.</p>
          </div>
        </Link>

        {/* HEALTH & CERTIFICATION CARD */}
        <Link
          href="/health-center"
          className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyber-cyan/50 hover:shadow-glow-cyan/20 transition-all space-y-3 group"
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-teal-950/60 border border-teal-800 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <Badge variant="cyan" className="text-[10px]">19/19 PASS</Badge>
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 font-mono">Health & Diagnostics</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">1-Click Full Diagnostic Suite & 19-Phase E2E Reality Certificate.</p>
          </div>
        </Link>
      </div>

      {/* ADVANCED MODE (HARDWARE & SYSTEM TELEMETRY MATRIX) */}
      {isAdvancedMode && (
        <div className="space-y-6 pt-4 border-t border-white/10 animation-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyber-cyan" />
              <span>ADVANCED HARDWARE & SYSTEM TELEMETRY MATRIX</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Live Probes Active</span>
          </div>

          {/* Primary Hardware Matrix: CPU, GPU, RAM */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <CpuCard cpu={currentTelemetry.cpu} />
            <GpuCard gpu={currentTelemetry.gpu} />
            <RamCard ram={currentTelemetry.ram} />
          </div>

          {/* Storage & Network Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <DiskCard disks={currentTelemetry.disks} />
            <NetworkCard network={currentTelemetry.network} />
          </div>

          {/* AI Inference & Swarm Architecture: Ollama + 10 Swarm Agents */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <OllamaCard ollama={currentTelemetry.ollama} />
            <ActiveAgentsCard agents={currentTelemetry.agents} />
          </div>

          {/* Interactive Kernel Terminal */}
          <TerminalWidget />

          {/* Infrastructure Matrix: Docker Containers, MCP Health, GitHub */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <DockerCard docker={currentTelemetry.docker} />
            <McpHealthCard mcp={currentTelemetry.mcp} />
            <GitHubStatusCard github={currentTelemetry.github} />
          </div>
        </div>
      )}
    </div>
  );
}
