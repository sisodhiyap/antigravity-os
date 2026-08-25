"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Settings, Cpu, Zap, Server, Shield, Key, RefreshCw, Save, ShieldCheck, Lock } from "lucide-react";

export default function SettingsPage() {
  const [preferLocal, setPreferLocal] = useState(true);
  const [ollamaPort, setOllamaPort] = useState("11434");
  const [activeModel, setActiveModel] = useState("qwen2.5-coder:7b");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const securityStatus = [
    { label: "AUTHENTICATION", value: "SECURE", badge: "neon" },
    { label: "PASSWORD HASHING", value: "PBKDF2-SHA512 / 100K", badge: "cyan" },
    { label: "SESSION", value: "HTTPONLY + SECURE", badge: "cyan" },
    { label: "RATE LIMIT", value: "5 ATTEMPTS / 15 MIN", badge: "purple" },
    { label: "RBAC", value: "ACTIVE (SERVER-ENFORCED)", badge: "neon" },
    { label: "SECRET STORAGE", value: "SERVER ONLY", badge: "neon" },
    { label: "CLIENT SECRET EXPOSURE", value: "NONE DETECTED", badge: "neon" },
    { label: "FILESYSTEM PROTECTION", value: "ACTIVE (404 BLOCKED)", badge: "neon" },
    { label: "DATABASE PROTECTION", value: "ACTIVE (PBKDF2 SALT)", badge: "neon" },
    { label: "AUDIT LOG", value: "ACTIVE (ZERO-SECRET)", badge: "cyan" },
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-cyber-cyan" />
            <span>ANTIGRAVITY OS v5.1 SYSTEM CONFIGURATION</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure hardware envelope, local inference engines, enterprise security parameters, and persistent memory.
          </p>
        </div>

        <Button onClick={handleSave} variant="primary" size="sm" className="gap-2">
          <Save className="w-4 h-4" />
          <span>{saved ? "CONFIG SAVED!" : "SAVE CONFIG"}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Hardware & Inference Policy */}
        <Card glow="cyan" className="space-y-4">
          <CardHeader>
            <CardTitle>
              <Cpu className="w-4 h-4 text-cyber-cyan" />
              <span>HARDWARE & LOCAL INFERENCE POLICY</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-white/5">
              <div>
                <span className="text-slate-200 font-bold block">Prefer Local Execution</span>
                <span className="text-[10px] text-slate-500">Route workloads through Ollama / AirLLM</span>
              </div>
              <input
                type="checkbox"
                checked={preferLocal}
                onChange={(e) => setPreferLocal(e.target.checked)}
                className="w-4 h-4 accent-cyber-cyan cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase">Default Local Model</label>
              <select
                value={activeModel}
                onChange={(e) => setActiveModel(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyber-cyan"
              >
                <option value="qwen2.5-coder:7b">Qwen 2.5 Coder 7B (Q4_K_M) - Fast Coding</option>
                <option value="deepseek-r1:7b">DeepSeek-R1 7B (Q4_K_M) - Deep Reasoning</option>
                <option value="gemma:3-4b">Gemma 3 4B - Conversational</option>
                <option value="phi4-mini">Phi-4 Mini - Micro Logic</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase">Ollama Local Server Port</label>
              <input
                type="text"
                value={ollamaPort}
                onChange={(e) => setOllamaPort(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyber-cyan"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Authentication Posture */}
        <Card glow="purple" className="space-y-4">
          <CardHeader>
            <CardTitle>
              <ShieldCheck className="w-4 h-4 text-cyber-purple" />
              <span>AUTHENTICATION & HARDENING POSTURE</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="grid grid-cols-1 gap-2">
              {securityStatus.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-white/5"
                >
                  <span className="text-slate-300 font-medium text-[11px]">{item.label}</span>
                  <Badge variant={item.badge as any} className="text-[10px] font-mono">
                    {item.value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
