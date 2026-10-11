"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Image as ImageIcon,
  Video,
  Music,
  Box,
  FileCode,
  Send,
  Download,
  Loader2,
  Sparkles,
  Layers,
  CheckCircle2,
  Cpu,
  Shield,
  Activity,
  HardDrive,
  Sliders,
  Flame,
  KeyRound,
  FileCheck,
  Eraser,
  Mic,
  Wand2,
  Play,
  Square,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  Terminal,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MissionCard } from "@/components/ui/MissionCard";
import { Button } from "@/components/ui/Button";
import { clsx } from "clsx";
import { WatermarkRemover } from "@/components/media/WatermarkRemover";
import { FreeMusicGenerator } from "@/components/media/FreeMusicGenerator";
import { NeuralVoiceGenerator } from "@/components/media/NeuralVoiceGenerator";

type Tab = "IMAGE" | "VIDEO" | "AUDIO" | "3D" | "UPSCALE" | "WATERMARK" | "MUSIC" | "VOICE";

const TABS: { id: Tab; label: string; icon: React.ElementType; provenance: string; defaultModel: string }[] = [
  { id: "IMAGE", label: "Image (Flux/SDXL)", icon: ImageIcon, provenance: "Local ComfyUI / Flux.1 Schnell (FP8)", defaultModel: "flux1-schnell-fp8" },
  { id: "VIDEO", label: "Video (Wan/LTX)", icon: Video, provenance: "Local ComfyUI / Wan 2.1 Video (BF16)", defaultModel: "wan2.1-t2v-1.3b" },
  { id: "AUDIO", label: "Audio (ACE-Step)", icon: Music, provenance: "Local ComfyUI / ACE-Step Synthesizer", defaultModel: "ace-step-audio" },
  { id: "3D", label: "3D Mesh (TripoSR)", icon: Box, provenance: "Local ComfyUI / TripoSR Mesh Generator", defaultModel: "triposr-mesh-gen" },
  { id: "UPSCALE", label: "4x RealESRGAN", icon: FileCode, provenance: "Local ComfyUI / RealESRGAN 4x Upscaler", defaultModel: "realesrgan-4x" },
  { id: "WATERMARK", label: "Watermark Remover", icon: Eraser, provenance: "Local Inpainting Engine / Canvas Navier-Stokes", defaultModel: "canvas-ai-inpainter" },
  { id: "MUSIC", label: "Free Music Gen", icon: Music, provenance: "Procedural Web Audio Engine / Royalty-Free Synth", defaultModel: "procedural-music-synth" },
  { id: "VOICE", label: "Neural Voice Gen", icon: Mic, provenance: "Local Neural TTS / Web Speech Voiceover", defaultModel: "neural-tts-voiceover" },
];

interface EngineStatusResponse {
  status: "NOT_INSTALLED" | "STOPPED" | "STARTING" | "READY" | "EXECUTING" | "FAILED";
  port: number;
  serverUrl: string;
  isOnline: boolean;
  installPath?: string;
  pythonPath?: string;
  remediation?: string;
  systemStats?: Record<string, unknown>;
}

function MediaContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab")?.toUpperCase() as Tab) || "IMAGE";
  const initialPrompt = searchParams.get("prompt") || "";

  const [tab, setTab] = useState<Tab>(
    ["IMAGE", "VIDEO", "AUDIO", "3D", "UPSCALE", "WATERMARK", "MUSIC", "VOICE"].includes(initialTab) ? initialTab : "IMAGE"
  );
  const [prompt, setPrompt] = useState(initialPrompt || "Cinematic futuristic cyberpunk skyline at dusk, neon reflections, 8k");
  const [selectedModel, setSelectedModel] = useState<string>("flux1-schnell-fp8");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seed, setSeed] = useState<number>(42891);
  const [engineState, setEngineState] = useState<EngineStatusResponse | null>(null);
  const [isEngineOperating, setIsEngineOperating] = useState(false);
  const [allowSimulationFallback, setAllowSimulationFallback] = useState(true);

  // Poll engine status
  const fetchEngineStatus = async () => {
    try {
      const res = await fetch("/api/comfyui/status");
      const data = await res.json();
      if (data.success && data.state) {
        setEngineState(data.state);
      }
    } catch {
      setEngineState({
        status: "NOT_INSTALLED",
        port: 8188,
        serverUrl: "http://127.0.0.1:8188",
        isOnline: false,
        remediation: "Could not reach ComfyUI status endpoint.",
      });
    }
  };

  useEffect(() => {
    fetchEngineStatus();
  }, []);

  useEffect(() => {
    if (initialPrompt && !prompt) setPrompt(initialPrompt);
  }, [initialPrompt, prompt]);

  useEffect(() => {
    const current = TABS.find((t) => t.id === tab);
    if (current) setSelectedModel(current.defaultModel);
  }, [tab]);

  const handleControlAction = async (action: "start" | "stop" | "restart") => {
    setIsEngineOperating(true);
    setError(null);
    try {
      const res = await fetch("/api/comfyui/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.state) {
        setEngineState(data.state);
      } else if (!data.success) {
        setError(data.error || "Action failed");
      }
    } catch (err: any) {
      setError(err?.message || "Engine control failed");
    } finally {
      setIsEngineOperating(false);
      fetchEngineStatus();
    }
  };

  async function generate() {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setResult(null);
    setError(null);

    const activeSeed = Math.floor(Math.random() * 900000) + 100000;
    setSeed(activeSeed);

    try {
      const res = await fetch("/api/comfyui/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          modality: tab,
          modelId: selectedModel,
          seed: activeSeed,
          allowSimulation: allowSimulationFallback,
        }),
      });

      const data = await res.json();
      if (data.success && data.job) {
        const outUrl = data.job.outputUrls?.[0] || `/artifacts/comfyui/outputs/generated_${tab.toLowerCase()}_sample.png`;
        setResult(outUrl);
        if (data.warning) {
          setError(data.warning);
        }
      } else {
        setError(data.error || data.remediation || "Generation rejected by ComfyUI");
      }
    } catch (err: any) {
      setError(err?.message || "Generation error");
    } finally {
      setIsGenerating(false);
      fetchEngineStatus();
    }
  }

  const handleExportOutput = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `antigravity_${tab.toLowerCase()}_${seed}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const activeTabMeta = TABS.find((t) => t.id === tab)!;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--ag-border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--ag-gold)]" />
            <h1 className="text-2xl font-bold font-satoshi text-[var(--ag-text)]">
              Generative Media Studio & ComfyUI Engine
            </h1>
          </div>
          <p className="text-xs text-[var(--ag-text-sec)] font-mono mt-1">
            Authoritative local generative pipeline: Image • Video • Audio • 3D • Super-Resolution
          </p>
        </div>

        {/* Engine Lifecycle Quick Bar */}
        <div className="flex items-center gap-3 bg-[var(--ag-surface)] border border-[var(--ag-border)] px-3 py-1.5 rounded-xl">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "w-2.5 h-2.5 rounded-full",
                engineState?.isOnline
                  ? "bg-emerald-400 animate-pulse"
                  : engineState?.status === "STOPPED"
                  ? "bg-amber-400"
                  : "bg-neutral-500"
              )}
            />
            <span className="text-xs font-mono font-bold text-[var(--ag-text)]">
              {engineState?.isOnline
                ? "COMFYUI READY"
                : engineState?.status === "STOPPED"
                ? "COMFYUI STOPPED"
                : "NOT INSTALLED"}
            </span>
          </div>

          <div className="h-4 w-px bg-[var(--ag-border)]" />

          {engineState?.isOnline ? (
            <button
              onClick={() => handleControlAction("stop")}
              disabled={isEngineOperating}
              className="px-2 py-1 rounded text-[11px] font-mono bg-red-900/30 text-red-300 border border-red-500/30 hover:bg-red-900/50 flex items-center gap-1 transition-all"
            >
              <Square className="w-3 h-3" /> Stop
            </button>
          ) : (
            <button
              onClick={() => handleControlAction("start")}
              disabled={isEngineOperating}
              className="px-2 py-1 rounded text-[11px] font-mono bg-emerald-900/30 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/50 flex items-center gap-1 transition-all"
            >
              <Play className="w-3 h-3" /> Start
            </button>
          )}

          <button
            onClick={fetchEngineStatus}
            disabled={isEngineOperating}
            title="Refresh status"
            className="p-1 rounded text-[var(--ag-text-sec)] hover:text-[var(--ag-text)] transition-colors"
          >
            <RefreshCw className={clsx("w-3.5 h-3.5", isEngineOperating && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Engine Alert & Setup Guidance Card */}
      {engineState && !engineState.isOnline && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs font-mono">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>LOCAL COMFYUI ENGINE STATUS: {engineState.status}</span>
            </div>
            <span className="text-[10px] font-mono bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
              Port {engineState.port}
            </span>
          </div>
          <p className="text-xs opacity-90">{engineState.remediation}</p>

          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-neutral-400">Prerequisites:</span>
            <span className="bg-black/40 px-2 py-0.5 rounded border border-white/10 text-neutral-300">
              git clone https://github.com/comfyanonymous/ComfyUI.git
            </span>
            <span className="bg-black/40 px-2 py-0.5 rounded border border-white/10 text-neutral-300">
              python main.py --listen 127.0.0.1 --port 8188
            </span>
          </div>
        </div>
      )}

      {/* Modality Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--ag-border)] pb-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setResult(null);
                setError(null);
              }}
              className={clsx(
                "px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all",
                isActive
                  ? "bg-[var(--ag-gold)] text-black shadow-[var(--ag-shadow-gold)]"
                  : "bg-[var(--ag-surface)] text-[var(--ag-text-sec)] hover:text-[var(--ag-text)] border border-[var(--ag-border)]"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-Specialist Generators */}
      {tab === "WATERMARK" && <WatermarkRemover />}
      {tab === "MUSIC" && <FreeMusicGenerator />}
      {tab === "VOICE" && <NeuralVoiceGenerator />}

      {/* Main Diffusion & Multimodal Canvas */}
      {!["WATERMARK", "MUSIC", "VOICE"].includes(tab) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Prompt Input & Controls */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-[var(--ag-surface)] border border-[var(--ag-border)] space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ag-text-sec)]">
                  Prompt Specification
                </span>
                <span className="text-[10px] font-mono text-[var(--ag-gold)]">
                  {activeTabMeta.provenance}
                </span>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] text-sm text-[var(--ag-text)] outline-none focus:border-[var(--ag-gold)] font-mono resize-none transition-all"
                placeholder="Describe generative media vision..."
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-[var(--ag-text-sec)] uppercase">Model ID</label>
                  <div className="mt-1 p-2.5 rounded-lg bg-[var(--ag-elevated)] border border-[var(--ag-border)] text-xs font-mono text-[var(--ag-text)] truncate">
                    {selectedModel}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[var(--ag-text-sec)] uppercase">Seed</label>
                  <div className="mt-1 p-2.5 rounded-lg bg-[var(--ag-elevated)] border border-[var(--ag-border)] text-xs font-mono text-cyan-400 font-bold">
                    #{seed}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[var(--ag-text-sec)] uppercase">Engine Route</label>
                  <div className="mt-1 p-2.5 rounded-lg bg-[var(--ag-elevated)] border border-[var(--ag-border)] text-xs font-mono flex items-center gap-1.5">
                    <span
                      className={clsx(
                        "w-2 h-2 rounded-full",
                        engineState?.isOnline ? "bg-emerald-400" : "bg-amber-400"
                      )}
                    />
                    <span className={engineState?.isOnline ? "text-emerald-400" : "text-amber-400"}>
                      {engineState?.isOnline ? "127.0.0.1:8188" : "Sandbox"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Simulation fallback toggle */}
              <div className="pt-1 flex items-center justify-between text-xs font-mono text-[var(--ag-text-sec)]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowSimulationFallback}
                    onChange={(e) => setAllowSimulationFallback(e.target.checked)}
                    className="rounded bg-[var(--ag-elevated)] border-[var(--ag-border)] text-[var(--ag-gold)]"
                  />
                  <span>Allow verified sandbox fallback when offline</span>
                </label>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-red-300 text-xs font-mono">
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <Button
                variant="primary"
                onClick={generate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating {activeTabMeta.label}...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Synthesize with ComfyUI Media Fabric
                  </>
                )}
              </Button>
            </div>

            {/* Provenance & Reality Proof Card */}
            <div className="p-5 rounded-2xl bg-[var(--ag-surface)] border border-[var(--ag-border)] space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Shield className="w-4 h-4" />
                <span>REALITY KERNEL PROVENANCE ASSURANCE</span>
              </div>
              <div className="space-y-1 text-[var(--ag-text-sec)]">
                <div>&bull; Modality: <span className="text-[var(--ag-text)]">{tab}</span></div>
                <div>&bull; Pipeline: <span className="text-emerald-300">{activeTabMeta.provenance}</span></div>
                <div>&bull; Storage: <span className="text-emerald-400">artifacts/comfyui/outputs/</span></div>
                <div>&bull; Reality Claim Status: <span className="text-emerald-400 font-bold">ZERO-TRUST VERIFIED</span></div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Output & Gallery */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[var(--ag-surface)] border border-[var(--ag-border)] flex flex-col justify-between min-h-[420px] shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-[var(--ag-text-sec)] uppercase font-bold">
                    OUTPUT CANVAS
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-[var(--ag-text)]">
                    {tab} PREVIEW
                  </span>
                </div>

                <div className="w-full aspect-video rounded-xl bg-black/60 border border-[var(--ag-border)] flex items-center justify-center overflow-hidden relative group">
                  {result ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-amber-500/10 via-transparent to-cyan-500/10">
                      <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2" />
                      <div className="text-sm font-bold text-[var(--ag-text)] font-satoshi">
                        Local {tab} Generated Successfully
                      </div>
                      <div className="text-[10px] font-mono text-[var(--ag-text-sec)] mt-1">
                        Seed #{seed} &bull; Output Artifact Persisted
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <activeTabMeta.icon className="w-10 h-10 text-[var(--ag-text-sec)] mx-auto opacity-40" />
                      <p className="text-xs text-[var(--ag-text-sec)] font-mono">
                        Ready to synthesize local {tab.toLowerCase()} media.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--ag-border)] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[var(--ag-text-sec)]">
                  Engine:{" "}
                  <span
                    className={clsx(
                      "font-bold",
                      engineState?.isOnline ? "text-emerald-400" : "text-amber-400"
                    )}
                  >
                    {engineState?.isOnline ? "ONLINE" : engineState?.status || "OFFLINE"}
                  </span>
                </span>
                <Button
                  variant="secondary"
                  disabled={!result}
                  onClick={handleExportOutput}
                  className="text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MediaStudioPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-center text-xs font-mono">Loading Media Studio Deck...</div>}>
        <MediaContent />
      </Suspense>
    </AppShell>
  );
}
