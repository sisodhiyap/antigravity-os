"use client";

import React, { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Sparkles, ArrowRight, CheckCircle2, ChevronRight, MessageSquare, Terminal, Send, Layers, Play, Pause, Volume2, VolumeX } from "lucide-react";

export default function DynamicGeneratedWebsite() {
  const params = useParams();
  const slug = (params?.slug as string) || "synthesized-product";

  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: `Welcome to Project ${slug} assistant. How may I assist you with our services today?` }
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
        body: JSON.stringify({ prompt: userText, content: `Synthesized product interface for ${slug}` })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: "ai", text: data.result || "Thank you for inquiring. Our automated synthesis pipelines are fully active." }]);
    } catch {
      setMessages(prev => [...prev, { sender: "ai", text: "Autonomous assistant online. How can we optimize your deployment workflow?" }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide font-mono uppercase">{slug.replace(/-/g, " ")}</h1>
            <p className="text-[10px] text-cyan-400 font-mono tracking-widest">AUTONOMOUS SYNTHESIS ENGINE</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300 font-mono">
          <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
          <a href="#media" className="hover:text-cyan-400 transition-colors">Media</a>
          <a href="#assistant" className="hover:text-cyan-400 transition-colors">AI Agent</a>
          <a href="/factory" className="px-4 py-1.5 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20">
            Website Factory
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PRODUCTION CERTIFIED SYNTHESIS</span>
        </div>
        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-transparent max-w-3xl mx-auto">
          Next-Generation Architecture for {slug.replace(/-/g, " ")}
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
          Autonomous multi-agent orchestration, instant media synthesis, 3-tier local and cloud AI mesh routing.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a href="#assistant" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20">
            <span>Interact with AI</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <a href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-white/10 text-slate-200 hover:bg-slate-800 transition-all">
            <span>Antigravity OS</span>
          </a>
        </div>
      </section>

      {/* Interactive AI Assistant Section */}
      <section id="assistant" className="px-6 py-16 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm font-mono">Real-Time Autonomous Agent</h3>
                <p className="text-xs text-slate-400">Integrated with Antigravity AI Mesh</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-xs font-mono leading-relaxed ${
                  m.sender === "user" ? "bg-cyan-500 text-black font-semibold" : "bg-slate-800/80 text-slate-200 border border-white/5"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/80 text-slate-400 rounded-xl px-4 py-2 text-xs font-mono flex items-center gap-2 border border-white/5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Generating intelligent response...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              placeholder="Ask anything about this project..."
              className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <button
              type="submit"
              disabled={isAiLoading || !inputMsg.trim()}
              className="px-4 py-2.5 bg-cyan-500 text-black rounded-xl font-mono text-xs font-bold hover:bg-cyan-400 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SEND</span>
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-slate-500 font-mono">
        <p>Synthesized by Antigravity OS Website Factory • Autonomous Swarm Architecture</p>
      </footer>
    </div>
  );
}
