"use client";

import React, { useState } from "react";
import {
  FileCode2,
  Brain,
  Plus,
  Trash2,
  Edit3,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Layers,
  Database,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";

export default function FilesAndMemoryPage() {
  const [memories, setMemories] = useState<any[]>([
    {
      id: "mem-01",
      category: "ARCHITECTURE",
      title: "3-Tier Local AI Mesh Routing Policy",
      content: "All fast coding routes to Ollama; complex 32B models route to AirLLM with >4GB host RAM guard; cloud fallback routes to OpenRouter free tier.",
      updatedAt: "2026-08-25T05:00:00Z",
    },
    {
      id: "mem-02",
      category: "CONVENTION",
      title: "TypeScript Zero-Any Strict Policy",
      content: "All codebase files must pass strict TypeScript type compilation without 'any' overrides. Next.js 15 App Router standard.",
      updatedAt: "2026-08-24T22:30:00Z",
    },
    {
      id: "mem-03",
      category: "SECURITY",
      title: "Secret Shielding & Non-Disclosure",
      content: "No API keys, session tokens, or private environment variables may ever be logged to audit tables or exposed in responses.",
      updatedAt: "2026-08-24T20:15:00Z",
    },
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("ARCHITECTURE");
  const [newContent, setNewContent] = useState("");

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    setMemories([
      ...memories,
      {
        id: `mem-${Date.now()}`,
        category: newCategory,
        title: newTitle,
        content: newContent,
        updatedAt: new Date().toISOString(),
      },
    ]);

    setNewTitle("");
    setNewContent("");
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(memories.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6 font-mono text-slate-100">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-cyber-cyan/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-glow-cyan/20">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800 flex items-center justify-center text-blue-400 shadow-glow-cyan">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>FILES & PROJECT MEMORY</span>
              <Badge variant="cyan">CONTEXT ENGINE</Badge>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Architecture Decisions • Code Conventions • Intelligent Context Selection (Zero Secret Storage)
            </p>
          </div>
        </div>
      </div>

      {/* CONTEXT ENGINE & RELEVANCE INSPECTOR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 block">PROJECT FILES INDEXED</span>
          <div className="text-lg font-bold text-cyber-cyan">148 Source Files</div>
          <span className="text-[10px] text-slate-400">AST & Dependency Map Active</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 block">AVERAGE CONTEXT WINDOW</span>
          <div className="text-lg font-bold text-slate-100">820 Tokens / Request</div>
          <span className="text-[10px] text-emerald-400">Intelligent Slicing (Not Full Repo Dump)</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 block">SECURITY SHIELDING</span>
          <div className="text-lg font-bold text-emerald-400">ENFORCED (0 Secrets)</div>
          <span className="text-[10px] text-slate-400">All .env & Credentials Scrubbed</span>
        </div>
      </div>

      {/* MEMORY STORE MANAGER */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ADD MEMORY FORM */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyber-cyan" />
              <span>Record Project Decision / Memory</span>
            </h2>
          </div>

          <form onSubmit={handleAddMemory} className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Category:</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl p-2.5 outline-none focus:border-cyber-cyan font-mono"
              >
                <option value="ARCHITECTURE">ARCHITECTURE DECISION</option>
                <option value="CONVENTION">PROJECT CONVENTION</option>
                <option value="PREFERENCE">USER PREFERENCE</option>
                <option value="SECURITY">SECURITY DIRECTIVE</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Title:</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Always use Tailwind HSL variables"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl p-2.5 outline-none focus:border-cyber-cyan font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Details / Context:</label>
              <textarea
                rows={3}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Provide rationale and guidelines..."
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl p-2.5 outline-none focus:border-cyber-cyan font-mono resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-glow-cyan"
            >
              <Plus className="w-4 h-4" />
              <span>Commit Memory to Project Brain</span>
            </button>
          </form>
        </div>

        {/* ACTIVE PROJECT MEMORIES LIST */}
        <div className="xl:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold text-slate-200">Active Project Memories & Directives</h2>
            <Badge variant="cyan">{memories.length} STORED</Badge>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto">
            {memories.map((mem) => (
              <div key={mem.id} className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant={mem.category === "SECURITY" ? "purple" : "cyan"} className="text-[10px]">
                      {mem.category}
                    </Badge>
                    <span className="font-bold text-slate-200">{mem.title}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteMemory(mem.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-300 font-sans text-xs">{mem.content}</p>
                <div className="text-[10px] text-slate-500">
                  Last updated: {new Date(mem.updatedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
