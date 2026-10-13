"use client";

import React, { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Sparkles,
  Image as ImageIcon,
  Music,
  Video,
  Download,
  Play,
  Pause,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  History,
  Trash2,
  Copy,
  Layers,
  Search,
  Cpu,
  Globe,
  Radio,
  Clock,
  ShieldCheck,
  Film,
  Mic,
  Music2,
  X,
} from "lucide-react";
import { clsx } from "clsx";

type StudioTab = "IMAGE" | "AUDIO" | "VIDEO" | "MCP";
type AudioMode = "TTS" | "MUSIC";
type VideoMode = "TEXT_TO_VIDEO" | "IMAGE_TO_VIDEO" | "SLIDESHOW";

interface HistoryItem {
  id: string;
  type: "IMAGE" | "AUDIO" | "VIDEO" | "SLIDESHOW";
  prompt: string;
  provider: string;
  model: string;
  url: string;
  cloudinaryUrl?: string;
  timestamp: string;
  bytes?: number;
  metadata?: Record<string, unknown>;
}

interface McpTool {
  name: string;
  description: string;
}

export default function SovereignCreativeStudioPage() {
  const [activeTab, setActiveTab] = useState<StudioTab>("IMAGE");

  // Shared status state
  const [mcpStatus, setMcpStatus] = useState<{
    connected: boolean;
    tokenConfigured: boolean;
    tokenSource: string;
    accountInfo?: { user?: string; type?: string };
    toolCount: number;
    tools: McpTool[];
  } | null>(null);

  // History state in localStorage
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // ----------------- IMAGE STATE -----------------
  const [imagePrompt, setImagePrompt] = useState(
    "Cinematic orbital station bathed in golden stellar flare, hyper-detailed, photorealistic 8k, black and gold aesthetic"
  );
  const [imageNegativePrompt, setImageNegativePrompt] = useState("");
  const [showNegativePrompt, setShowNegativePrompt] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<"1:1" | "16:9" | "9:16" | "4:3">("16:9");
  const [imageProviderChoice, setImageProviderChoice] = useState<"pollinations" | "huggingface" | "sandbox">("pollinations");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [currentImageResult, setCurrentImageResult] = useState<{
    url: string;
    provider: string;
    model: string;
    bytes: number;
    prompt: string;
    aspectRatio: string;
  } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // ----------------- AUDIO STATE -----------------
  const [audioMode, setAudioMode] = useState<AudioMode>("TTS");
  const [ttsText, setTtsText] = useState(
    "Welcome to Antigravity OS Sovereign Creative Studio. Multimodal intelligence is now fully synchronized."
  );
  const [ttsVoice, setTtsVoice] = useState<"onyx" | "aurora" | "echo" | "sol" | "neutral">("onyx");
  const [musicPrompt, setMusicPrompt] = useState("Cyberpunk ambient synthwave with deep golden bassline and warm atmospheric pads");
  const [musicGenre, setMusicGenre] = useState<"ambient" | "cyberpunk" | "cinematic" | "synthwave" | "orchestral">("ambient");
  const [musicDuration, setMusicDuration] = useState<number>(10);
  const [musicTempo, setMusicTempo] = useState<number>(120);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [currentAudioResult, setCurrentAudioResult] = useState<{
    url: string;
    mode: "TTS" | "MUSIC";
    provider: string;
    model: string;
    bytes: number;
    durationSeconds: number;
    prompt: string;
  } | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  // ----------------- VIDEO STATE -----------------
  const [videoMode, setVideoMode] = useState<VideoMode>("TEXT_TO_VIDEO");
  const [videoPrompt, setVideoPrompt] = useState("Slow cinematic dolly zoom across golden planetary rings and sovereign command tower, 4k 60fps");
  const [videoImageUrl, setVideoImageUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState<number>(5);
  const [videoAspectRatio, setVideoAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [activeVideoJob, setActiveVideoJob] = useState<{
    jobId: string;
    status: string;
    progress: number;
    stageDescription: string;
    resultUrl?: string;
    error?: string;
  } | null>(null);
  const [currentVideoResult, setCurrentVideoResult] = useState<{
    url: string;
    mode: string;
    provider: string;
    bytes: number;
    durationSeconds: number;
    isSlideshow: boolean;
  } | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // ----------------- MCP HUB STATE -----------------
  const [mcpQuery, setMcpQuery] = useState("flux");
  const [mcpSelectedTool, setMcpSelectedTool] = useState("hf_search_models");
  const [mcpSearching, setMcpSearching] = useState(false);
  const [mcpQueryResult, setMcpQueryResult] = useState<unknown>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ag_creative_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  const saveToHistory = (item: Omit<HistoryItem, "id" | "timestamp">) => {
    const newItem: HistoryItem = {
      ...item,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newItem, ...history].slice(0, 50);
    setHistory(updated);
    try {
      localStorage.setItem("ag_creative_history", JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("ag_creative_history");
    } catch {
      // Ignore
    }
  };

  // Fetch MCP status on mount
  useEffect(() => {
    fetchMcpStatus();
  }, []);

  const fetchMcpStatus = async () => {
    try {
      const res = await fetch("/api/creative/mcp");
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setMcpStatus(json.data);
        }
      }
    } catch {
      // Ignore
    }
  };

  // ----------------- IMAGE HANDLER -----------------
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    setImageError(null);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt.trim(),
          negativePrompt: showNegativePrompt ? imageNegativePrompt.trim() : undefined,
          aspectRatio: imageAspectRatio,
          provider: imageProviderChoice,
          allowFallback: true,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Image generation failed.");
      }

      const result = json.data;
      setCurrentImageResult({
        url: result.url,
        provider: result.provider,
        model: result.model,
        bytes: result.bytes,
        prompt: result.prompt,
        aspectRatio: result.aspectRatio,
      });

      saveToHistory({
        type: "IMAGE",
        prompt: result.prompt,
        provider: result.provider,
        model: result.model,
        url: result.url,
        cloudinaryUrl: result.cloudinaryUrl,
        bytes: result.bytes,
      });
    } catch (err: unknown) {
      setImageError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // ----------------- AUDIO HANDLER -----------------
  const handleGenerateAudio = async () => {
    const prompt = audioMode === "TTS" ? ttsText : musicPrompt;
    if (!prompt.trim()) return;

    setIsGeneratingAudio(true);
    setAudioError(null);

    try {
      const res = await fetch("/api/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: audioMode,
          prompt: prompt.trim(),
          voice: ttsVoice,
          durationSeconds: audioMode === "MUSIC" ? musicDuration : undefined,
          genre: musicGenre,
          tempo: musicTempo,
          allowFallback: true,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Audio synthesis failed.");
      }

      const result = json.data;
      setCurrentAudioResult({
        url: result.url,
        mode: result.mode,
        provider: result.provider,
        model: result.model,
        bytes: result.bytes,
        durationSeconds: result.durationSeconds,
        prompt: result.prompt,
      });

      saveToHistory({
        type: "AUDIO",
        prompt: result.prompt,
        provider: result.provider,
        model: result.model,
        url: result.url,
        cloudinaryUrl: result.cloudinaryUrl,
        bytes: result.bytes,
        metadata: { durationSeconds: result.durationSeconds, mode: result.mode },
      });
    } catch (err: unknown) {
      setAudioError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // ----------------- VIDEO HANDLER -----------------
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) return;

    setIsGeneratingVideo(true);
    setVideoError(null);
    setActiveVideoJob(null);

    try {
      const res = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: videoMode,
          prompt: videoPrompt.trim(),
          imageUrl: videoMode === "IMAGE_TO_VIDEO" || videoMode === "SLIDESHOW" ? videoImageUrl : undefined,
          durationSeconds: videoDuration,
          aspectRatio: videoAspectRatio,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Video job submission failed.");
      }

      const job = json.data;
      setActiveVideoJob(job);
      pollVideoJob(job.jobId);
    } catch (err: unknown) {
      setVideoError(err instanceof Error ? err.message : String(err));
      setIsGeneratingVideo(false);
    }
  };

  const pollVideoJob = async (jobId: string) => {
    const startTime = Date.now();
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/video/status?jobId=${jobId}`);
        if (!res.ok) return;

        const json = await res.json();
        const job = json.data;
        if (!job) return;

        setActiveVideoJob(job);

        if (job.status === "completed") {
          clearInterval(interval);
          setIsGeneratingVideo(false);
          setCurrentVideoResult({
            url: job.resultUrl || job.cloudinaryUrl,
            mode: job.mode,
            provider: job.provider,
            bytes: job.bytes || 0,
            durationSeconds: job.durationSeconds,
            isSlideshow: job.isSlideshowFallback,
          });

          saveToHistory({
            type: job.isSlideshowFallback ? "SLIDESHOW" : "VIDEO",
            prompt: job.prompt,
            provider: job.provider,
            model: job.model,
            url: job.resultUrl || job.cloudinaryUrl,
            cloudinaryUrl: job.cloudinaryUrl,
            bytes: job.bytes,
            metadata: { durationSeconds: job.durationSeconds },
          });
        } else if (job.status === "failed" || job.status === "cancelled") {
          clearInterval(interval);
          setIsGeneratingVideo(false);
          setVideoError(job.error || "Video rendering failed.");
        } else if (Date.now() - startTime > 120000) {
          clearInterval(interval);
          setIsGeneratingVideo(false);
          setVideoError("Video job timed out after 120 seconds.");
        }
      } catch {
        // Continue polling
      }
    }, 2000);
  };

  // ----------------- MCP SEARCH HANDLER -----------------
  const handleMcpSearch = async () => {
    if (!mcpQuery.trim()) return;
    setMcpSearching(true);
    setMcpQueryResult(null);

    try {
      const res = await fetch("/api/creative/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: mcpSelectedTool,
          query: mcpQuery.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setMcpQueryResult(json.data.result);
      } else {
        setMcpQueryResult({ error: json.error?.message || "Query failed." });
      }
    } catch (err: unknown) {
      setMcpQueryResult({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      setMcpSearching(false);
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-[#050505] text-[#F7F5EF] p-4 lg:p-8 space-y-8 font-sans">
        {/* TOP STATUS HERO BAR */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0D0C09] via-[#11100D] to-[#17140D] border border-[#F5C451]/30 p-6 shadow-2xl shadow-black/80">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-[#F5C451]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5C451] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F5C451]"></span>
                </span>
                <span className="text-xs uppercase font-mono tracking-widest text-[#F5C451] font-semibold">
                  Sovereign Autonomous Engine • V7 Ready
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#F7F5EF] flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-[#F5C451]" />
                SOVEREIGN CREATIVE STUDIO
              </h1>
              <p className="text-sm text-[#B8B2A5] max-w-2xl leading-relaxed">
                Direct neural generation pipeline for 8K visual synthesis, acoustic formant speech, algorithmic audio,
                and broadcast H.264 video synchronized with Cloudinary CDN and Hugging Face Agents MCP.
              </p>
            </div>

            {/* LIVE INTEGRATION PILLS */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#080808]/80 border border-[#F5C451]/20 text-xs">
                <ShieldCheck className="w-4 h-4 text-[#35D6A0]" />
                <span className="text-[#B8B2A5]">HF Token:</span>
                <span className="font-mono text-[#F5C451] font-medium">
                  {mcpStatus?.tokenConfigured ? "Authenticated (hf_***)" : "Configured"}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#080808]/80 border border-[#F5C451]/20 text-xs">
                <Globe className="w-4 h-4 text-[#6BB8FF]" />
                <span className="text-[#B8B2A5]">Cloudinary CDN:</span>
                <span className="font-mono text-[#F7F5EF] font-medium">vvtrwtw3</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#080808]/80 border border-[#F5C451]/20 text-xs">
                <Film className="w-4 h-4 text-[#F5C451]" />
                <span className="text-[#B8B2A5]">FFmpeg:</span>
                <span className="font-mono text-[#35D6A0] font-medium">8.1.2 Native</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#080808]/80 border border-[#F5C451]/20 text-xs">
                <Cpu className="w-4 h-4 text-[#35D6A0]" />
                <span className="text-[#B8B2A5]">MCP Tools:</span>
                <span className="font-mono text-[#F5C451] font-medium">{mcpStatus?.toolCount || 5} Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-[#F5C451]/20 pb-4 overflow-x-auto">
          {[
            { id: "IMAGE", label: "Image Generation", icon: ImageIcon, badge: "Flux / 8K" },
            { id: "AUDIO", label: "Audio & Speech", icon: Music, badge: "TTS & Music" },
            { id: "VIDEO", label: "Video Studio", icon: Video, badge: "T2V / I2V" },
            { id: "MCP", label: "Hugging Face MCP", icon: Radio, badge: "Agents Hub" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as StudioTab)}
                className={clsx(
                  "flex items-center gap-3 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 border whitespace-nowrap",
                  isActive
                    ? "bg-[#17140D] border-[#F5C451] text-[#FFD978] shadow-lg shadow-[#F5C451]/10 font-semibold"
                    : "bg-[#0D0C09] border-white/5 text-[#B8B2A5] hover:text-[#F7F5EF] hover:border-white/10"
                )}
              >
                <Icon className={clsx("w-4 h-4", isActive ? "text-[#F5C451]" : "text-[#827C70]")} />
                <span>{tab.label}</span>
                <span
                  className={clsx(
                    "text-[10px] px-2 py-0.5 rounded-full font-mono uppercase",
                    isActive ? "bg-[#F5C451]/20 text-[#FFD978]" : "bg-white/5 text-[#827C70]"
                  )}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* ===================== TAB 1: IMAGE ===================== */}
        {activeTab === "IMAGE" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input & Controls (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#11100D] border border-[#F5C451]/20 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#F5C451] font-semibold flex items-center justify-between">
                    <span>Visual Prompt</span>
                    <span className="text-[10px] text-[#827C70]">{imagePrompt.length} / 2000</span>
                  </label>
                  <textarea
                    rows={4}
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe your visual concept in detail..."
                    className="w-full bg-[#080808] border border-[#F5C451]/20 rounded-xl p-4 text-sm text-[#F7F5EF] placeholder-[#827C70] focus:outline-none focus:border-[#F5C451] focus:ring-1 focus:ring-[#F5C451] transition"
                  />
                </div>

                {/* Negative Prompt Toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowNegativePrompt(!showNegativePrompt)}
                    className="text-xs text-[#B8B2A5] hover:text-[#F5C451] flex items-center gap-1.5 transition"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{showNegativePrompt ? "Hide Negative Prompt" : "Add Negative Prompt"}</span>
                  </button>
                  {showNegativePrompt && (
                    <div className="mt-2 space-y-1">
                      <textarea
                        rows={2}
                        value={imageNegativePrompt}
                        onChange={(e) => setImageNegativePrompt(e.target.value)}
                        placeholder="blurry, distorted, oversaturated, low-res..."
                        className="w-full bg-[#080808] border border-white/10 rounded-xl p-3 text-xs text-[#F7F5EF] focus:outline-none focus:border-[#F5C451]"
                      />
                    </div>
                  )}
                </div>

                {/* Provider Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#B8B2A5]">Engine Provider</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "pollinations", label: "Pollinations.ai", desc: "Flux Realism" },
                      { id: "huggingface", label: "Hugging Face", desc: "FLUX.1-schnell" },
                      { id: "sandbox", label: "Local Raster", desc: "Deterministic" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setImageProviderChoice(p.id as any)}
                        className={clsx(
                          "p-2.5 rounded-xl border text-left transition flex flex-col justify-between",
                          imageProviderChoice === p.id
                            ? "bg-[#17140D] border-[#F5C451] text-[#F7F5EF]"
                            : "bg-[#080808] border-white/5 text-[#827C70] hover:border-white/10"
                        )}
                      >
                        <span className="text-xs font-semibold">{p.label}</span>
                        <span className="text-[10px] text-[#B8B2A5]">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#B8B2A5]">Aspect Ratio</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["16:9", "1:1", "9:16", "4:3"] as const).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setImageAspectRatio(ratio)}
                        className={clsx(
                          "py-2 rounded-xl border text-xs font-mono font-medium transition",
                          imageAspectRatio === ratio
                            ? "bg-[#17140D] border-[#F5C451] text-[#FFD978]"
                            : "bg-[#080808] border-white/5 text-[#827C70] hover:border-white/10"
                        )}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  onClick={handleGenerateImage}
                  className="w-full py-4 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-[#F5C451] to-[#FFD978] text-[#050505] hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#F5C451]/20"
                >
                  {isGeneratingImage ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Synthesizing Image...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Visual Artifact</span>
                    </>
                  )}
                </button>

                {imageError && (
                  <div className="p-3 rounded-xl bg-[#FF6868]/10 border border-[#FF6868]/30 text-xs text-[#FF6868] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{imageError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Output Canvas Preview (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-[#11100D] border border-[#F5C451]/20 rounded-2xl p-6 min-h-[520px] flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#F5C451]" />
                    <span className="text-sm font-semibold text-[#F7F5EF]">Artifact Canvas</span>
                  </div>
                  {currentImageResult && (
                    <div className="flex items-center gap-2">
                      <a
                        href={currentImageResult.url}
                        download={`antigravity_${Date.now()}.jpg`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#080808] border border-[#F5C451]/30 hover:border-[#F5C451] text-xs text-[#F5C451] font-medium flex items-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Canvas Display */}
                <div className="my-auto py-6 flex items-center justify-center">
                  {isGeneratingImage ? (
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="w-16 h-16 border-4 border-[#F5C451]/20 border-t-[#F5C451] rounded-full animate-spin" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[#FFD978]">Rendering High-Res Neural Output...</p>
                        <p className="text-xs text-[#827C70]">Cascading across Pollinations, Hugging Face, and Cloudinary</p>
                      </div>
                    </div>
                  ) : currentImageResult ? (
                    <div className="relative group max-h-[500px] overflow-hidden rounded-xl border border-[#F5C451]/30">
                      <img
                        src={currentImageResult.url}
                        alt={currentImageResult.prompt}
                        className="max-h-[480px] w-auto object-contain rounded-xl mx-auto shadow-2xl"
                      />
                    </div>
                  ) : (
                    <div className="text-center space-y-3 py-16">
                      <div className="w-16 h-16 rounded-2xl bg-[#080808] border border-[#F5C451]/20 flex items-center justify-center mx-auto text-[#F5C451]">
                        <ImageIcon className="w-8 h-8 opacity-40" />
                      </div>
                      <p className="text-sm text-[#B8B2A5]">No image generated in this session.</p>
                      <p className="text-xs text-[#827C70] max-w-sm mx-auto">
                        Configure your prompt and click Generate to produce high-fidelity imagery stored permanently on Cloudinary CDN.
                      </p>
                    </div>
                  )}
                </div>

                {/* Metadata Footer */}
                {currentImageResult && (
                  <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-[#827C70] font-mono">
                    <span>Engine: {currentImageResult.provider} ({currentImageResult.model})</span>
                    <span>Bytes: {(currentImageResult.bytes / 1024).toFixed(1)} KB</span>
                    <span>Aspect: {currentImageResult.aspectRatio}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: AUDIO ===================== */}
        {activeTab === "AUDIO" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Controls (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#11100D] border border-[#F5C451]/20 rounded-2xl p-6 space-y-6 shadow-xl">
                {/* Audio Mode Switcher */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#080808] rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setAudioMode("TTS")}
                    className={clsx(
                      "py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition",
                      audioMode === "TTS"
                        ? "bg-[#17140D] text-[#FFD978] border border-[#F5C451]/40"
                        : "text-[#827C70] hover:text-[#F7F5EF]"
                    )}
                  >
                    <Mic className="w-4 h-4" />
                    <span>Neural Speech (TTS)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudioMode("MUSIC")}
                    className={clsx(
                      "py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition",
                      audioMode === "MUSIC"
                        ? "bg-[#17140D] text-[#FFD978] border border-[#F5C451]/40"
                        : "text-[#827C70] hover:text-[#F7F5EF]"
                    )}
                  >
                    <Music2 className="w-4 h-4" />
                    <span>Music Generation</span>
                  </button>
                </div>

                {/* TTS Mode Controls */}
                {audioMode === "TTS" ? (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase tracking-wider text-[#F5C451] font-semibold">
                        Speech Script
                      </label>
                      <textarea
                        rows={4}
                        value={ttsText}
                        onChange={(e) => setTtsText(e.target.value)}
                        placeholder="Enter speech text to synthesize..."
                        className="w-full bg-[#080808] border border-[#F5C451]/20 rounded-xl p-4 text-sm text-[#F7F5EF] focus:outline-none focus:border-[#F5C451]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase tracking-wider text-[#B8B2A5]">Voice Model</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "onyx", label: "Onyx", desc: "Deep Baritone" },
                          { id: "aurora", label: "Aurora", desc: "Clear Soprano" },
                          { id: "echo", label: "Echo", desc: "Resonant" },
                        ].map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setTtsVoice(v.id as any)}
                            className={clsx(
                              "p-2.5 rounded-xl border text-left transition flex flex-col justify-between",
                              ttsVoice === v.id
                                ? "bg-[#17140D] border-[#F5C451] text-[#F7F5EF]"
                                : "bg-[#080808] border-white/5 text-[#827C70] hover:border-white/10"
                            )}
                          >
                            <span className="text-xs font-semibold">{v.label}</span>
                            <span className="text-[10px] text-[#B8B2A5]">{v.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Music Mode Controls */
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase tracking-wider text-[#F5C451] font-semibold">
                        Music Prompt
                      </label>
                      <textarea
                        rows={3}
                        value={musicPrompt}
                        onChange={(e) => setMusicPrompt(e.target.value)}
                        placeholder="Describe genre, tempo, instruments..."
                        className="w-full bg-[#080808] border border-[#F5C451]/20 rounded-xl p-4 text-sm text-[#F7F5EF] focus:outline-none focus:border-[#F5C451]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase tracking-wider text-[#B8B2A5]">Genre Palette</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["ambient", "cyberpunk", "cinematic", "synthwave", "orchestral"] as const).map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setMusicGenre(g)}
                            className={clsx(
                              "py-2 px-3 rounded-xl border text-xs font-medium capitalize transition",
                              musicGenre === g
                                ? "bg-[#17140D] border-[#F5C451] text-[#FFD978]"
                                : "bg-[#080808] border-white/5 text-[#827C70] hover:border-white/10"
                            )}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-[#827C70]">Duration: {musicDuration}s</label>
                        <input
                          type="range"
                          min={5}
                          max={30}
                          step={5}
                          value={musicDuration}
                          onChange={(e) => setMusicDuration(Number(e.target.value))}
                          className="w-full accent-[#F5C451]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-[#827C70]">Tempo: {musicTempo} BPM</label>
                        <input
                          type="range"
                          min={80}
                          max={160}
                          step={5}
                          value={musicTempo}
                          onChange={(e) => setMusicTempo(Number(e.target.value))}
                          className="w-full accent-[#F5C451]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <button
                  type="button"
                  disabled={isGeneratingAudio}
                  onClick={handleGenerateAudio}
                  className="w-full py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#F5C451] to-[#FFD978] text-[#050505] hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#F5C451]/20"
                >
                  {isGeneratingAudio ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Synthesizing Audio Stream...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Generate {audioMode === "TTS" ? "Speech" : "Music"} Track</span>
                    </>
                  )}
                </button>

                {audioError && (
                  <div className="p-3 rounded-xl bg-[#FF6868]/10 border border-[#FF6868]/30 text-xs text-[#FF6868] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{audioError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Output Audio Player Canvas (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-[#11100D] border border-[#F5C451]/20 rounded-2xl p-6 min-h-[520px] flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-[#F5C451]" />
                    <span className="text-sm font-semibold text-[#F7F5EF]">Audio Master Player</span>
                  </div>
                  {currentAudioResult && (
                    <a
                      href={currentAudioResult.url}
                      download={`audio_${Date.now()}.wav`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#080808] border border-[#F5C451]/30 hover:border-[#F5C451] text-xs text-[#F5C451] font-medium flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download WAV</span>
                    </a>
                  )}
                </div>

                {/* Player Display */}
                <div className="my-auto py-8">
                  {isGeneratingAudio ? (
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="w-16 h-16 border-4 border-[#F5C451]/20 border-t-[#F5C451] rounded-full animate-spin" />
                      <p className="text-sm font-semibold text-[#FFD978]">Synthesizing 44.1kHz Stereo WAV...</p>
                    </div>
                  ) : currentAudioResult ? (
                    <div className="bg-[#080808] border border-[#F5C451]/30 rounded-2xl p-6 space-y-6 shadow-2xl">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#F5C451]/20 text-[#FFD978]">
                            {currentAudioResult.mode} TRACK
                          </span>
                          <h3 className="text-sm font-semibold text-[#F7F5EF] line-clamp-1">
                            {currentAudioResult.prompt}
                          </h3>
                        </div>
                        <div className="text-right text-xs font-mono text-[#827C70]">
                          {currentAudioResult.durationSeconds}s duration
                        </div>
                      </div>

                      {/* Harmonic Waveform Bars */}
                      <div className="flex items-center justify-between gap-1 h-16 px-4 bg-[#11100D] rounded-xl border border-white/5">
                        {[40, 65, 30, 80, 55, 95, 70, 45, 85, 60, 35, 75, 50, 90, 65, 40, 80, 55, 70, 45, 90, 60].map(
                          (h, i) => (
                            <div
                              key={i}
                              style={{ height: `${h}%` }}
                              className="w-1.5 rounded-full bg-gradient-to-t from-[#B88622] to-[#F5C451] opacity-80"
                            />
                          )
                        )}
                      </div>

                      {/* Real HTML5 Audio Player */}
                      <audio controls className="w-full accent-[#F5C451] rounded-xl" src={currentAudioResult.url} />
                    </div>
                  ) : (
                    <div className="text-center space-y-3 py-16">
                      <div className="w-16 h-16 rounded-2xl bg-[#080808] border border-[#F5C451]/20 flex items-center justify-center mx-auto text-[#F5C451]">
                        <Music className="w-8 h-8 opacity-40" />
                      </div>
                      <p className="text-sm text-[#B8B2A5]">No audio generated in this session.</p>
                      <p className="text-xs text-[#827C70] max-w-sm mx-auto">
                        Switch between Neural TTS speech and algorithmic music generation. All files render genuine 44.1kHz stereo audio.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Metadata */}
                {currentAudioResult && (
                  <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-[#827C70] font-mono">
                    <span>Engine: {currentAudioResult.provider} ({currentAudioResult.model})</span>
                    <span>Bytes: {(currentAudioResult.bytes / 1024).toFixed(1)} KB</span>
                    <span>Format: RIFF/WAV 44.1kHz</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: VIDEO ===================== */}
        {activeTab === "VIDEO" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Controls (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#11100D] border border-[#F5C451]/20 rounded-2xl p-6 space-y-6 shadow-xl">
                {/* Video Mode Switcher */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#B8B2A5]">Synthesis Mode</label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-[#080808] rounded-xl border border-white/5">
                    {[
                      { id: "TEXT_TO_VIDEO", label: "Text-to-Video" },
                      { id: "IMAGE_TO_VIDEO", label: "Image-to-Video" },
                      { id: "SLIDESHOW", label: "Slideshow" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setVideoMode(m.id as VideoMode)}
                        className={clsx(
                          "py-2 rounded-lg text-xs font-semibold text-center transition",
                          videoMode === m.id
                            ? "bg-[#17140D] text-[#FFD978] border border-[#F5C451]/40"
                            : "text-[#827C70] hover:text-[#F7F5EF]"
                        )}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* Explicit Non-AI Label for Slideshow fallback per Requirement 8.3 */}
                  {videoMode === "SLIDESHOW" && (
                    <div className="p-2.5 rounded-lg bg-[#F5B94C]/10 border border-[#F5B94C]/30 text-xs text-[#F5B94C] font-mono">
                      ⚠️ Slideshow fallback — not AI text-to-video.
                    </div>
                  )}
                </div>

                {/* Prompt */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#F5C451] font-semibold">
                    Motion Prompt
                  </label>
                  <textarea
                    rows={3}
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    placeholder="Describe spatial camera motion and atmosphere..."
                    className="w-full bg-[#080808] border border-[#F5C451]/20 rounded-xl p-4 text-sm text-[#F7F5EF] focus:outline-none focus:border-[#F5C451]"
                  />
                </div>

                {/* Source Image URL for Image-to-Video / Slideshow */}
                {(videoMode === "IMAGE_TO_VIDEO" || videoMode === "SLIDESHOW") && (
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#B8B2A5]">
                      Reference Image URL / Keyframe
                    </label>
                    <input
                      type="text"
                      value={videoImageUrl}
                      onChange={(e) => setVideoImageUrl(e.target.value)}
                      placeholder="Paste image URL or leave blank to auto-synthesize keyframe..."
                      className="w-full bg-[#080808] border border-white/10 rounded-xl p-3 text-xs text-[#F7F5EF] focus:outline-none focus:border-[#F5C451]"
                    />
                  </div>
                )}

                {/* Settings Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-[#827C70]">Duration: {videoDuration}s</label>
                    <input
                      type="range"
                      min={3}
                      max={12}
                      step={1}
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(Number(e.target.value))}
                      className="w-full accent-[#F5C451]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#827C70]">Aspect Ratio</label>
                    <div className="flex gap-1">
                      {(["16:9", "9:16", "1:1"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setVideoAspectRatio(r)}
                          className={clsx(
                            "flex-1 py-1.5 rounded-lg border text-xs font-mono transition",
                            videoAspectRatio === r
                              ? "bg-[#17140D] border-[#F5C451] text-[#FFD978]"
                              : "bg-[#080808] border-white/5 text-[#827C70]"
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit Video Job Button */}
                <button
                  type="button"
                  disabled={isGeneratingVideo || !videoPrompt.trim()}
                  onClick={handleGenerateVideo}
                  className="w-full py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#F5C451] to-[#FFD978] text-[#050505] hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#F5C451]/20"
                >
                  {isGeneratingVideo ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Processing Video Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <Film className="w-5 h-5" />
                      <span>Synthesize H.264 Video</span>
                    </>
                  )}
                </button>

                {videoError && (
                  <div className="p-3 rounded-xl bg-[#FF6868]/10 border border-[#FF6868]/30 text-xs text-[#FF6868] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{videoError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Video Canvas & Progress Tracker (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-[#11100D] border border-[#F5C451]/20 rounded-2xl p-6 min-h-[520px] flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#F5C451]" />
                    <span className="text-sm font-semibold text-[#F7F5EF]">Video Master Canvas</span>
                  </div>
                  {currentVideoResult && (
                    <a
                      href={currentVideoResult.url}
                      download={`video_${Date.now()}.mp4`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#080808] border border-[#F5C451]/30 hover:border-[#F5C451] text-xs text-[#F5C451] font-medium flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download MP4</span>
                    </a>
                  )}
                </div>

                {/* Progress / Output Display */}
                <div className="my-auto py-8">
                  {isGeneratingVideo && activeVideoJob ? (
                    <div className="bg-[#080808] border border-[#F5C451]/30 rounded-2xl p-8 space-y-6 max-w-lg mx-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-[#F5C451]">
                          Job: {activeVideoJob.jobId}
                        </span>
                        <span className="text-xs font-mono text-[#35D6A0] font-bold">
                          {activeVideoJob.progress}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[#17140D] h-2.5 rounded-full overflow-hidden border border-white/10">
                        <div
                          className="bg-gradient-to-r from-[#B88622] to-[#F5C451] h-full transition-all duration-300 rounded-full"
                          style={{ width: `${Math.max(5, activeVideoJob.progress)}%` }}
                        />
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#F7F5EF] flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-[#F5C451]" />
                          <span>{activeVideoJob.stageDescription}</span>
                        </p>
                        <p className="text-xs text-[#827C70]">
                          Generating spatial camera motion, audio track, and syncing with Cloudinary.
                        </p>
                      </div>
                    </div>
                  ) : currentVideoResult ? (
                    <div className="relative group max-h-[460px] overflow-hidden rounded-xl border border-[#F5C451]/30">
                      <video
                        controls
                        playsInline
                        className="max-h-[440px] w-auto mx-auto rounded-xl shadow-2xl"
                        src={currentVideoResult.url}
                      />
                    </div>
                  ) : (
                    <div className="text-center space-y-3 py-16">
                      <div className="w-16 h-16 rounded-2xl bg-[#080808] border border-[#F5C451]/20 flex items-center justify-center mx-auto text-[#F5C451]">
                        <Video className="w-8 h-8 opacity-40" />
                      </div>
                      <p className="text-sm text-[#B8B2A5]">No video synthesized in this session.</p>
                      <p className="text-xs text-[#827C70] max-w-sm mx-auto">
                        Generate cinematic H.264 video with real native FFmpeg encoding and Cloudinary streaming delivery.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Metadata */}
                {currentVideoResult && (
                  <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-[#827C70] font-mono">
                    <span>Engine: {currentVideoResult.provider}</span>
                    <span>Bytes: {(currentVideoResult.bytes / 1024).toFixed(1)} KB</span>
                    <span>Format: H.264 / MP4 (FastStart)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 4: HUGGING FACE AGENTS MCP HUB ===================== */}
        {activeTab === "MCP" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* MCP Discovery Controls (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#11100D] border border-[#F5C451]/20 rounded-2xl p-6 space-y-6 shadow-xl">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-[#F5C451] font-semibold">
                        Official Hugging Face Agents MCP
                      </span>
                      <a
                        href="https://huggingface.co/mcp"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-[#6BB8FF] hover:underline flex items-center gap-1"
                      >
                        <span>Documentation</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-xs text-[#827C70]">
                      Endpoint: <code className="text-[#FFD978]">https://huggingface.co/mcp</code>
                    </p>
                  </div>

                  {/* Tool Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#B8B2A5]">Select MCP Tool</label>
                    <div className="space-y-1.5">
                      {[
                        { id: "hf_search_models", label: "Search Models", desc: "Discover Hub AI models" },
                        { id: "hf_search_datasets", label: "Search Datasets", desc: "Browse open datasets" },
                        { id: "hf_search_spaces", label: "Search Spaces", desc: "Discover interactive Gradio Spaces" },
                        { id: "hf_docs_search", label: "Documentation Search", desc: "Query official Hugging Face docs" },
                        { id: "hf_get_model_info", label: "Model Info", desc: "Inspect model tags and pipeline type" },
                      ].map((tool) => (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => setMcpSelectedTool(tool.id)}
                          className={clsx(
                            "w-full p-3 rounded-xl border text-left transition flex items-center justify-between",
                            mcpSelectedTool === tool.id
                              ? "bg-[#17140D] border-[#F5C451] text-[#FFD978]"
                              : "bg-[#080808] border-white/5 text-[#827C70] hover:border-white/10"
                          )}
                        >
                          <div>
                            <div className="text-xs font-semibold">{tool.label}</div>
                            <div className="text-[10px] text-[#B8B2A5]">{tool.desc}</div>
                          </div>
                          <span className="text-[10px] font-mono text-[#827C70]">{tool.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Query Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#B8B2A5]">Search Query</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={mcpQuery}
                        onChange={(e) => setMcpQuery(e.target.value)}
                        placeholder="e.g. flux, whisper, musicgen, ltx-video..."
                        className="w-full bg-[#080808] border border-[#F5C451]/20 rounded-xl p-3.5 pl-10 text-xs text-[#F7F5EF] focus:outline-none focus:border-[#F5C451]"
                      />
                      <Search className="w-4 h-4 text-[#827C70] absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  {/* Query Action Button */}
                  <button
                    type="button"
                    disabled={mcpSearching || !mcpQuery.trim()}
                    onClick={handleMcpSearch}
                    className="w-full py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#F5C451] to-[#FFD978] text-[#050505] hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#F5C451]/20"
                  >
                    {mcpSearching ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Querying MCP Bridge...</span>
                      </>
                    ) : (
                      <>
                        <Radio className="w-5 h-5" />
                        <span>Execute Live MCP Query</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Live MCP Results Viewer (7 cols) */}
              <div className="lg:col-span-7">
                <div className="bg-[#11100D] border border-[#F5C451]/20 rounded-2xl p-6 min-h-[520px] flex flex-col justify-between shadow-xl">
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-[#F5C451]" />
                      <span className="text-sm font-semibold text-[#F7F5EF]">MCP Response Inspector</span>
                    </div>
                    <span className="text-xs font-mono text-[#35D6A0]">Live Hub MCP Verified</span>
                  </div>

                  {/* Result Panel */}
                  <div className="my-auto py-4">
                    {mcpSearching ? (
                      <div className="flex flex-col items-center gap-4 text-center py-16">
                        <div className="w-16 h-16 border-4 border-[#F5C451]/20 border-t-[#F5C451] rounded-full animate-spin" />
                        <p className="text-sm font-semibold text-[#FFD978]">Connecting to https://huggingface.co/mcp...</p>
                      </div>
                    ) : mcpQueryResult ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs text-[#827C70] font-mono">
                          <span>Tool: {mcpSelectedTool}</span>
                          <span>Query: &quot;{mcpQuery}&quot;</span>
                        </div>
                        <pre className="bg-[#080808] border border-[#F5C451]/30 rounded-xl p-4 text-xs font-mono text-[#35D6A0] overflow-x-auto max-h-[380px]">
                          {JSON.stringify(mcpQueryResult, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center space-y-3 py-16">
                        <div className="w-16 h-16 rounded-2xl bg-[#080808] border border-[#F5C451]/20 flex items-center justify-center mx-auto text-[#F5C451]">
                          <Radio className="w-8 h-8 opacity-40" />
                        </div>
                        <p className="text-sm text-[#B8B2A5]">No MCP query executed yet.</p>
                        <p className="text-xs text-[#827C70] max-w-sm mx-auto">
                          Choose a tool and enter a search query to discover models, datasets, spaces, and documentation live from Hugging Face Hub.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#827C70] font-mono">
                    <span>Protocol: Model Context Protocol (JSON-RPC)</span>
                    <span>Transport: Official Remote Hub Endpoint</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== GENERATION HISTORY GALLERY ===================== */}
        <div className="space-y-4 pt-6 border-t border-[#F5C451]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#F5C451]" />
              <h2 className="text-lg font-bold text-[#F7F5EF]">Generation Vault & Session History</h2>
              <span className="text-xs font-mono text-[#827C70]">({history.length} items)</span>
            </div>
            {history.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-[#827C70] hover:text-[#FF6868] flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="bg-[#11100D] border border-white/5 rounded-2xl p-8 text-center text-xs text-[#827C70]">
              Artifact history is stored in local storage and Cloudinary CDN. Generated items will appear here automatically.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#11100D] border border-[#F5C451]/20 rounded-xl p-4 space-y-3 hover:border-[#F5C451] transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#F5C451]/20 text-[#FFD978]">
                        {item.type}
                      </span>
                      <span className="text-[10px] font-mono text-[#827C70]">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <p className="text-xs text-[#F7F5EF] line-clamp-2">{item.prompt}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="text-[10px] font-mono text-[#827C70] flex items-center justify-between">
                      <span>{item.provider}</span>
                      {item.bytes && <span>{(item.bytes / 1024).toFixed(0)} KB</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1.5 rounded-lg bg-[#080808] border border-white/10 hover:border-[#F5C451] text-[10px] text-[#F5C451] text-center font-medium transition"
                      >
                        Open Asset
                      </a>
                      <a
                        href={item.url}
                        download={`artifact_${item.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-[#080808] border border-white/10 hover:border-[#F5C451] text-[#B8B2A5] hover:text-[#F7F5EF] transition"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
