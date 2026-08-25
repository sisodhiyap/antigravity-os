"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Terminal, Zap, Image, Video, Music, Globe, Rocket, Wrench, Cpu, X, Loader2, ChevronRight, Sparkles } from "lucide-react";

interface CommandResult {
  intent: string;
  action: string;
  latencyMs: number;
  data: Record<string, unknown>;
}

const QUICK_COMMANDS = [
  { icon: Globe, label: "Build website", command: "Build me a futuristic AI portfolio website", color: "text-cyan-400" },
  { icon: Image, label: "Generate image", command: "Generate a hero image for a tech startup", color: "text-violet-400" },
  { icon: Video, label: "Generate video", command: "Generate a cinematic hero video", color: "text-pink-400" },
  { icon: Music, label: "Generate audio", command: "Generate voiceover audio for my website", color: "text-emerald-400" },
  { icon: Rocket, label: "Deploy", command: "Deploy to Vercel", color: "text-orange-400" },
  { icon: Cpu, label: "Run certification", command: "Run complete certification audit", color: "text-yellow-400" },
  { icon: Wrench, label: "Fix errors", command: "Fix all errors in the codebase", color: "text-red-400" },
];

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToken?: string;
}

export function CommandBar({ isOpen, onClose, sessionToken }: CommandBarProps) {
  const [command, setCommand] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CommandResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setResult(null);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const executeCommand = useCallback(async (cmd: string) => {
    if (!cmd.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/orchestrate/command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({ command: cmd }),
      });
      const json = await res.json();
      if (json.success) {
        setResult({ intent: json.intent, action: json.data?.action ?? "Executed", latencyMs: json.latencyMs, data: json.data });
      } else {
        setError(json.error || "Command failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionToken]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(command);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-[#0a0f1e] border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(0,240,255,0.15)] overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="text-[10px] font-mono tracking-[0.2em] text-slate-400 uppercase">Antigravity Command Interface</span>
          <span className="ml-auto text-[9px] font-mono text-slate-600 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">⌘K</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder='Try: "Build me a portfolio website" or "Generate hero image"'
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-600 outline-none font-mono"
          />
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
          ) : (
            <button
              type="submit"
              disabled={!command.trim()}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold hover:bg-cyan-500/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span>EXECUTE</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </form>

        {/* Result */}
        {result && (
          <div className="px-4 py-4 border-b border-white/5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-mono text-emerald-400 tracking-wider">EXECUTED — {result.intent}</span>
              <span className="ml-auto text-[9px] font-mono text-slate-600">{result.latencyMs}ms</span>
            </div>
            <p className="text-xs text-slate-300 font-mono">{result.action}</p>
            {!!result.data?.url && (
              <a
                href={String(result.data.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Globe className="w-3 h-3" />
                {String(result.data.url)}
              </a>
            )}
            {!!result.data?.projectName && (
              <p className="text-[10px] font-mono text-slate-500">
                PROJECT: <span className="text-slate-300">{String(result.data.projectName)}</span>
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-xs text-red-400 font-mono">{error}</p>
          </div>
        )}

        {/* Quick commands */}
        {!result && !error && (
          <div className="p-4 space-y-1">
            <p className="text-[9px] font-mono text-slate-600 tracking-widest uppercase mb-3">Quick Commands</p>
            {QUICK_COMMANDS.map(({ icon: Icon, label, command: cmd, color }) => (
              <button
                key={cmd}
                onClick={() => { setCommand(cmd); executeCommand(cmd); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors text-left group"
              >
                <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
                <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors font-mono">{label}</span>
                <ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-slate-500 ml-auto transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
