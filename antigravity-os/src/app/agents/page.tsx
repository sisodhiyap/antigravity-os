"use client";

import React from "react";
import { useSystemStore } from "@/stores/useSystemStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { ProgressBar } from "@/ui/ProgressBar";
import { Users, Bot, Zap, Shield, PlayCircle, Layers, CheckCircle2, Flame } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function AgentsPage() {
  const { telemetry } = useSystemStore();

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-cyber-purple/30 shadow-glow-purple/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Users className="w-5 h-5 text-cyber-purple" />
            <span>AUTONOMOUS 10-ROLE SWARM AGENT HUB</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Strict separation of concerns, isolated read/write permission tiers, and automated multi-agent parallelization.
          </p>
        </div>

        <div className="flex gap-2">
          <Badge variant="purple" dot className="py-1 px-3 text-xs">
            10 ROLES CONFIGURED
          </Badge>
          <Badge variant="neon" dot className="py-1 px-3 text-xs">
            ZERO SECRET EXPOSURE
          </Badge>
        </div>
      </div>

      {/* Agents Detailed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {telemetry.agents.map((agent) => (
          <Card key={agent.id} glow="purple" className="space-y-3">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyber-purple/15 border border-cyber-purple/30 flex items-center justify-center text-cyber-purple">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm">{agent.role}</CardTitle>
                  <span className="text-[10px] text-slate-500">ID: {agent.id}</span>
                </div>
              </div>
              <Badge
                variant={agent.status === "running" ? "neon" : agent.status === "evaluating" ? "purple" : "default"}
                dot
              >
                {agent.status.toUpperCase()}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <div className="bg-slate-950/70 p-3 rounded-lg border border-white/5 space-y-1.5 text-xs">
                <div className="text-slate-400 text-[10px] uppercase">Current Active Mission:</div>
                <div className="text-slate-200 font-semibold">{agent.currentTask}</div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-900/60 p-2 rounded border border-white/5">
                  <span className="text-[9px] text-slate-500 block">MODEL</span>
                  <span className="text-cyber-cyan font-bold truncate block">{agent.activeModel}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded border border-white/5">
                  <span className="text-[9px] text-slate-500 block">TOKENS</span>
                  <span className="text-cyber-neon font-bold">{formatNumber(agent.tokensConsumed)}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded border border-white/5">
                  <span className="text-[9px] text-slate-500 block">LAST SEEN</span>
                  <span className="text-slate-300">{agent.lastActive}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>PROGRESS</span>
                  <span className="text-slate-200 font-bold">{agent.progressPercent}%</span>
                </div>
                <ProgressBar
                  value={agent.progressPercent}
                  color={agent.status === "running" ? "neon" : "purple"}
                  size="sm"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
