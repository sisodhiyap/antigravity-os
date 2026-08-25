"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { ProgressBar } from "@/ui/ProgressBar";
import {
  Sparkles,
  Image as ImageIcon,
  Music,
  Video as VideoIcon,
  Box,
  Layers,
  Database,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  FileAudio,
  Play,
  RotateCw,
  Send,
} from "lucide-react";

export default function OmniCraftStudioPage() {
  const [activeTab, setActiveTab] = useState<"generate" | "library" | "providers">("generate");
  
  // Generation States
  const [textPrompt, setTextPrompt] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStyle, setImageStyle] = useState("UI_MOCKUP");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [audioText, setAudioText] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [meshPrompt, setMeshPrompt] = useState("");

  // Statuses
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLog, setGenerationLog] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Loaded Data
  const [assets, setAssets] = useState<any[]>([]);
  const [providerData, setProviderData] = useState<any>({ providers: [], stats: { globalSpendUsd: 0, globalBudgetUsd: 50 } });

  const fetchAssets = async () => {
    try {
      const res = await fetch("/api/omnicraft/assets");
      const json = await res.json();
      if (json.success) setAssets(json.data);
    } catch (_) {}
  };

  const fetchProviders = async () => {
    try {
      const res = await fetch("/api/omnicraft/providers");
      const json = await res.json();
      if (json.success) setProviderData(json.data);
    } catch (_) {}
  };

  useEffect(() => {
    fetchAssets();
    fetchProviders();
  }, []);

  const addLog = (msg: string) => {
    setGenerationLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    setIsGenerating(true);
    setErrorMsg(null);
    addLog(`Initiating image generation: "${imagePrompt}"...`);
    try {
      const res = await fetch("/api/omnicraft/image", {
        method: "POST",
        body: JSON.stringify({ prompt: imagePrompt, aspectRatio, style: imageStyle }),
      });
      const json = await res.json();
      if (json.success) {
        addLog(`Image generated successfully. Registered Asset ID: ${json.data.asset.assetId}`);
        fetchAssets();
        fetchProviders();
      } else {
        setErrorMsg(json.error);
        addLog(`Image generation failed: ${json.error}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      addLog(`Image generation crashed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!audioText) return;
    setIsGenerating(true);
    setErrorMsg(null);
    addLog(`Synthesizing neural voiceover narration...`);
    try {
      const res = await fetch("/api/omnicraft/audio", {
        method: "POST",
        body: JSON.stringify({ text: audioText }),
      });
      const json = await res.json();
      if (json.success) {
        addLog(`Audio synthesized successfully. Registered Asset ID: ${json.data.asset.assetId}`);
        fetchAssets();
        fetchProviders();
      } else {
        setErrorMsg(json.error);
        addLog(`Audio synthesis failed: ${json.error}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      addLog(`Audio synthesis crashed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoTitle) return;
    setIsGenerating(true);
    setErrorMsg(null);
    addLog(`Compiling Remotion video reel: "${videoTitle}"...`);
    try {
      const res = await fetch("/api/omnicraft/video", {
        method: "POST",
        body: JSON.stringify({
          title: videoTitle,
          description: "Programmatically sequenced workspace walkthrough",
          scenes: [
            {
              sceneId: "scene_1",
              title: "AI Studio Preview",
              durationSeconds: 5,
              visualPrompt: "OmniCraft creative Operations center UI mockup",
              voiceoverText: "Analyzing workspace assets and project layouts.",
            },
          ],
        }),
      });
      const json = await res.json();
      if (json.success) {
        addLog(`Video reel compiled successfully. Registered Asset ID: ${json.data.asset.assetId}`);
        fetchAssets();
        fetchProviders();
      } else {
        setErrorMsg(json.error);
        addLog(`Video compilation failed: ${json.error}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      addLog(`Video compilation crashed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate3D = async () => {
    if (!meshPrompt) return;
    setIsGenerating(true);
    setErrorMsg(null);
    addLog(`Generating Blender 3D GLTF geometry mesh...`);
    try {
      const res = await fetch("/api/omnicraft/mesh3d", {
        method: "POST",
        body: JSON.stringify({ prompt: meshPrompt }),
      });
      const json = await res.json();
      if (json.success) {
        addLog(`3D model generated successfully. Registered Asset ID: ${json.data.asset.assetId}`);
        fetchAssets();
        fetchProviders();
      } else {
        setErrorMsg(json.error);
        addLog(`3D model generation failed: ${json.error}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      addLog(`3D generation crashed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-slate-100">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-cyber-cyan" />
            <span>OMNICRAFT AI CREATIVE OPERATIONS STUDIO</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise workspace for cross-functional teams to design, generate, and orchestrate campaign media.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => { fetchAssets(); fetchProviders(); }} variant="secondary" size="sm" className="gap-2">
            <RotateCw className="w-4 h-4" />
            <span>Refresh Studio</span>
          </Button>
          <Badge variant="cyan" dot>
            BUDGET SPEND: ${providerData.stats.globalSpendUsd.toFixed(4)} / ${providerData.stats.globalBudgetUsd}
          </Badge>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2.5 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab("generate")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === "generate" ? "bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30" : "text-slate-400 hover:text-slate-200"}`}
        >
          <Layers className="w-4 h-4 inline mr-2" />
          Creative Workstation
        </button>
        <button
          onClick={() => setActiveTab("library")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === "library" ? "bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30" : "text-slate-400 hover:text-slate-200"}`}
        >
          <Database className="w-4 h-4 inline mr-2" />
          Canonical Asset Library ({assets.length})
        </button>
        <button
          onClick={() => setActiveTab("providers")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === "providers" ? "bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30" : "text-slate-400 hover:text-slate-200"}`}
        >
          <Cpu className="w-4 h-4 inline mr-2" />
          Gateway Providers & Quotas
        </button>
      </div>

      {/* TABS CONTENT */}
      {activeTab === "generate" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Workstation Forms */}
          <div className="xl:col-span-2 space-y-5">
            {/* Image Generator */}
            <Card glow="cyan">
              <CardHeader>
                <CardTitle>
                  <ImageIcon className="w-4 h-4 text-cyber-cyan" />
                  <span>AI Image Generation Workspace</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Generation Prompt</label>
                  <input
                    type="text"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="e.g. Fintech trading dashboard UI with dark glassmorphism cards"
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs focus:outline-none focus:border-cyber-cyan"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Aspect Ratio</label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs focus:outline-none focus:border-cyber-cyan"
                    >
                      <option value="16:9">16:9 Landscape</option>
                      <option value="1:1">1:1 Square</option>
                      <option value="9:16">9:16 Portrait</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Style Category</label>
                    <select
                      value={imageStyle}
                      onChange={(e) => setImageStyle(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs focus:outline-none focus:border-cyber-cyan"
                    >
                      <option value="UI_MOCKUP">UI/UX Mockup</option>
                      <option value="3D_RENDER">3D Render</option>
                      <option value="PHOTOREALISTIC">Photorealistic</option>
                      <option value="VECTOR">Vector Graphic</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleGenerateImage} disabled={isGenerating || !imagePrompt} className="w-full">
                  <span>Generate Campaign Image</span>
                </Button>
              </CardContent>
            </Card>

            {/* Audio Synthesis */}
            <Card glow="purple">
              <CardHeader>
                <CardTitle>
                  <Music className="w-4 h-4 text-cyber-purple" />
                  <span>AI Narration & TTS Audio Synth</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Voiceover Text</label>
                  <textarea
                    rows={3}
                    value={audioText}
                    onChange={(e) => setAudioText(e.target.value)}
                    placeholder="Enter script text to synthesize voiceover narration..."
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs focus:outline-none focus:border-cyber-cyan"
                  />
                </div>
                <Button onClick={handleGenerateAudio} disabled={isGenerating || !audioText} className="w-full">
                  <span>Synthesize Voiceover</span>
                </Button>
              </CardContent>
            </Card>

            {/* Video & 3D */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <VideoIcon className="w-4 h-4 text-cyber-cyan" />
                    <span>Video Reel Compositor</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Video Title</label>
                    <input
                      type="text"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="e.g. Campaign Launch Walkthrough"
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs focus:outline-none focus:border-cyber-cyan"
                    />
                  </div>
                  <Button onClick={handleGenerateVideo} disabled={isGenerating || !videoTitle} className="w-full">
                    <span>Compile Video Reel</span>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    <Box className="w-4 h-4 text-cyber-cyan" />
                    <span>3D Mesh Generator</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Mesh Prompt</label>
                    <input
                      type="text"
                      value={meshPrompt}
                      onChange={(e) => setMeshPrompt(e.target.value)}
                      placeholder="e.g. Holographic platform core node"
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs focus:outline-none focus:border-cyber-cyan"
                    />
                  </div>
                  <Button onClick={handleGenerate3D} disabled={isGenerating || !meshPrompt} className="w-full">
                    <span>Generate 3D Model</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Logs & Telemetry panel */}
          <div className="space-y-5">
            <Card glow="cyan" className="h-[350px] flex flex-col">
              <CardHeader>
                <CardTitle>
                  <Cpu className="w-4 h-4 text-cyber-cyan" />
                  <span>Workstation Process Telemetry</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-2 text-[10px] font-mono bg-slate-950 p-4 rounded-lg border border-white/5">
                {isGenerating && <div className="text-cyber-cyan animate-pulse">⚙️ Multimodal capability router active...</div>}
                {generationLog.length === 0 ? (
                  <div className="text-slate-500">No active processes. Trigger a campaign asset creation to start logging.</div>
                ) : (
                  generationLog.map((log, idx) => <div key={idx} className="text-slate-300">{log}</div>)
                )}
              </CardContent>
            </Card>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-400 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>GATEWAY ERROR RECORDED</span>
                </div>
                <p>{errorMsg}</p>
                <p className="text-[10px] text-slate-500">Provide required authorization keys or fallback locally.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "library" && (
        <Card>
          <CardHeader>
            <CardTitle>
              <Database className="w-4 h-4 text-cyber-cyan" />
              <span> persistance Library & Checksum Ledger</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assets.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <Database className="w-10 h-10 mx-auto text-slate-700" />
                <p className="text-xs">No assets generated yet.</p>
                <p className="text-[10px] text-slate-600">Generated media assets are registered in the canonical registry with cryptographic provenance.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {assets.map((asset) => (
                  <div key={asset.assetId} className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <Badge variant="cyan">{asset.type}</Badge>
                      <span className="text-[9px] text-slate-500">{asset.assetId}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block font-bold">SHA-256 Checksum</span>
                      <span className="text-[9px] text-slate-300 block bg-slate-900 p-1.5 rounded border border-white/5 truncate">
                        {asset.hashSha256}
                      </span>
                    </div>

                    {asset.type === "IMAGE" && (
                      <div className="border border-white/10 rounded-lg overflow-hidden h-40 bg-slate-900 flex items-center justify-center">
                        <img src={asset.path} alt={asset.altText || "Mockup"} className="max-h-full object-contain" />
                      </div>
                    )}

                    {asset.type === "AUDIO" && (
                      <div className="border border-white/10 rounded-lg p-3 bg-slate-900 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-cyber-cyan">
                          <FileAudio className="w-4 h-4" />
                          <span>Playback Narration</span>
                        </div>
                        <audio src={asset.path} controls className="w-full h-8" />
                      </div>
                    )}

                    {asset.type === "VIDEO" && (
                      <div className="border border-white/10 rounded-lg p-3 bg-slate-900 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-cyber-cyan">
                          <Play className="w-4 h-4" />
                          <span>Remotion WebM Reel</span>
                        </div>
                        <a href={asset.path} download className="text-[10px] text-cyber-cyan hover:underline block">
                          Download WebM Composition Manifest
                        </a>
                      </div>
                    )}

                    {asset.type === "MODEL_3D" && (
                      <div className="border border-white/10 rounded-lg p-3 bg-slate-900 text-[10px] space-y-1">
                        <span className="text-slate-400 font-bold block">GLTF Mesh Spec</span>
                        <pre className="bg-slate-950 p-1.5 rounded text-[8px] text-slate-300 overflow-x-auto">
                          {`Vertices: 1536 | Faces: 1024\nMaterial: PBR_PolyHaven_Material`}
                        </pre>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-500 border-t border-white/5 pt-2">
                      <div>
                        <span>Mode: </span>
                        <span className="text-slate-300">{asset.executionMode}</span>
                      </div>
                      <div className="text-right">
                        <span>Size: </span>
                        <span className="text-slate-300">{(asset.sizeBytes / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "providers" && (
        <div className="space-y-6">
          {/* Quotas & Budget */}
          <Card glow="cyan">
            <CardHeader>
              <CardTitle>
                <ShieldCheck className="w-4 h-4 text-cyber-cyan" />
                <span>Budget Governance & Usage Ledger</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                <span className="text-slate-500 block uppercase text-[10px]">Global Spent (USD)</span>
                <span className="text-2xl font-bold text-cyber-cyan">${providerData.stats.globalSpendUsd.toFixed(4)}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                <span className="text-slate-500 block uppercase text-[10px]">Global Budget Allocation</span>
                <span className="text-2xl font-bold text-slate-300">${providerData.stats.globalBudgetUsd.toFixed(2)}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                <span className="text-slate-500 block uppercase text-[10px]">Quota Safety Margin</span>
                <span className="text-2xl font-bold text-emerald-400">
                  {((1 - providerData.stats.globalSpendUsd / providerData.stats.globalBudgetUsd) * 100).toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Providers Status */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Cpu className="w-4 h-4 text-cyber-cyan" />
                <span>Unified Gateway Capabilities Registry</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                      <th className="py-3 px-4">Provider ID</th>
                      <th className="py-3 px-4">Capability</th>
                      <th className="py-3 px-4">Execution Mode</th>
                      <th className="py-3 px-4">Cost Unit</th>
                      <th className="py-3 px-4">Health State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providerData.providers.map((p: any) => (
                      <tr key={p.providerId} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 font-bold text-slate-200">{p.name}</td>
                        <td className="py-3 px-4">{p.category}</td>
                        <td className="py-3 px-4">
                          <Badge variant={p.executionMode === "LIVE" ? "cyan" : p.executionMode === "LOCAL" ? "neon" : "purple"}>
                            {p.executionMode}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">${p.estimatedCostPerUnitUsd.toFixed(3)}</td>
                        <td className="py-3 px-4">
                          <Badge variant={p.healthState === "HEALTHY" ? "neon" : "purple"}>{p.healthState}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
