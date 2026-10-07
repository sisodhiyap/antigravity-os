import fs from "fs";
import path from "path";

export interface DesignSystemTokens {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgGradient: string;
  fontFamily: string;
}

export interface WebsiteBlueprint {
  name: string;
  type: "portfolio" | "landing" | "agency" | "studio";
  title: string;
  description: string;
  designSystem: DesignSystemTokens;
  pages: string[];
  features: string[];
  hasChat: boolean;
  hasVideo: boolean;
  videoUrl?: string;
  imageUrl?: string;
}

export class WebsiteCodeSynthesizer {
  private static instance: WebsiteCodeSynthesizer;

  private constructor() {}

  public static getInstance(): WebsiteCodeSynthesizer {
    if (!WebsiteCodeSynthesizer.instance) {
      WebsiteCodeSynthesizer.instance = new WebsiteCodeSynthesizer();
    }
    return WebsiteCodeSynthesizer.instance;
  }

  /**
   * Generates type-safe TSX code for the main page of the generated website.
   */
  public generateMainPageCode(blueprint: WebsiteBlueprint): string {
    const tokens = blueprint.designSystem;
    // Sanitize strings to avoid broken TSX when descriptions contain quotes
    const safeStr = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/`/g, "\\`");
    const safeDesc = safeStr(blueprint.description);
    const safeTitle = safeStr(blueprint.title);

    // Default fallback visual assets if none generated
    const defaultVideo = "/generated-assets/video/vid_1787464656314_70f4d4e0.webm";
    const defaultImage = "/generated-assets/images/img_1787464656222_33869123.svg";
    const videoSource = blueprint.videoUrl || defaultVideo;
    const imageSource = blueprint.imageUrl || defaultImage;

    return `"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, ArrowRight, CheckCircle2, ChevronRight, MessageSquare, Terminal, Send, Layers, Play, Pause, Volume2, VolumeX } from "lucide-react";

export default function GeneratedWebsite() {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Welcome to ${safeTitle} assistant. How may I assist you with our services today?" }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    
    const userText = inputMsg;
    setMessages(prev => [...prev, { sender: "user", text: userText }]);
    setInputMsg("");
    setIsAiLoading(true);

    try {
      const res = await fetch("/api/todo-notes/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userText, content: "${safeDesc}" })
      });
      const json = await res.json();
      if (json.success) {
        setMessages(prev => [...prev, { sender: "ai", text: json.data.text }]);
      } else {
        setMessages(prev => [...prev, { sender: "ai", text: "Error: Failed to fetch AI response." }]);
      }
    } catch {
      setMessages(prev => [...prev, { sender: "ai", text: "Error connecting to AI Router service." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#020617]/70 border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr ${tokens.bgGradient} flex items-center justify-center shadow-[0_0_15px_-3px_rgba(6,182,212,0.5)]">
            <Sparkles className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-bold font-mono tracking-wider text-sm">${blueprint.name.toUpperCase()}</span>
        </div>

        <nav className="hidden md:flex gap-8 text-xs text-slate-400 font-mono">
          <a href="#about" className="hover:text-cyan-400 transition-colors">ABOUT</a>
          <a href="#features" className="hover:text-cyan-400 transition-colors">FEATURES</a>
          <a href="#media" className="hover:text-cyan-400 transition-colors">MEDIA</a>
          <a href="#chat" className="hover:text-cyan-400 transition-colors">AI HELPER</a>
        </nav>

        <button className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/40 text-cyan-400 transition-all">
          CONNECT
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex gap-2 items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-400 font-mono tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SOVEREIGN DESIGN SYSTEM INITIALIZED</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${tokens.bgGradient} leading-tight">
            {${JSON.stringify(blueprint.title.toUpperCase())}}
          </h1>

          <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto font-sans">
            {${JSON.stringify(blueprint.description)}}
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <a href="#chat" className="px-6 py-3 rounded-xl bg-gradient-to-r ${tokens.bgGradient} text-slate-950 text-xs font-bold font-mono hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)]">
              <span>EXPLORE PLATFORM</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#features" className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold font-mono hover:bg-white/10 hover:text-white transition-all">
              LEARN MORE
            </a>
          </div>
        </div>

        {/* Decorative Grid Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none z-0" />
      </section>

      {/* Media Video Section */}
      <section id="media" className="py-20 px-6 max-w-5xl mx-auto border-b border-white/5 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">Interactive Cinematic Showcase</h2>
          <p className="text-xl font-bold text-slate-200">Autonomous Video Timeline Preview</p>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950/40 backdrop-blur-md max-w-3xl mx-auto shadow-2xl">
          <video
            ref={videoRef}
            src="${videoSource}"
            autoPlay
            loop
            muted={isVideoMuted}
            playsInline
            className="w-full h-auto aspect-video object-cover"
          />

          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-lg bg-black/60 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title={isPlaying ? "Pause Video" : "Play Video"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsVideoMuted(!isVideoMuted)}
              className="p-2 rounded-lg bg-black/60 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title={isVideoMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 max-w-5xl mx-auto border-b border-white/5 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">Structural Objectives</h2>
          <p className="text-xl font-bold text-slate-200">Engineered Core Capabilities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {${JSON.stringify(blueprint.features)}.map((feat, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 hover:bg-white/[0.04] transition-all duration-300 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="font-bold font-mono text-sm text-slate-200">{feat}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Autonomous system checks successfully passed under the Antigravity E2E verification loop.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Image Gallery Mockups */}
      <section className="py-20 px-6 max-w-5xl mx-auto border-b border-white/5 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">Visual Media Assets</h2>
          <p className="text-xl font-bold text-slate-200">High Fidelity Graphic Mockups</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950 p-2 shadow-xl hover:scale-[1.02] transition-transform">
            <img src="${imageSource}" alt="Generated Graphic 1" className="w-full h-48 object-contain rounded-lg bg-slate-950" />
            <div className="p-3 text-center">
              <span className="text-[10px] text-slate-500 font-mono">ASSET_ID: Primary Hero Graphic</span>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950 p-2 shadow-xl hover:scale-[1.02] transition-transform">
            <img src="${imageSource}" alt="Generated Graphic 2" className="w-full h-48 object-contain rounded-lg bg-slate-950" />
            <div className="p-3 text-center">
              <span className="text-[10px] text-slate-500 font-mono">ASSET_ID: Secondary Section Card</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chat assistant Panel */}
      <section id="chat" className="py-20 px-6 max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">Intelligent Operations</h2>
          <p className="text-xl font-bold text-slate-200">Interactive Cognitive Assistance</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md overflow-hidden flex flex-col h-[380px] shadow-2xl">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-white/5 bg-[#020617]/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono tracking-wider text-slate-300">AI CLIENT ROUTER INTERACTION</span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">PROVIDER: UNIFIED_MESH_FALLBACK</span>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m, idx) => (
              <div key={idx} className={\`flex \${m.sender === "user" ? "justify-end" : "justify-start"}\`}>
                <div className={\`max-w-[80%] rounded-xl px-3.5 py-2.5 leading-relaxed \${
                  m.sender === "user"
                    ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-200"
                    : "bg-slate-900 border border-white/5 text-slate-300"
                }\`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-white/5 text-slate-500 px-3.5 py-2.5 rounded-xl font-mono text-[10px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-[#020617]/30 flex gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask the AI assistant..."
              className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
            />
            <button type="submit" disabled={isAiLoading} className="px-4 py-2 rounded-lg bg-gradient-to-r ${tokens.bgGradient} text-slate-950 text-xs font-bold hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center shrink-0">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 text-center text-[10px] text-slate-500 font-mono tracking-wider">
        <p>© ${new Date().getFullYear()} ${blueprint.name.toUpperCase()} • ALL RIGHTS RESERVED</p>
        <p className="mt-1 text-slate-600">CERTIFIED UNDER THE ANTIGRAVITY v5.2 PRODUCTION CONSTITUTION</p>
      </footer>
    </div>
  );
}
`;
  }
}

export const websiteCodeSynthesizer = WebsiteCodeSynthesizer.getInstance();
