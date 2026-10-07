"use client";

import React, { useState } from "react";
import {
  Users, Brain, Shield, Code2, Search,
  Video, Briefcase, Palette, Rocket, Play, Pause, Square, RotateCcw,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, StatusBadge } from "@/components/ui/DesignSystem";
import { Button } from "@/components/ui/Button";
import { clsx } from "clsx";

type AgentStatus = "idle" | "running" | "paused" | "complete" | "error";

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  status: AgentStatus;
  model: string;
  currentTask: string | null;
  latency: string | null;
}

const AGENTS: Agent[] = [
  { id: "pm",       name: "Product Manager",   role: "Strategy & Scope",   icon: Briefcase, status: "idle", model: "OpenRouter/GPT-4o",  currentTask: null, latency: null },
  { id: "ux",       name: "UX Designer",        role: "Wireframes & Flow",  icon: Palette,   status: "idle", model: "Ollama/Qwen2.5",     currentTask: null, latency: null },
  { id: "arch",     name: "Architect",           role: "System Design",      icon: Brain,     status: "idle", model: "AirLLM/Qwen3-32B",   currentTask: null, latency: null },
  { id: "builder",  name: "Builder",             role: "Code Generation",    icon: Code2,     status: "idle", model: "Ollama/CodeLlama",   currentTask: null, latency: null },
  { id: "qa",       name: "QA Engineer",         role: "Testing & Auditing", icon: Shield,    status: "idle", model: "Ollama/Qwen2.5",     currentTask: null, latency: null },
  { id: "sec",      name: "Security Engineer",   role: "Vulnerability Scan", icon: Shield,    status: "idle", model: "AirLLM/Qwen3-32B",   currentTask: null, latency: null },
  { id: "devops",   name: "DevOps Engineer",     role: "Deploy & Docker",    icon: Rocket,    status: "idle", model: "Ollama/Mistral",     currentTask: null, latency: null },
  { id: "creative", name: "Creative Director",   role: "Visual Direction",   icon: Palette,   status: "idle", model: "OpenRouter/Claude",  currentTask: null, latency: null },
  { id: "video",    name: "Video Producer",      role: "Scene Generation",   icon: Video,     status: "idle", model: "OpenRouter/GPT-4V",  currentTask: null, latency: null },
  { id: "research", name: "Researcher",          role: "Context & Analysis", icon: Search,    status: "idle", model: "Ollama/Qwen2.5",     currentTask: null, latency: null },
];

const STATUS_MAP: Record<AgentStatus, { variant: any; label: string }> = {
  idle:     { variant: "simulation", label: "IDLE"    },
  running:  { variant: "info",       label: "RUNNING" },
  paused:   { variant: "degraded",   label: "PAUSED"  },
  complete: { variant: "online",     label: "DONE"    },
  error:    { variant: "offline",    label: "ERROR"   },
};

export default function AgentCommandCenterPage() {
  const [agents, setAgents] = useState<Agent[]>(AGENTS);

  function setAgentStatus(id: string, status: AgentStatus) {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              currentTask: status === "running" ? "Processing assigned task..." : null,
              latency: status === "running" ? `${Math.floor(Math.random() * 300 + 50)}ms` : null,
            }
          : a
      )
    );
  }

  return (
    <AppShell>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[var(--ag-text)] font-satoshi">Agent Command Center</h1>
        <p className="text-sm text-[var(--ag-text-sec)]">
          Manage the 10-role autonomous engineering swarm
        </p>
      </div>

      {/* Summary Bar */}
      <div className="flex flex-wrap gap-3">
        {(["idle", "running", "paused", "complete", "error"] as AgentStatus[]).map((s) => {
          const count = agents.filter((a) => a.status === s).length;
          if (!count) return null;
          const sb = STATUS_MAP[s];
          return (
            <div key={s} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--ag-elevated)] border border-[var(--ag-border)]">
              <StatusBadge variant={sb.variant} label={`${count} ${sb.label}`} />
            </div>
          );
        })}
      </div>

      {/* Agent Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        role="list"
        aria-label="Agent cards"
      >
        {agents.map((agent) => {
          const Icon = agent.icon;
          const sb = STATUS_MAP[agent.status];
          return (
            <Card
              key={agent.id}
              role="listitem"
              className={clsx(
                "p-4 space-y-3 transition-all duration-200",
                agent.status === "running" && "border-[var(--ag-info)]/20 shadow-[0_0_20px_-8px_rgba(122,171,207,0.3)]"
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--ag-elevated)] border border-[var(--ag-border)] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[var(--ag-text-sec)]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[var(--ag-text)] leading-tight">{agent.name}</p>
                    <p className="text-[10px] text-[var(--ag-muted)]">{agent.role}</p>
                  </div>
                </div>
                <StatusBadge variant={sb.variant} label={sb.label} pulse={agent.status === "running"} />
              </div>

              {/* Model */}
              <div className="text-[10px] text-[var(--ag-muted)] truncate">
                Model: <span className="text-[var(--ag-text-sec)]">{agent.model}</span>
              </div>

              {/* Current Task */}
              {agent.currentTask && (
                <p className="text-[11px] text-[var(--ag-text-sec)] leading-relaxed">{agent.currentTask}</p>
              )}
              {agent.latency && (
                <p className="text-[10px] text-[var(--ag-muted)]">Latency: {agent.latency}</p>
              )}

              {/* Controls */}
              <div className="flex gap-1.5 pt-1">
                <Button
                  size="sm"
                  variant={agent.status === "running" ? "ghost" : "primary"}
                  onClick={() => setAgentStatus(agent.id, agent.status === "running" ? "idle" : "running")}
                  icon={agent.status === "running" ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  className="flex-1"
                >
                  {agent.status === "running" ? "Stop" : "Run"}
                </Button>
                {agent.status === "running" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setAgentStatus(agent.id, "paused")}
                    icon={<Pause className="w-3 h-3" />}
                  >
                    Pause
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAgentStatus(agent.id, "idle")}
                  icon={<RotateCcw className="w-3 h-3" />}
                  aria-label="Reset agent"
                />
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
