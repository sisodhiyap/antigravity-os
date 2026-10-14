"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  HardDrive,
  ShieldCheck,
  Zap,
  Activity,
  DownloadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Square,
  FileText,
  Lock,
  Globe,
  Coins,
  TrendingDown,
  Layers,
  ArrowUpRight,
  RotateCcw,
  Sparkles,
  Database,
  Trash2,
} from "lucide-react";
import { LocalEngineMetadata, EngineStatus, FabricExecutionMode, FabricDiagnosticsReport } from "@/server/fabric/types";
import { TaskRoutingPolicyMode, CostOptimizationMetrics, BudgetConfig } from "@/server/fabric/cost/types";
import { EngineUpdateRecord, UpdatePolicyConfig } from "@/server/fabric/updates/types";

export default function SovereignFabricDashboard() {
  const [activeTab, setActiveTab] = useState<"ENGINES" | "COST_GOVERNOR" | "UPDATES">("ENGINES");
  const [diagnostics, setDiagnostics] = useState<FabricDiagnosticsReport | null>(null);
  const [engines, setEngines] = useState<LocalEngineMetadata[]>([]);
  const [costMetrics, setCostMetrics] = useState<CostOptimizationMetrics | null>(null);
  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig | null>(null);
  const [routingMode, setRoutingMode] = useState<TaskRoutingPolicyMode>("LOCAL_FIRST");
  const [updateRecords, setUpdateRecords] = useState<EngineUpdateRecord[]>([]);
  const [updatePolicy, setUpdatePolicy] = useState<UpdatePolicyConfig | null>(null);
  const [cacheStats, setCacheStats] = useState<{ activeEntriesCount: number; totalHitsCount: number; totalTokensSaved: number } | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [executingEngineId, setExecutingEngineId] = useState<string | null>(null);
  const [selectedEngineForInstall, setSelectedEngineForInstall] = useState<LocalEngineMetadata | null>(null);
  const [installConsentGiven, setInstallConsentGiven] = useState<boolean>(false);
  const [installFeedback, setInstallFeedback] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchFabricState = async () => {
    setIsRefreshing(true);
    try {
      const [statusRes, enginesRes, costRes, modeRes, updatesRes, cacheRes] = await Promise.all([
        fetch("/api/fabric/status"),
        fetch("/api/fabric/engines"),
        fetch("/api/fabric/cost"),
        fetch("/api/fabric/cost/mode"),
        fetch("/api/fabric/updates"),
        fetch("/api/fabric/cost/cache"),
      ]);

      if (statusRes.ok) {
        const data = await statusRes.json();
        setDiagnostics(data.diagnostics);
      }
      if (enginesRes.ok) {
        const data = await enginesRes.json();
        setEngines(data.engines);
      }
      if (costRes.ok) {
        const data = await costRes.json();
        setCostMetrics(data.metrics);
        setBudgetConfig(data.budgetConfig);
      }
      if (modeRes.ok) {
        const data = await modeRes.json();
        setRoutingMode(data.mode);
      }
      if (updatesRes.ok) {
        const data = await updatesRes.json();
        setUpdateRecords(data.records);
        setUpdatePolicy(data.policy);
      }
      if (cacheRes.ok) {
        const data = await cacheRes.json();
        setCacheStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load fabric state", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFabricState();
  }, []);

  const handleSetRoutingMode = async (mode: TaskRoutingPolicyMode) => {
    try {
      const res = await fetch("/api/fabric/cost/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      if (res.ok) {
        setRoutingMode(mode);
        setActionNotice(`Task routing policy switched to ${mode}.`);
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch (err) {
      console.error("Error setting routing mode", err);
    }
  };

  const handleStageUpdate = async (engineId: string) => {
    setExecutingEngineId(engineId);
    try {
      const res = await fetch("/api/fabric/updates/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ engineId }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Update for ${engineId} passed all 10 gates and is active.`);
      } else {
        setActionNotice(`Update staging rejected: ${data.error}`);
      }
      await fetchFabricState();
    } catch (err: any) {
      setActionNotice(`Staging error: ${err.message}`);
    } finally {
      setExecutingEngineId(null);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleRollback = async (engineId: string) => {
    setExecutingEngineId(engineId);
    try {
      const res = await fetch("/api/fabric/updates/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ engineId }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Engine ${engineId} rolled back cleanly to ${data.restoredVersion}.`);
      }
      await fetchFabricState();
    } catch (err: any) {
      setActionNotice(`Rollback error: ${err.message}`);
    } finally {
      setExecutingEngineId(null);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleClearCache = async () => {
    try {
      const res = await fetch("/api/fabric/cost/cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_all" }),
      });
      if (res.ok) {
        setActionNotice("Deterministic output cache purged successfully.");
        await fetchFabricState();
      }
    } catch (err) {
      console.error("Error clearing cache", err);
    } finally {
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleProbe = async (id: string) => {
    try {
      await fetch(`/api/fabric/engines/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "probe" }),
      });
      await fetchFabricState();
    } catch (err) {
      console.error("Error probing engine", err);
    }
  };

  const handleInstall = async (engine: LocalEngineMetadata) => {
    if (!installConsentGiven) {
      setInstallFeedback("Explicit confirmation checkbox required.");
      return;
    }

    setExecutingEngineId(engine.id);
    setInstallFeedback(`Installing ${engine.name} in application directory...`);

    try {
      const res = await fetch("/api/fabric/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "install",
          engineId: engine.id,
          userConsentGranted: true,
        }),
      });

      if (res.ok) {
        setInstallFeedback(`Successfully installed ${engine.name}!`);
        setTimeout(() => {
          setSelectedEngineForInstall(null);
          setInstallConsentGiven(false);
          setInstallFeedback(null);
        }, 1200);
        await fetchFabricState();
      } else {
        const data = await res.json();
        setInstallFeedback(`Installation failed: ${data.error}`);
      }
    } catch (err: any) {
      setInstallFeedback(`Installation failed: ${err.message}`);
    } finally {
      setExecutingEngineId(null);
    }
  };

  const filteredEngines = engines.filter((e) => {
    const matchesCategory = selectedCategory === "ALL" || e.category === selectedCategory;
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.supportedCapabilities.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status: EngineStatus) => {
    switch (status) {
      case "RUNNING":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"><CheckCircle2 className="w-3.5 h-3.5" /> RUNNING</span>;
      case "AVAILABLE_LOCAL":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-500/30"><CheckCircle2 className="w-3.5 h-3.5" /> LOCAL READY</span>;
      case "AVAILABLE_WITH_INTERNET":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-400 border border-blue-500/30"><Globe className="w-3.5 h-3.5" /> HYBRID ONLY</span>;
      case "MODEL_MISSING":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-500/30"><AlertTriangle className="w-3.5 h-3.5" /> WEIGHTS MISSING</span>;
      case "NOT_INSTALLED":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-400 border border-zinc-700/40"><HardDrive className="w-3.5 h-3.5" /> NOT INSTALLED</span>;
      case "STOPPED":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-400 border border-zinc-700"><Square className="w-3.5 h-3.5" /> STOPPED</span>;
      case "NOT_SUPPORTED_ON_PLATFORM":
      case "FAILED":
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-500/30"><XCircle className="w-3.5 h-3.5" /> {status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F7F5EF] p-6 lg:p-10 font-sans selection:bg-[#F5C451]/20">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#F5C451]/15 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-[#F5C451] shadow-[0_0_12px_#F5C451]" />
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#F7F5EF]">
              SOVEREIGN SELF-SUSTAINING AI FABRIC
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono uppercase bg-[#17140D] text-[#F5C451] border border-[#F5C451]/30">
              V7 Sovereign Plane
            </span>
          </div>
          <p className="text-sm text-[#B8B2A5] mt-1">
            Local-first execution, continuous API cost optimization, deterministic caching, and safe staged upstream auto-updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFabricState}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-[#11100D] border border-[#F5C451]/20 hover:border-[#F5C451]/50 text-[#F5C451] transition-all"
            title="Refresh All Fabric Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => window.open("/api/fabric/logs", "_blank")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#11100D] border border-[#F5C451]/20 hover:border-[#F5C451]/50 text-xs text-[#F7F5EF] transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-[#F5C451]" />
            <span>Audit Report</span>
          </button>
        </div>
      </div>

      {/* Action Notification Ribbon */}
      {actionNotice && (
        <div className="mt-4 p-3 rounded-xl bg-[#17140D] border border-[#F5C451]/40 text-[#F5C451] text-xs font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(245,196,81,0.15)] animate-fade-in">
          <Sparkles className="w-4 h-4 text-[#F5C451]" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-3 mt-6 border-b border-[#F5C451]/15 pb-2">
        <button
          onClick={() => setActiveTab("ENGINES")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "ENGINES"
              ? "bg-[#F5C451] text-[#050505] shadow-[0_0_15px_rgba(245,196,81,0.25)]"
              : "text-[#B8B2A5] hover:text-[#F7F5EF] hover:bg-[#11100D]"
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Local Engines & Hardware ({engines.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("COST_GOVERNOR")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "COST_GOVERNOR"
              ? "bg-[#F5C451] text-[#050505] shadow-[0_0_15px_rgba(245,196,81,0.25)]"
              : "text-[#B8B2A5] hover:text-[#F7F5EF] hover:bg-[#11100D]"
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>API Cost & Token Governor</span>
        </button>

        <button
          onClick={() => setActiveTab("UPDATES")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "UPDATES"
              ? "bg-[#F5C451] text-[#050505] shadow-[0_0_15px_rgba(245,196,81,0.25)]"
              : "text-[#B8B2A5] hover:text-[#F7F5EF] hover:bg-[#11100D]"
          }`}
        >
          <DownloadCloud className="w-4 h-4" />
          <span>Upstream Self-Update Center ({updateRecords.length})</span>
        </button>
      </div>

      {/* TAB 1: ENGINES & HARDWARE WORKSPACE */}
      {activeTab === "ENGINES" && (
        <div className="mt-6 space-y-6">
          {/* Hardware & Resource Governor Ribbon */}
          {diagnostics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0D0C09] border border-[#F5C451]/15">
                <div className="flex items-center gap-2 text-xs text-[#B8B2A5] font-medium uppercase tracking-wider">
                  <Cpu className="w-4 h-4 text-[#F5C451]" /> Host CPU
                </div>
                <div className="mt-2 text-base font-semibold text-[#F7F5EF] truncate">
                  {diagnostics.hostHardware.cpu}
                </div>
                <div className="text-xs text-[#827C70] mt-0.5 font-mono">
                  RAM: {diagnostics.hostHardware.ramGb} GB Available
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0D0C09] border border-[#F5C451]/15">
                <div className="flex items-center gap-2 text-xs text-[#B8B2A5] font-medium uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-[#F5C451]" /> GPU & VRAM Governor
                </div>
                <div className="mt-2 text-base font-semibold text-[#F7F5EF] truncate">
                  {diagnostics.hostHardware.gpuRenderer}
                </div>
                <div className="text-xs text-[#827C70] mt-0.5 font-mono">
                  VRAM: {diagnostics.hostHardware.vramMb} MB ({diagnostics.hostHardware.cudaAvailable ? "CUDA Ready" : "CPU/MPS"})
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0D0C09] border border-[#F5C451]/15">
                <div className="flex items-center gap-2 text-xs text-[#B8B2A5] font-medium uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-[#F5C451]" /> Serialized GPU Scheduler
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      diagnostics.gpuScheduler.isGpuLocked ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                    }`}
                  />
                  <span className="text-base font-semibold text-[#F7F5EF]">
                    {diagnostics.gpuScheduler.isGpuLocked
                      ? `Locked: ${diagnostics.gpuScheduler.activeGpuEngine}`
                      : "Idle & Ready"}
                  </span>
                </div>
                <div className="text-xs text-[#827C70] mt-0.5 font-mono">
                  Queued: {diagnostics.gpuScheduler.queuedJobsCount} (Serialized)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0D0C09] border border-[#F5C451]/15">
                <div className="flex items-center gap-2 text-xs text-[#B8B2A5] font-medium uppercase tracking-wider">
                  <Lock className="w-4 h-4 text-[#F5C451]" /> Network Security Policy
                </div>
                <div className="mt-2 text-base font-semibold text-[#F7F5EF]">
                  {diagnostics.fabricMode === "STRICT_OFFLINE" ? "127.0.0.1 Loopback Only" : "Hybrid Authorized"}
                </div>
                <div className="text-xs text-[#827C70] mt-0.5 font-mono">
                  Blocked Calls: {diagnostics.networkSafetyAudit.blockedOutboundRequestsCount}
                </div>
              </div>
            </div>
          )}

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#827C70]" />
              <input
                type="text"
                placeholder="Search engines, models, capabilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0D0C09] border border-[#F5C451]/15 text-sm text-[#F7F5EF] focus:outline-none focus:border-[#F5C451]/50 placeholder-[#827C70]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              <span className="text-xs text-[#827C70] flex items-center gap-1 font-mono uppercase">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {["ALL", "SPEECH_AUDIO", "IMAGE_GENERATION", "IMAGE_UPSCALING", "MUSIC_GENERATION", "VIDEO_PROCESSING", "RESEARCH_SEARCH"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCategory === cat
                        ? "bg-[#F5C451] text-[#050505] font-semibold"
                        : "bg-[#11100D] border border-[#F5C451]/15 text-[#B8B2A5] hover:border-[#F5C451]/40"
                    }`}
                  >
                    {cat.replace("_", " ")}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Engine Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEngines.map((engine) => (
              <div
                key={engine.id}
                className="flex flex-col justify-between p-6 rounded-2xl bg-[#0D0C09] border border-[#F5C451]/15 hover:border-[#F5C451]/40 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#F7F5EF] flex items-center gap-2">
                        {engine.name}
                        <a
                          href={engine.upstreamRepo}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#827C70] hover:text-[#F5C451] transition-colors"
                          title="View Upstream Repository"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-[#827C70]">
                          {engine.pinnedVersion} ({engine.pinnedCommit})
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                            engine.license.isCopyleft
                              ? "bg-amber-950/40 text-amber-400 border-amber-500/20"
                              : "bg-emerald-950/40 text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          {engine.license.spdxId}
                        </span>
                      </div>
                    </div>

                    <div>{getStatusBadge(engine.status)}</div>
                  </div>

                  <p className="text-xs text-[#B8B2A5] mt-3 leading-relaxed">
                    {engine.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 rounded-lg bg-[#050505] border border-[#F5C451]/10 text-[11px] font-mono text-[#827C70]">
                    <div>
                      <span className="block text-[9px] uppercase text-[#827C70]">RAM / VRAM</span>
                      <span className="text-[#F7F5EF]">
                        {engine.hardwareRequirements.minRamGb}G / {engine.hardwareRequirements.minVramGb}G
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase text-[#827C70]">Storage</span>
                      <span className="text-[#F7F5EF]">{engine.hardwareRequirements.diskSpaceRequiredGb} GB</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase text-[#827C70]">Port</span>
                      <span className="text-[#F5C451]">{engine.port || "CLI NCNN"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {engine.supportedCapabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#17140D] border border-[#F5C451]/10 text-[#B8B2A5]"
                      >
                        {cap.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[#F5C451]/10">
                  <button
                    onClick={() => handleProbe(engine.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#11100D] border border-[#F5C451]/20 hover:border-[#F5C451]/50 text-xs font-semibold text-[#F5C451] transition-all flex items-center justify-center gap-1.5"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Probe Identity</span>
                  </button>

                  {!engine.isInstalled ? (
                    <button
                      onClick={() => setSelectedEngineForInstall(engine)}
                      className="py-2 px-4 rounded-xl bg-[#F5C451] hover:bg-[#FFD978] text-[#050505] text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <DownloadCloud className="w-3.5 h-3.5" />
                      <span>Install</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInstall(engine)}
                      className="py-2 px-3 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Manage</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: API COST & TOKEN GOVERNOR */}
      {activeTab === "COST_GOVERNOR" && (
        <div className="mt-6 space-y-6">
          {/* Routing Policy Mode Selector */}
          <div className="p-6 rounded-2xl bg-[#0D0C09] border border-[#F5C451]/20 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
            <h3 className="text-base font-bold text-[#F7F5EF] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#F5C451]" />
              Task Routing Policy Mode (Server-Side Enforced)
            </h3>
            <p className="text-xs text-[#B8B2A5] mt-1">
              Controls when Antigravity OS is permitted to call paid external APIs vs enforcing zero-cost local GPU inference.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
              {(
                [
                  {
                    id: "STRICT_LOCAL",
                    title: "Strict Local",
                    desc: "Zero OpenAI/Gemini calls. 100% offline & local GPU Ollama.",
                    badge: "100% Free",
                  },
                  {
                    id: "LOCAL_FIRST",
                    title: "Local First",
                    desc: "Prefers local engines. Remote calls only on explicit request.",
                    badge: "Recommended",
                  },
                  {
                    id: "HYBRID",
                    title: "Hybrid Balance",
                    desc: "Escalates complex reasoning to cloud under strict budget limits.",
                    badge: "Adaptive",
                  },
                  {
                    id: "CLOUD_ONLY",
                    title: "Cloud Only",
                    desc: "Forces execution through configured cloud APIs.",
                    badge: "Full Remote",
                  },
                ] as const
              ).map((modeOption) => (
                <button
                  key={modeOption.id}
                  onClick={() => handleSetRoutingMode(modeOption.id)}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    routingMode === modeOption.id
                      ? "bg-[#17140D] border-[#F5C451] shadow-[0_0_15px_rgba(245,196,81,0.2)]"
                      : "bg-[#050505] border-[#F5C451]/10 hover:border-[#F5C451]/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#F7F5EF]">{modeOption.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#11100D] text-[#F5C451] border border-[#F5C451]/20">
                      {modeOption.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#827C70] mt-2 leading-relaxed">
                    {modeOption.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Cost Savings & Metrics Cards */}
          {costMetrics && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-[#0D0C09] border border-[#F5C451]/15">
                <span className="text-xs text-[#827C70] font-mono uppercase">Total Spend (Month)</span>
                <div className="mt-2 text-2xl font-bold text-[#F7F5EF]">
                  ${costMetrics.actualCloudSpendUsd.toFixed(3)}
                </div>
                <div className="text-xs text-[#B8B2A5] mt-1 font-mono">
                  Limit: ${budgetConfig?.monthlyLimitUsd.toFixed(2)} USD
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#0D0C09] border border-emerald-500/20 bg-emerald-950/10">
                <span className="text-xs text-emerald-400 font-mono uppercase flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> Estimated Savings
                </span>
                <div className="mt-2 text-2xl font-bold text-emerald-300">
                  ${costMetrics.totalCostSavingsUsd.toFixed(2)}
                </div>
                <div className="text-xs text-[#827C70] mt-1 font-mono">
                  vs. Cloud GPT-4o Baseline
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#0D0C09] border border-[#F5C451]/15">
                <span className="text-xs text-[#827C70] font-mono uppercase">Local Execution Ratio</span>
                <div className="mt-2 text-2xl font-bold text-[#F5C451]">
                  {costMetrics.localRatioPercent}%
                </div>
                <div className="text-xs text-[#827C70] mt-1 font-mono">
                  {costMetrics.localRequestsCount} of {costMetrics.totalRequestsHandled} tasks local
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#0D0C09] border border-[#F5C451]/15">
                <span className="text-xs text-[#827C70] font-mono uppercase">Deterministic Cache Hits</span>
                <div className="mt-2 text-2xl font-bold text-[#F7F5EF]">
                  {costMetrics.cacheHitRatePercent}%
                </div>
                <div className="text-xs text-[#827C70] mt-1 font-mono">
                  {costMetrics.cachedTokensAvoided.toLocaleString()} tokens avoided
                </div>
              </div>
            </div>
          )}

          {/* Cache Governance Drawer */}
          {cacheStats && (
            <div className="p-5 rounded-xl bg-[#0D0C09] border border-[#F5C451]/15 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#F7F5EF] flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#F5C451]" />
                  Deterministic Output & Context Cache
                </h4>
                <p className="text-xs text-[#827C70] mt-1">
                  {cacheStats.activeEntriesCount} verified responses cached | {cacheStats.totalTokensSaved.toLocaleString()} total tokens saved from duplicate calls.
                </p>
              </div>

              <button
                onClick={handleClearCache}
                className="px-4 py-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-950 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge Cache</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: UPSTREAM SELF-UPDATE CENTER */}
      {activeTab === "UPDATES" && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D0C09] border border-[#F5C451]/20">
            <div>
              <h3 className="text-base font-bold text-[#F7F5EF] flex items-center gap-2">
                <DownloadCloud className="w-5 h-5 text-[#F5C451]" />
                Upstream Self-Update Fabric (Safe Staged Auto-Updates)
              </h3>
              <p className="text-xs text-[#B8B2A5] mt-1">
                Monitors official GitHub tags across the 10 engines, tests updates in isolation, and enables atomic rollbacks.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#827C70] font-mono uppercase">Channel:</span>
              <span className="px-3 py-1 rounded-lg bg-[#17140D] border border-[#F5C451]/30 text-xs font-bold text-[#F5C451]">
                {updatePolicy?.channel || "STABLE"}
              </span>
            </div>
          </div>

          {/* Update Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#F5C451]/15 bg-[#0D0C09]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#11100D] border-b border-[#F5C451]/15 text-[#827C70] uppercase font-mono">
                <tr>
                  <th className="p-4">Engine</th>
                  <th className="p-4">Current Installed</th>
                  <th className="p-4">Latest Upstream</th>
                  <th className="p-4">Staged Test Status</th>
                  <th className="p-4">License Audit</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5C451]/10">
                {updateRecords.map((rec) => (
                  <tr key={rec.engineId} className="hover:bg-[#17140D]/40 transition-colors">
                    <td className="p-4 font-bold text-[#F7F5EF]">{rec.name}</td>
                    <td className="p-4 font-mono text-[#B8B2A5]">{rec.currentVersion} ({rec.currentCommit})</td>
                    <td className="p-4 font-mono text-[#F5C451]">{rec.latestVersion} ({rec.latestCommit})</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                          rec.testStatus === "ACTIVE"
                            ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/30"
                            : rec.testStatus === "PENDING"
                            ? "bg-amber-950/80 text-amber-400 border-amber-500/30"
                            : rec.testStatus === "ROLLED_BACK"
                            ? "bg-purple-950/80 text-purple-400 border-purple-500/30"
                            : "bg-zinc-800 text-zinc-300 border-zinc-700"
                        }`}
                      >
                        {rec.testStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-mono text-emerald-400">
                        {rec.licenseChanged ? "MODIFIED (Approval Gate)" : "Verified Unchanged"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleStageUpdate(rec.engineId)}
                        disabled={executingEngineId !== null}
                        className="px-3 py-1.5 rounded-lg bg-[#F5C451] hover:bg-[#FFD978] text-[#050505] font-bold text-xs transition-all"
                      >
                        {executingEngineId === rec.engineId ? "Testing..." : "Stage & Test"}
                      </button>
                      <button
                        onClick={() => handleRollback(rec.engineId)}
                        disabled={executingEngineId !== null}
                        className="px-3 py-1.5 rounded-lg bg-[#11100D] border border-[#F5C451]/30 hover:border-[#F5C451] text-[#F5C451] font-semibold text-xs transition-all"
                      >
                        Rollback
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Installation Modal */}
      {selectedEngineForInstall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0D0C09] border border-[#F5C451]/30 shadow-2xl text-[#F7F5EF]">
            <div className="flex items-center justify-between pb-4 border-b border-[#F5C451]/15">
              <div className="flex items-center gap-2">
                <DownloadCloud className="w-5 h-5 text-[#F5C451]" />
                <h3 className="text-lg font-bold">Install {selectedEngineForInstall.name}</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedEngineForInstall(null);
                  setInstallFeedback(null);
                }}
                className="text-[#827C70] hover:text-[#F7F5EF]"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-[#B8B2A5]">
              <p>
                Prepares local execution directory and pins upstream repository at{" "}
                <strong className="text-[#F5C451] font-mono">
                  {selectedEngineForInstall.pinnedVersion} ({selectedEngineForInstall.pinnedCommit})
                </strong>
                .
              </p>

              <div className="p-3 rounded-xl bg-[#050505] border border-[#F5C451]/15 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#827C70]">License:</span>
                  <span className="text-[#F7F5EF] font-mono">{selectedEngineForInstall.license.spdxId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#827C70]">Required Disk:</span>
                  <span className="text-[#F7F5EF] font-mono">
                    {selectedEngineForInstall.hardwareRequirements.diskSpaceRequiredGb} GB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#827C70]">Offline Capable:</span>
                  <span className="text-emerald-400 font-mono">
                    {selectedEngineForInstall.isOfflineCapable ? "YES (Fully Verified)" : "NO (Gateway Only)"}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-amber-300">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Prerequisite Notice
                </p>
                <p className="mt-1 text-[11px] leading-relaxed">
                  Antigravity OS never downloads multi-gigabyte models silently. Model weights remain localized in{" "}
                  <code className="text-amber-200">%APPDATA%/AntigravityOS/fabric</code> and can be cleanly uninstalled without losing user projects.
                </p>
              </div>

              <label className="flex items-start gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={installConsentGiven}
                  onChange={(e) => setInstallConsentGiven(e.target.checked)}
                  className="mt-0.5 rounded border-[#F5C451]/30 bg-[#11100D] text-[#F5C451] focus:ring-0"
                />
                <span className="text-xs text-[#F7F5EF]">
                  I authorize Antigravity OS to install {selectedEngineForInstall.name} and manage local weights.
                </span>
              </label>

              {installFeedback && (
                <div className="p-2.5 rounded-lg bg-[#17140D] border border-[#F5C451]/20 text-[#F5C451] font-mono text-[11px]">
                  {installFeedback}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#F5C451]/15">
              <button
                onClick={() => {
                  setSelectedEngineForInstall(null);
                  setInstallFeedback(null);
                }}
                className="px-4 py-2 rounded-xl text-xs text-[#B8B2A5] hover:text-[#F7F5EF]"
              >
                Cancel
              </button>
              <button
                disabled={!installConsentGiven || executingEngineId !== null}
                onClick={() => handleInstall(selectedEngineForInstall)}
                className="px-5 py-2 rounded-xl bg-[#F5C451] hover:bg-[#FFD978] disabled:opacity-40 text-[#050505] text-xs font-bold transition-all flex items-center gap-1.5"
              >
                {executingEngineId ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Installing...</span>
                  </>
                ) : (
                  <span>Confirm & Install</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
