"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Terminal,
  Cpu,
  Zap,
  Users,
  Network,
  Settings,
  Layers,
  Sparkles,
  X,
  Play,
  RotateCcw,
  Globe,
  Image,
  Video,
  Music,
  Rocket,
  Wrench,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { useTerminalStore } from "@/stores/useTerminalStore";

export const CommandPalette: React.FC = () => {
  const router = useRouter();
  const { isCommandPaletteOpen, setCommandPaletteOpen, telemetry } = useSystemStore();
  const { executeCommand } = useTerminalStore();
  const [query, setQuery] = useState("");
  const [aiMode, setAiMode] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
        setAiMode(false);
        setAiResult(null);
      }
    };
    if (isCommandPaletteOpen) {
      window.addEventListener("keydown", handleKeyDown);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  const runAiCommand = async (cmd: string) => {
    setIsAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/orchestrate/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      const json = await res.json();
      if (json.success) {
        setAiResult(`✓ ${json.data?.action ?? json.intent} (${json.latencyMs}ms)`);
      } else {
        setAiResult(`✗ ${json.error}`);
      }
    } catch (err: any) {
      setAiResult(`✗ ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!isCommandPaletteOpen) return null;

  const actions = [
    // ── Navigation ──────────────────────────────────────────
    { label: "Navigate: System Overview Dashboard", category: "Navigation", icon: Layers, action: () => { router.push("/"); setCommandPaletteOpen(false); } },
    { label: "Navigate: Swarm Agent Hub", category: "Navigation", icon: Users, action: () => { router.push("/agents"); setCommandPaletteOpen(false); } },
    { label: "Navigate: MCP Tool Registry", category: "Navigation", icon: Network, action: () => { router.push("/mcp"); setCommandPaletteOpen(false); } },
    { label: "Navigate: Interactive OS Terminal", category: "Navigation", icon: Terminal, action: () => { router.push("/terminal"); setCommandPaletteOpen(false); } },
    { label: "Navigate: Product Factory", category: "Navigation", icon: Cpu, action: () => { router.push("/factory"); setCommandPaletteOpen(false); } },
    { label: "Navigate: Creative Studio (Omnicraft)", category: "Navigation", icon: Sparkles, action: () => { router.push("/omnicraft"); setCommandPaletteOpen(false); } },
    { label: "Navigate: Projects", category: "Navigation", icon: Layers, action: () => { router.push("/projects"); setCommandPaletteOpen(false); } },
    { label: "Navigate: Todo + Notes", category: "Navigation", icon: CheckCircle2, action: () => { router.push("/todo-notes"); setCommandPaletteOpen(false); } },
    { label: "Navigate: Settings", category: "Navigation", icon: Settings, action: () => { router.push("/settings"); setCommandPaletteOpen(false); } },
    // ── AI Commands ──────────────────────────────────────────
    { label: "AI: Build me a portfolio website", category: "AI", icon: Globe, action: () => { setAiMode(true); setQuery("Build me a portfolio website"); runAiCommand("Build me a portfolio website"); } },
    { label: "AI: Generate hero image", category: "AI", icon: Image, action: () => { setAiMode(true); setQuery("Generate a hero image for my site"); runAiCommand("Generate a hero image for my site"); } },
    { label: "AI: Generate cinematic video", category: "AI", icon: Video, action: () => { setAiMode(true); setQuery("Generate a cinematic hero video"); runAiCommand("Generate a cinematic hero video"); } },
    { label: "AI: Generate voiceover audio", category: "AI", icon: Music, action: () => { setAiMode(true); setQuery("Generate voiceover audio"); runAiCommand("Generate voiceover audio"); } },
    { label: "AI: Deploy to Vercel", category: "AI", icon: Rocket, action: () => { setAiMode(true); setQuery("Deploy to Vercel"); runAiCommand("Deploy to Vercel"); } },
    { label: "AI: Fix all errors", category: "AI", icon: Wrench, action: () => { setAiMode(true); setQuery("Fix all errors"); runAiCommand("Fix all errors"); } },
    // ── Dev Commands ──────────────────────────────────────────
    { label: "Run: Playwright E2E QA", category: "Dev", icon: Play, action: () => { executeCommand("test"); setCommandPaletteOpen(false); } },
    { label: "Run: Ollama GPU Inference Latency", category: "Dev", icon: Zap, action: () => { executeCommand("gpu"); setCommandPaletteOpen(false); } },
    { label: "Run: Swarm Roster Status Audit", category: "Dev", icon: RotateCcw, action: () => { executeCommand("swarm"); setCommandPaletteOpen(false); } },
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl glass-panel rounded-2xl border border-cyber-cyan/40 shadow-glow-cyan overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search / AI input header */}
        <div className="p-3.5 border-b border-white/10 flex items-center gap-3 bg-slate-950/90">
          {isAiLoading ? <Loader2 className="w-4 h-4 text-cyber-cyan animate-spin shrink-0" /> : <Search className="w-4 h-4 text-cyber-cyan shrink-0" />}
          <input
            ref={inputRef}
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && query.trim()) { setAiMode(true); runAiCommand(query); } }}
            placeholder='Search commands, pages, or type an AI request + Enter'
            className="w-full bg-transparent font-mono text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => { setCommandPaletteOpen(false); setAiMode(false); setAiResult(null); }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Result */}
        {aiMode && (
          <div className="px-4 py-3 bg-slate-950/80 border-b border-white/5">
            {isAiLoading ? (
              <p className="text-xs font-mono text-slate-400 animate-pulse">Executing: &quot;{query}&quot;...</p>
            ) : aiResult ? (
              <p className={`text-xs font-mono ${aiResult.startsWith("✓") ? "text-emerald-400" : "text-red-400"}`}>{aiResult}</p>
            ) : null}
          </div>
        )}

        {/* Action list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 font-mono text-xs bg-slate-950/70">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-slate-500">No matching commands found.</div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-cyber-cyan/15 hover:border-cyber-cyan/30 text-left border border-transparent transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-cyber-cyan transition-colors" />
                    <span className="text-slate-200 group-hover:text-white font-medium">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider group-hover:text-cyber-cyan">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-950/95 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500 px-4">
          <span>ANTIGRAVITY OS v5.1 — COMMAND INTERFACE</span>
          <span>↵ Execute AI • ESC Close</span>
        </div>
      </div>
    </div>
  );
};
