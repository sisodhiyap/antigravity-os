"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  HardDrive,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Terminal,
  DownloadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Play,
  Square,
  FileText,
  Lock,
  Globe,
} from "lucide-react";
import { LocalEngineMetadata, EngineStatus, FabricExecutionMode, FabricDiagnosticsReport } from "@/server/fabric/types";

export default function SovereignFabricDashboard() {
  const [diagnostics, setDiagnostics] = useState<FabricDiagnosticsReport | null>(null);
  const [engines, setEngines] = useState<LocalEngineMetadata[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [executingEngineId, setExecutingEngineId] = useState<string | null>(null);
  const [selectedEngineForInstall, setSelectedEngineForInstall] = useState<LocalEngineMetadata | null>(null);
  const [installConsentGiven, setInstallConsentGiven] = useState<boolean>(false);
  const [installFeedback, setInstallFeedback] = useState<string | null>(null);

  const fetchFabricState = async () => {
    setIsRefreshing(true);
    try {
      const [statusRes, enginesRes] = await Promise.all([
        fetch("/api/fabric/status"),
        fetch("/api/fabric/engines"),
      ]);

      if (statusRes.ok) {
        const data = await statusRes.json();
        setDiagnostics(data.diagnostics);
      }
      if (enginesRes.ok) {
        const data = await enginesRes.json();
        setEngines(data.engines);
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

  const handleToggleMode = async () => {
    if (!diagnostics) return;
    const nextMode: FabricExecutionMode =
      diagnostics.fabricMode === "STRICT_OFFLINE" ? "HYBRID" : "STRICT_OFFLINE";

    try {
      const res = await fetch("/api/fabric/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: nextMode }),
      });
      if (res.ok) {
        await fetchFabricState();
      }
    } catch (err) {
      console.error("Error toggling mode", err);
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

  const handleExportAudit = () => {
    window.open("/api/fabric/logs", "_blank");
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
      {/* Header & Sovereign Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-[#F5C451]/15 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-[#F5C451] shadow-[0_0_12px_#F5C451]" />
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#F7F5EF]">
              SOVEREIGN LOCAL AI FABRIC
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono uppercase bg-[#17140D] text-[#F5C451] border border-[#F5C451]/30">
              V7 Isolated Engine Plane
            </span>
          </div>
          <p className="text-sm text-[#B8B2A5] mt-1">
            Unified local execution layer for 10 open-source engines with zero frozen-core mutation and strict loopback binding.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Selector */}
          <button
            onClick={handleToggleMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              diagnostics?.fabricMode === "STRICT_OFFLINE"
                ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "bg-amber-950/60 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            }`}
          >
            {diagnostics?.fabricMode === "STRICT_OFFLINE" ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>STRICT OFFLINE (ZERO OUTBOUND)</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 text-amber-400" />
                <span>HYBRID MODE (CONSENTED GATEWAYS)</span>
              </>
            )}
          </button>

          <button
            onClick={fetchFabricState}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-[#11100D] border border-[#F5C451]/20 hover:border-[#F5C451]/50 text-[#F5C451] transition-all"
            title="Refresh Fabric Probes"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleExportAudit}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#11100D] border border-[#F5C451]/20 hover:border-[#F5C451]/50 text-xs text-[#F7F5EF] transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-[#F5C451]" />
            <span>Export Audit</span>
          </button>
        </div>
      </div>

      {/* Hardware & Resource Governor Ribbon */}
      {diagnostics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
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
              Queued Jobs: {diagnostics.gpuScheduler.queuedJobsCount} (Serialized)
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pb-4">
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
            <Filter className="w-3 h-3" /> Category:
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
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

              {/* Hardware Limits */}
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

              {/* Capabilities */}
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

            {/* Actions */}
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

      {/* Model Download & Installation Modal */}
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
                This action prepares the sovereign local directory and pins the upstream repository at{" "}
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
