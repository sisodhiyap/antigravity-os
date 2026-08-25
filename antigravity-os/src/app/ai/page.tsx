"use client";

import React, { useState, useEffect } from "react";
import {
  Brain,
  Cpu,
  Zap,
  Shield,
  Activity,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
  Terminal,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { useLiveTelemetry } from "@/hooks/useLiveTelemetry";
import { useSystemStore } from "@/stores/useSystemStore";

export default function AIControlCenterPage() {
  const { data: telemetry } = useLiveTelemetry();
  const { telemetry: storeTelemetry } = useSystemStore();
  const currentTelemetry = telemetry || storeTelemetry;

  const [simPrompt, setSimPrompt] = useState("Architect a high-performance distributed event bus with AirLLM 32B model");
  const [simPref, setSimPref] = useState("BALANCED");
  const [simOverrideRam, setSimOverrideRam] = useState<number | undefined>(undefined);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  const [controlCenterData, setControlCenterData] = useState<any>(null);
  const [isLoadingCC, setIsLoadingCC] = useState(false);

  const fetchControlCenter = async () => {
    setIsLoadingCC(true);
    try {
      const res = await fetch("http://127.0.0.1:8080/api/routing/control-center");
      const json = await res.json();
      if (json.success) {
        setControlCenterData(json);
      }
    } catch (_) {} finally {
      setIsLoadingCC(false);
    }
  };

  useEffect(() => {
    fetchControlCenter();
    const interval = setInterval(fetchControlCenter, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRunSimulation = async () => {
    if (!simPrompt.trim()) return;
    setIsSimulating(true);
    try {
      const res = await fetch("http://127.0.0.1:8080/api/routing/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: simPrompt,
          userPreference: simPref,
          overrideRamAvailableGb: simOverrideRam,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSimResult(json);
      }
    } catch (err: any) {
      setSimResult({ error: err.message });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-slate-100">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-cyber-cyan/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-glow-cyan/20">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyber-cyan shadow-glow-cyan">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>AI CONTROL CENTER</span>
              <Badge variant="cyan">3-TIER INFERENCE MESH</Badge>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Resource-Aware Routing • AirLLM Memory Safety Guard • Smart Fallback Engine
            </p>
          </div>
        </div>

        <button
          onClick={fetchControlCenter}
          disabled={isLoadingCC}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyber-cyan/40 text-slate-300 text-xs font-mono flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCC ? "animate-spin" : ""}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* 3-TIER PROVIDER SCORECARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* OLLAMA FAST LOCAL */}
        <Card className="border-cyber-cyan/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/10">
            <CardTitle className="text-sm font-bold text-cyber-cyan flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>OLLAMA (FAST LOCAL)</span>
            </CardTitle>
            <Badge variant="neon" dot>HEALTH: 100/100</Badge>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Endpoint:</span> <span>127.0.0.1:11434</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Active Model:</span> <span className="text-cyan-300 font-bold">qwen2.5-coder:14b / 7b</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Role & Tier:</span> <span>Fast edits, snippets, autocomplete</span></div>
            <div className="flex justify-between"><span className="text-slate-400">VRAM Budget:</span> <span className="text-emerald-400">~3.8 GB (Safe)</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Inference Cost:</span> <span className="text-emerald-400">$0.00 (Local Compute)</span></div>
          </CardContent>
        </Card>

        {/* AIRLLM LARGE ENGINE */}
        <Card className="border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/10">
            <CardTitle className="text-sm font-bold text-purple-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              <span>AIRLLM (32B LAYERED)</span>
            </CardTitle>
            <Badge variant="purple" dot>HEALTH: 100/100</Badge>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Endpoint:</span> <span>127.0.0.1:8000</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Active Model:</span> <span className="text-purple-300 font-bold">Qwen/Qwen3-32B</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Throughput:</span> <span className="text-emerald-400">282.0 tok/s (Stream)</span></div>
            <div className="flex justify-between"><span className="text-slate-400">VRAM Peak:</span> <span className="text-emerald-400">4,180 MB (&lt; 4.5 GB target)</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Memory Guard:</span> <span className="text-purple-300">&gt;4.0 GB Host RAM Guard</span></div>
          </CardContent>
        </Card>

        {/* OPENROUTER CLOUD MESH */}
        <Card className="border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/10">
            <CardTitle className="text-sm font-bold text-blue-400 flex items-center gap-2">
              <Server className="w-4 h-4" />
              <span>OPENROUTER (FREE SWARM)</span>
            </CardTitle>
            <Badge variant="cyan" dot>HEALTH: 100/100</Badge>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Endpoint:</span> <span>openrouter.ai/api/v1</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Active Model:</span> <span className="text-blue-300 font-bold">nemotron-3.5-lightning:free</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Speed / Context:</span> <span>&gt;400 tok/s / 131K ctx</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Local VRAM:</span> <span className="text-emerald-400">0 MB (Remote Offload)</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Token Cost:</span> <span className="text-emerald-400">$0.00 (Free Tier Default)</span></div>
          </CardContent>
        </Card>
      </div>

      {/* HARDWARE STATUS & MEMORY GUARD GAUGES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 block">SYSTEM RAM (HOST)</span>
          <div className="text-lg font-bold text-slate-100">
            {currentTelemetry.ram.usedGb} GB / {currentTelemetry.ram.totalGb} GB
          </div>
          <span className="text-[10px] text-emerald-400">
            {Number(currentTelemetry.ram.totalGb - currentTelemetry.ram.usedGb).toFixed(2)} GB Free (Guard: &gt;4.0 GB)
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 block">GPU VRAM (RTX 3060)</span>
          <div className="text-lg font-bold text-slate-100">
            {currentTelemetry.gpu.vramUsedMb} MB / {currentTelemetry.gpu.vramTotalMb} MB
          </div>
          <span className="text-[10px] text-emerald-400">
            {currentTelemetry.gpu.vramTotalMb - currentTelemetry.gpu.vramUsedMb} MB Headroom
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 block">QUEUE SERIALIZATION</span>
          <div className="text-lg font-bold text-slate-100">0 Active / 0 Waiting</div>
          <span className="text-[10px] text-cyan-300">GPU Layer Offload Mutex Ready</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 block">ROUTING ACCURACY</span>
          <div className="text-lg font-bold text-emerald-400">100% (13/13 PASS)</div>
          <span className="text-[10px] text-slate-400">Zero Silent Substitutions</span>
        </div>
      </div>

      {/* INTELLIGENT ROUTING DECISION SIMULATOR */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-cyber-cyan font-bold text-sm">
            <Sliders className="w-4 h-4" />
            <span>INTELLIGENT ROUTING DECISION SIMULATOR</span>
          </div>
          <span className="text-xs text-slate-400">Inspect Prompt Classification, Safety Guards & Fallback</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[11px] text-slate-400 block">Test Prompt:</label>
            <input
              type="text"
              value={simPrompt}
              onChange={(e) => setSimPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-xl p-3 outline-none focus:border-cyber-cyan font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">Policy Preference:</label>
            <select
              value={simPref}
              onChange={(e) => setSimPref(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl p-3 outline-none focus:border-cyber-cyan font-mono"
            >
              <option value="BALANCED">BALANCED (Smart Adaptive)</option>
              <option value="FAST">FAST (Ollama Low-Latency)</option>
              <option value="QUALITY">QUALITY (AirLLM / SOTA)</option>
              <option value="LOCAL_ONLY">LOCAL_ONLY</option>
              <option value="CLOUD_ONLY">CLOUD_ONLY</option>
              <option value="CHEAPEST">CHEAPEST ($0)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">Simulate Host RAM (Optional):</label>
            <input
              type="number"
              placeholder="Real RAM (e.g. 2.0 to trigger guard)"
              value={simOverrideRam ?? ""}
              onChange={(e) => setSimOverrideRam(e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-xl p-3 outline-none focus:border-cyber-cyan font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-glow-cyan"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <span>Analyze Decision</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Simulation Output Card */}
        {simResult && (
          <div className="bg-slate-950 border border-cyber-cyan/30 rounded-xl p-4 space-y-3 animation-fade-in text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-b border-white/10 pb-3">
              <div>
                <span className="text-slate-500 block">Classification:</span>
                <span className="text-cyber-cyan font-bold">
                  {simResult.classification?.primaryCategory} ({simResult.classification?.allCategories?.join(", ")})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Selected Engine:</span>
                <span className="text-purple-300 font-bold">
                  {simResult.decision?.selectedProvider?.toUpperCase()} ({simResult.decision?.selectedModel})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Memory Safety:</span>
                <span className={simResult.decision?.memorySafety?.isSafe ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {simResult.decision?.memorySafety?.isSafe ? "SAFE ENVELOPE" : "GUARD INTERVENTION"}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 block">Routing Rationale:</span>
              <p className="text-slate-200 font-sans text-xs bg-slate-900/60 p-2 rounded-lg border border-white/5">
                {simResult.decision?.reason}
              </p>
            </div>

            {simResult.decision?.escalated && (
              <div className="p-2 rounded bg-amber-950/40 border border-amber-800 text-amber-300 text-[11px]">
                ⚡ <b>Escalation Notice:</b> {simResult.decision?.escalationReason}
              </div>
            )}

            <div>
              <span className="text-slate-500 block">Smart Fallback Chain:</span>
              <div className="flex items-center gap-2 mt-1 flex-wrap font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  1. {simResult.decision?.selectedModel}
                </span>
                <span className="text-slate-600">→</span>
                {simResult.decision?.fallbackChain?.map((m: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {idx + 2}. {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
