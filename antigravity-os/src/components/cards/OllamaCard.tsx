"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { Bot, Sparkles, Terminal, Activity, CheckCircle2 } from "lucide-react";
import { OllamaMetric } from "@/types/telemetry";

interface OllamaCardProps {
  ollama: OllamaMetric;
}

export const OllamaCard: React.FC<OllamaCardProps> = ({ ollama }) => {
  return (
    <Card glow="cyan">
      <CardHeader>
        <CardTitle>
          <Bot className="w-4 h-4 text-cyber-cyan" />
          <span>LOCAL OLLAMA INFERENCE</span>
        </CardTitle>
        <Badge variant="neon" dot>
          PORT :{ollama.port} ONLINE
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Active Model Spotlight */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-cyber-cyan/30 shadow-glow-cyan/20">
          <div className="flex justify-between items-start mb-1.5">
            <div>
              <div className="text-[10px] font-mono text-slate-400">ACTIVE PRIMARY MODEL</div>
              <div className="text-sm font-bold text-cyber-cyan font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyber-neon" />
                {ollama.activeModel}
              </div>
            </div>
            <Badge variant="cyan" className="text-[10px]">
              Q4_K_M QUANT
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/5 text-[11px] font-mono">
            <div>
              <span className="text-slate-500 block text-[9px]">SPEED</span>
              <span className="text-cyber-neon font-bold">72.8 t/s</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">LATENCY</span>
              <span className="text-slate-200 font-bold">18.4 ms</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">CONTEXT</span>
              <span className="text-cyber-purple font-bold">32K TOKENS</span>
            </div>
          </div>
        </div>

        {/* Loaded / Standby Model Table */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono text-slate-400 flex justify-between">
            <span>LOCAL MODEL REPOSITORY</span>
            <span>{ollama.loadedModels.length} MODELS</span>
          </div>

          <div className="space-y-1">
            {ollama.loadedModels.map((m) => (
              <div
                key={m.name}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-white/5 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  {m.status === "active" ? (
                    <span className="w-2 h-2 rounded-full bg-cyber-neon animate-pulse" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-600" />
                  )}
                  <span className="text-slate-200 font-semibold">{m.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[10px]">{m.sizeGb} GB</span>
                  <Badge
                    variant={m.status === "active" ? "neon" : "default"}
                    className="text-[9px] px-1.5 py-0"
                  >
                    {m.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-900/40 p-2 rounded-lg border border-white/5">
          <span>TOTAL LOCAL INFERENCES</span>
          <span className="text-cyber-cyan font-bold">{ollama.totalInferenceCount.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};
