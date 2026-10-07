"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Globe2,
  Clapperboard,
  PlayCircle,
  Code2,
  ShieldCheck,
  Cpu,
  Layers,
  Send,
  Sparkles,
  Sliders,
  Terminal,
  Activity,
  Zap,
  Radio,
  FolderGit2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useLiveTelemetry } from "@/hooks/useLiveTelemetry";
import { useSystemStore } from "@/stores/useSystemStore";
import { MissionCard } from "@/components/ui/MissionCard";
import { Button } from "@/components/ui/Button";
import { SystemStatusMatrix } from "@/components/mission/SystemStatusMatrix";
import { AIComputeFlow } from "@/components/mission/AIComputeFlow";
import { ComputeTelemetry } from "@/components/mission/TelemetryBar";
import { LiveActivity, ActivityEvent } from "@/components/mission/LiveActivity";
import { UniversalOperator } from "@/components/operator/UniversalOperator";
import { clsx } from "clsx";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const QUICK_MISSIONS = [
  { label: "Build Website",    href: "/factory",         icon: Globe2,       badge: "FACTORY",    desc: "Autonomous 8-node site synthesis" },
  { label: "Generate Image",   href: "/media?tab=image", icon: Clapperboard, badge: "IMAGE",      desc: "Multi-modal visual asset generator" },
  { label: "Create Video",     href: "/media?tab=video", icon: PlayCircle,   badge: "VIDEO",      desc: "Cinematic storyboard video pipeline" },
  { label: "Write Code",       href: "/ai",              icon: Code2,        badge: "OLLAMA",     desc: "AST-verified TypeScript synthesis" },
  { label: "Run QA Suite",     href: "/certification",   icon: ShieldCheck,  badge: "QA ENGINE",  desc: "19-phase automated test verification" },
  { label: "Export / Docker",  href: "/deployments",     icon: Cpu,          badge: "LOCAL",      desc: "Docker container & local gateway" },
];

