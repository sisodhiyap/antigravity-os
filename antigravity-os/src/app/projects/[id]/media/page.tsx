"use client";

import React, { useState, use } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import {
  Image as ImageIcon,
  Music,
  Video as VideoIcon,
  Box,
  Cpu,
  AlertTriangle,
  Layers,
} from "lucide-react";

export default function ProjectMediaSynthPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // States
  const [imagePrompt, setImagePrompt] = useState("");
  const [audioText, setAudioText] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [meshPrompt, setMeshPrompt] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const generateImage = async () => {
    if (!imagePrompt) return;
    setIsGenerating(true);
    setErrorMsg(null);
    addLog(`Routing Image Synth request for project [${id}]...`);
    try {
      const res = await fetch("/api/omnicraft/image", {
        method: "POST",
        body: JSON.stringify({ prompt: imagePrompt, workspaceId: id }),
      });
      const json = await res.json();
      if (json.success) {
        addLog(`Image Asset synthesized. ID: ${json.data.asset.assetId}`);
      } else {
        setErrorMsg(json.error);
        addLog(`Image Synth failed: ${json.error}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      addLog(`Image Synth crashed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAudio = async () => {
    if (!audioText) return;
    setIsGenerating(true);
    setErrorMsg(null);
    addLog(`Routing Audio TTS script synthesis...`);
    try {
      const res = await fetch("/api/omnicraft/audio", {
        method: "POST",
        body: JSON.stringify({ text: audioText, workspaceId: id }),
      });
      const json = await res.json();
      if (json.success) {
        addLog(`Audio Stem synthesized. ID: ${json.data.asset.assetId}`);
      } else {
        setErrorMsg(json.error);
        addLog(`Audio Synth failed: ${json.error}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      addLog(`Audio Synth crashed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVideo = async () => {
    if (!videoTitle) return;
    setIsGenerating(true);
    setErrorMsg(null);
    addLog(`Composing video compilation manifest...`);
    try {
      const res = await fetch("/api/omnicraft/video", {
        method: "POST",
        body: JSON.stringify({
          title: videoTitle,
          workspaceId: id,
          scenes: [
            {
              sceneId: "scene_1",
              title: "Product Workspace Introduction",
              durationSeconds: 5,
              voiceoverText: "Initializing production campaign walkthrough.",
            },
          ],
        }),
      });
      const json = await res.json();
      if (json.success) {
        addLog(`Video Reel composed. ID: ${json.data.asset.assetId}`);
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

  const generate3D = async () => {
    if (!meshPrompt) return;
    setIsGenerating(true);
    setErrorMsg(null);
    addLog(`Compiling Blender procedural 3D GLTF geometry...`);
    try {
      const res = await fetch("/api/omnicraft/mesh3d", {
        method: "POST",
        body: JSON.stringify({ prompt: meshPrompt, workspaceId: id }),
      });
      const json = await res.json();
      if (json.success) {
        addLog(`3D model generated. ID: ${json.data.asset.assetId}`);
      } else {
        setErrorMsg(json.error);
        addLog(`3D generation failed: ${json.error}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      addLog(`3D generation crashed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 font-mono text-slate-100">
      {/* Generator workstations */}
      <div className="xl:col-span-2 space-y-5">
        {/* Image Card */}
        <Card glow="cyan">
          <CardHeader>
            <CardTitle>
              <ImageIcon className="w-4 h-4 text-cyber-cyan" />
              <span>AI Image Generation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400">Prompt Description</label>
              <input
                type="text"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe target campaign branding imagery..."
                className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyber-cyan"
              />
            </div>
            <Button onClick={generateImage} disabled={isGenerating || !imagePrompt} className="w-full">
              <span>Synthesize Image</span>
            </Button>
          </CardContent>
        </Card>

        {/* Audio Card */}
        <Card glow="purple">
          <CardHeader>
            <CardTitle>
              <Music className="w-4 h-4 text-cyber-purple" />
              <span>Voiceover Narration Synthesis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400">Transcript text</label>
              <textarea
                rows={2}
                value={audioText}
                onChange={(e) => setAudioText(e.target.value)}
                placeholder="Script to convert to narration wave stems..."
                className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyber-cyan"
              />
            </div>
            <Button onClick={generateAudio} disabled={isGenerating || !audioText} className="w-full">
              <span>Synthesize Narration</span>
            </Button>
          </CardContent>
        </Card>

        {/* Video & 3D Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <VideoIcon className="w-4 h-4 text-cyber-cyan" />
                <span>Video Reel Compiler</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Campaign Video Title..."
                className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyber-cyan"
              />
              <Button onClick={generateVideo} disabled={isGenerating || !videoTitle} className="w-full">
                <span>Compile Reel</span>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Box className="w-4 h-4 text-cyber-cyan" />
                <span>3D Procedural Mesh</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                type="text"
                value={meshPrompt}
                onChange={(e) => setMeshPrompt(e.target.value)}
                placeholder="Holographic model target..."
                className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyber-cyan"
              />
              <Button onClick={generate3D} disabled={isGenerating || !meshPrompt} className="w-full">
                <span>Generate Mesh</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Telemetry log & error messages */}
      <div className="space-y-5">
        <Card glow="cyan" className="h-[300px] flex flex-col">
          <CardHeader>
            <CardTitle>
              <Cpu className="w-4 h-4 text-cyber-cyan" />
              <span>Workspace Generation Telemetry</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-2 text-[10px] bg-slate-950 p-4 rounded-lg border border-white/5">
            {logs.length === 0 ? (
              <div className="text-slate-500">Telemetry logs will populate upon triggering generation events.</div>
            ) : (
              logs.map((l, i) => <div key={i} className="text-slate-300">{l}</div>)
            )}
          </CardContent>
        </Card>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-400 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>GENERATION ENGINE EXCEPTION</span>
            </div>
            <p>{errorMsg}</p>
            <p className="text-[10px] text-slate-500">Modify prompt parameters or activate local backup synthesis.</p>
          </div>
        )}
      </div>
    </div>
  );
}
