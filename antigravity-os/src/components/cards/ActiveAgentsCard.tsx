"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { ProgressBar } from "@/ui/ProgressBar";
import { Users, Cpu, ShieldCheck, Palette, Video, BarChart2, Wrench, CheckCircle } from "lucide-react";
import { AgentMetric } from "@/types/telemetry";

interface ActiveAgentsCardProps {
  agents: AgentMetric[];
}

export const ActiveAgentsCard: React.FC<ActiveAgentsCardProps> = ({ agents }) => {
  const activeCount = agents.filter((a) => a.status === "running" || a.status === "evaluating").length;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Product Manager":
        return <CheckCircle className="w-3.5 h-3.5 text-cyber-cyan" />;
      case "UX Designer":
        return <Palette className="w-3.5 h-3.5 text-cyber-pink" />;
      case "Architect":
        return <Cpu className="w-3.5 h-3.5 text-cyber-purple" />;
      case "Builder":
        return <Wrench className="w-3.5 h-3.5 text-cyber-neon" />;
      case "QA Engineer":
        return <ShieldCheck className="w-3.5 h-3.5 text-cyber-amber" />;
      case "Security Engineer":
        return <ShieldCheck className="w-3.5 h-3.5 text-red-400" />;
      case "Creative Director":
        return <Palette className="w-3.5 h-3.5 text-cyber-pink" />;
      case "Video Producer":
        return <Video className="w-3.5 h-3.5 text-cyber-cyan" />;
      case "Stock Researcher":
        return <BarChart2 className="w-3.5 h-3.5 text-cyber-neon" />;
      default:
        return <Users className="w-3.5 h-3.5 text-slate-300" />;
    }
  };

  const getStatusBadge = (status: AgentMetric["status"]) => {
    switch (status) {
      case "running":
        return <Badge variant="neon" dot className="text-[9px] px-1.5 py-0">RUNNING</Badge>;
      case "evaluating":
        return <Badge variant="purple" dot className="text-[9px] px-1.5 py-0">REASONING</Badge>;
      case "idle":
        return <Badge variant="default" className="text-[9px] px-1.5 py-0">STANDBY</Badge>;
      default:
        return <Badge variant="default" className="text-[9px] px-1.5 py-0">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <Card glow="purple" className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>
          <Users className="w-4 h-4 text-cyber-purple" />
          <span>AUTONOMOUS SWARM AGENT ROSTER</span>
        </CardTitle>
        <Badge variant="purple" dot>
          {activeCount} / {agents.length} AGENTS ACTIVE
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-slate-950/70 p-3 rounded-xl border border-white/5 hover:border-cyber-purple/40 transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {getRoleIcon(agent.role)}
                  <span className="text-xs font-bold font-mono text-slate-200">{agent.role}</span>
                </div>
                {getStatusBadge(agent.status)}
              </div>

              <div className="text-[11px] text-slate-400 truncate mb-2 font-mono">
                {agent.currentTask}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>MODEL: <span className="text-slate-300 font-semibold">{agent.activeModel}</span></span>
                  <span>{agent.progressPercent}%</span>
                </div>
                <ProgressBar
                  value={agent.progressPercent}
                  color={agent.status === "running" ? "neon" : agent.status === "evaluating" ? "purple" : "cyan"}
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