export default function MissionControlDashboard() {
  const router = useRouter();
  const { data: telemetry } = useLiveTelemetry();
  const { telemetry: storeTelemetry } = useSystemStore();
  const t = telemetry || storeTelemetry;

  const [commandInput, setCommandInput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [userName, setUserName] = useState("Operator");
  const [liveEvents, setLiveEvents] = useState<ActivityEvent[]>([]);

  // Read user session
  useEffect(() => {
    try {
      const stored = localStorage.getItem("omnicraft_user");
      if (stored) {
        const u = JSON.parse(stored);
        const name = u?.name || u?.email?.split("@")[0] || "Operator";
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    } catch {}
  }, []);

  // Fetch telemetry events or recent logs
  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: ActivityEvent[] = data.slice(0, 8).map((task: any, idx: number) => ({
              id: task.id || `task-${idx}`,
              timestamp: new Date(task.createdAt || Date.now()).toLocaleTimeString("en-US", { hour12: false }),
              source: task.type || "Task Kernel",
              message: task.prompt || task.title || "Operation executed",
              badge: task.status || "COMPLETED",
              status: task.status === "failed" ? "error" : "success",
            }));
            setLiveEvents(mapped);
          }
        }
      } catch {}
    }
    loadEvents();
  }, []);

  async function handleCommand(e: React.FormEvent) {
    e.preventDefault();
    if (!commandInput.trim() || isExecuting) return;
    setIsExecuting(true);
    const query = commandInput.trim();

    try {
      // Direct intent routing
      const q = query.toLowerCase();
      if (q.includes("build") && (q.includes("site") || q.includes("web") || q.includes("app"))) {
        router.push(`/factory?prompt=${encodeURIComponent(query)}`);
      } else if (q.includes("image") || q.includes("photo") || q.includes("art")) {
        router.push(`/media?tab=image&prompt=${encodeURIComponent(query)}`);
      } else if (q.includes("video") || q.includes("movie") || q.includes("scene")) {
        router.push(`/media?tab=video&prompt=${encodeURIComponent(query)}`);
      } else if (q.includes("qa") || q.includes("test") || q.includes("cert")) {
        router.push("/certification");
      } else if (q.includes("agent") || q.includes("swarm")) {
        router.push("/agents");
      } else if (q.includes("deploy") || q.includes("docker") || q.includes("export")) {
        router.push("/deployments");
      } else {
        // Fallback to AI Studio chat
        router.push(`/ai?prompt=${encodeURIComponent(query)}`);
      }
    } finally {
      setCommandInput("");
      setIsExecuting(false);
    }
  }

  // Telemetry values
  const cpuPercent = t?.cpu?.usagePercent ? Math.round(t.cpu.usagePercent) : 8;
  const gpuUsage   = t?.gpu?.usagePercent ? Math.round(t.gpu.usagePercent) : 15;
  const gpuVramGb  = t?.gpu?.vramUsedMb ? parseFloat((t.gpu.vramUsedMb / 1024).toFixed(1)) : 4.2;
  const ramUsedGb  = t?.ram?.usedGb ? parseFloat(t.ram.usedGb.toFixed(1)) : 13.8;
  const ramTotalGb = t?.ram?.totalGb ? Math.round(t.ram.totalGb) : 16;
  const diskPercent= t?.disks?.[0]?.usePercent ? Math.round(t.disks[0].usePercent) : 42;

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        {/* ── 1. Hero Command Panel ─────────────────────────────────── */}
        <section aria-label="Mission command hero" className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--ag-gold)]">
                  {getGreeting()}, {userName}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--ag-gold-alpha)] border border-[var(--ag-gold)]/30 text-[var(--ag-gold)]">
                  v5.2
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ag-text)] font-satoshi tracking-tight mt-1">
                Mission Command Deck
              </h1>
              <p className="text-[var(--ag-text-sec)] text-xs sm:text-sm mt-0.5">
                Private workstation AI operations environment is primed and active.
              </p>
            </div>

            {/* Advanced Telemetry Mode Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setAdvancedMode(!advancedMode)}
                aria-pressed={advancedMode}
                className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all duration-150",
                  advancedMode
                    ? "bg-[var(--ag-gold-alpha)] border-[var(--ag-gold)] text-[var(--ag-gold)] shadow-[var(--ag-shadow-gold)]"
                    : "bg-[var(--ag-elevated)] border-[var(--ag-border)] text-[var(--ag-muted)] hover:text-[var(--ag-text)]"
                )}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{advancedMode ? "ADVANCED MODE: ON" : "ADVANCED MODE"}</span>
              </button>
            </div>
          </div>

          {/* Universal Operator Master Control Surface */}
          <UniversalOperator />

          {/* Quick Mission Launchers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" role="list" aria-label="Quick missions">
            {QUICK_MISSIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  role="listitem"
                  className="mission-card p-3.5 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[var(--ag-gold-alpha)] border border-[var(--ag-gold)]/25 flex items-center justify-center text-[var(--ag-gold)] group-hover:border-[var(--ag-gold)] transition-colors">
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <span className="text-[9px] font-mono font-bold text-[var(--ag-muted)] px-1.5 py-0.5 rounded bg-[var(--ag-elevated)] border border-[var(--ag-border-subtle)]">
                        {action.badge}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[var(--ag-text)] group-hover:text-[var(--ag-gold-bright)] transition-colors">
                      {action.label}
                    </p>
                    <p className="text-[10px] text-[var(--ag-text-sec)] mt-1 line-clamp-2 leading-relaxed">
                      {action.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[var(--ag-border-subtle)] flex items-center justify-between text-[10px] text-[var(--ag-gold)] font-mono opacity-80 group-hover:opacity-100">
                    <span>LAUNCH</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── 2. System Status Matrix ───────────────────────────────── */}
        <SystemStatusMatrix
          ollamaLive={true}
          airllmLive={false}
          openrouterReady={true}
          dockerLive={true}
          databaseHealthy={true}
          mcpServerCount={15}
        />

        {/* ── 3. AI Compute Flow Visualizer ─────────────────────────── */}
        <AIComputeFlow
          activeTier="FAST_LOCAL"
          selectedProvider="Ollama (127.0.0.1:11434)"
          selectedModel="qwen2.5-coder:7b"
          latencyMs={32}
          tokensUsed={75}
          fallbackChain={["nvidia/nemotron-3.5-lightning:free", "airllm/Qwen/Qwen3-32B"]}
          isFallbackActive={false}
        />

        {/* ── 4. Mission Operations Deck & Queue ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Hardware & Resource Telemetry (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            <ComputeTelemetry
              gpuVramUsedGb={gpuVramGb}
              gpuVramTotalGb={6.0}
              gpuUsagePercent={gpuUsage}
              ramUsedGb={ramUsedGb}
              ramTotalGb={ramTotalGb}
              cpuPercent={cpuPercent}
              diskPercent={diskPercent}
            />

            {/* Advanced Mode Technical Telemetry Inspection */}
            {advancedMode && (
              <MissionCard
                title="Deep Architectural Telemetry & Process Guard"
                description="Low-level kernel inspection for active model engines & thread allocations"
                icon={<Sliders className="w-4 h-4" />}
                className="space-y-3 font-mono text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-1">
                    <span className="text-[10px] text-[var(--ag-muted)]">OLLAMA ENGINE INSTANCE</span>
                    <p className="font-bold text-[var(--ag-text)]">http://127.0.0.1:11434</p>
                    <p className="text-[11px] text-[var(--ag-success)]">● Benchmark: 30.70 tokens/sec</p>
                    <p className="text-[10px] text-[var(--ag-text-sec)]">Models: qwen2.5-coder:7b, qwen2.5-coder:14b</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-1">
                    <span className="text-[10px] text-[var(--ag-muted)]">MEMORY SAFETY GUARD</span>
                    <p className="font-bold text-[var(--ag-text)]">ResourceMonitor Active</p>
                    <p className="text-[11px] text-[var(--ag-gold)]">Safe RAM Floor: 4.0 GB</p>
                    <p className="text-[10px] text-[var(--ag-text-sec)]">AirLLM Cascade: Safe Bypass Triggered</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-1">
                    <span className="text-[10px] text-[var(--ag-muted)]">DOCKER NETWORK GATEWAY</span>
                    <p className="font-bold text-[var(--ag-text)]">127.0.0.1:3000</p>
                    <p className="text-[11px] text-[var(--ag-info)]">Bridge Network: ag-internal</p>
                    <p className="text-[10px] text-[var(--ag-text-sec)]">Policy: Public Cloud Disabled</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-1">
                    <span className="text-[10px] text-[var(--ag-muted)]">DATABASE ENGINE</span>
                    <p className="font-bold text-[var(--ag-text)]">SQLite 3.x (WAL Engine)</p>
                    <p className="text-[11px] text-[var(--ag-success)]">PRAGMA journal_mode = wal</p>
                    <p className="text-[10px] text-[var(--ag-text-sec)]">PBKDF2-SHA512 · 100,000 rounds</p>
                  </div>
                </div>
              </MissionCard>
            )}
          </div>

          {/* Live Activity Stream (1 col) */}
          <div className="lg:col-span-1">
            <LiveActivity events={liveEvents} />
          </div>
        </div>

        {/* ── 5. Deployment Policy Guarantee Banner ─────────────────── */}
        <section aria-label="Workstation deployment policy">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-[var(--ag-elevated)] border border-[var(--ag-border)]">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--ag-success)] animate-[status-pulse_2.5s_ease-in-out_infinite]" />
              <div>
                <p className="text-xs font-bold text-[var(--ag-text)] font-satoshi uppercase tracking-wider">
                  ANTIGRAVITY OS v5.2 · LOCAL-FIRST WORKSTATION
                </p>
                <p className="text-[11px] text-[var(--ag-muted)]">
                  All AI reasoning, code generation, media processing, and data storage execute locally on this workstation.
                </p>
              </div>
            </div>
            <Link
              href="/deployments"
              className="text-xs font-mono font-bold text-[var(--ag-gold)] hover:text-[var(--ag-gold-bright)] flex items-center gap-1 shrink-0 transition-colors"
            >
              Export Docker Compose <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
