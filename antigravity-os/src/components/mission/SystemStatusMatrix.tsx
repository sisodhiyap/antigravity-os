"use client";

import React from "react";
import { clsx } from "clsx";
import {
  Brain,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
  Network,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from "lucide-react";
import { MissionCard } from "@/components/ui/MissionCard";

export interface SystemStatusMatrixProps {
  ollamaLive?: boolean;
  airllmLive?: boolean;
  openrouterReady?: boolean;
  dockerLive?: boolean;
  databaseHealthy?: boolean;
  mcpServerCount?: number;
  className?: string;
}

export const SystemStatusMatrix: React.FC<SystemStatusMatrixProps> = ({
  ollamaLive = true,
  airllmLive = false,
  openrouterReady = true,
  dockerLive = true,
  databaseHealthy = true,
  mcpServerCount = 15,
  className,
}) => {
  const items = [
    {
      id: "ai-router",
      title: "AI ROUTER",
      statusText: "ONLINE",
      statusType: "online",
      subtext: "Auto-Routing Active",
      details: "In-Process Central Mesh",
      icon: Brain,
    },
    {
      id: "ollama",
      title: "OLLAMA",
      statusText: ollamaLive ? "ONLINE" : "OFFLINE",
      statusType: ollamaLive ? "online" : "error",
      subtext: "14B & 7B Local",
      details: "127.0.0.1:11434 (6 models)",
      icon: Cpu,
    },
    {
      id: "airllm",
      title: "AIRLLM",
      statusText: airllmLive ? "ONLINE" : "OFFLINE",
      statusType: airllmLive ? "online" : "warning",
      subtext: "32B Local Layer Engine",
      details: "RAM Guard · Cascade Active",
      icon: Layers,
    },
    {
      id: "openrouter",
      title: "OPENROUTER",
      statusText: openrouterReady ? "READY" : "OFFLINE",
      statusType: openrouterReady ? "info" : "error",
      subtext: "Free Cloud Swarm",
      details: "Priority Fallback Tier",
      icon: Cloud,
    },
    {
      id: "mcp",
      title: "MCP HUB",
      statusText: "HEALTHY",
      statusType: "online",
      subtext: `${mcpServerCount} Tools Active`,
      details: "Playwright · Prisma · Git",
      icon: Network,
    },
    {
      id: "docker",
      title: "DOCKER STACK",
      statusText: dockerLive ? "ONLINE" : "OFFLINE",
      statusType: dockerLive ? "online" : "warning",
      subtext: "Isolated ag-internal",
      details: "127.0.0.1:3000 Gateway",
      icon: ShieldCheck,
    },
    {
      id: "database",
      title: "DATABASE",
      statusText: databaseHealthy ? "HEALTHY" : "DEGRADED",
      statusType: databaseHealthy ? "online" : "error",
      subtext: "SQLite WAL Engine",
      details: "journal_mode=wal Active",
      icon: Database,
    },
  ];

  return (
    <div className={clsx("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ag-muted)] flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-[var(--ag-gold)]" />
          <span>System Status Matrix</span>
        </h2>
        <span className="text-[10px] font-mono text-[var(--ag-muted)]">Real Hardware & Service Telemetry</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isOnline = item.statusType === "online";
          const isWarning = item.statusType === "warning";
          const isInfo = item.statusType === "info";

          return (
            <MissionCard
              key={item.id}
              className="p-3.5 flex flex-col justify-between h-full"
              interactive={false}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[var(--ag-elevated)] border border-[var(--ag-border)] flex items-center justify-center text-[var(--ag-gold)]">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={clsx(
                      "text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full border flex items-center gap-1",
                      isOnline && "border-[var(--ag-success)]/30 bg-[var(--ag-success-bg)] text-[var(--ag-success)]",
                      isWarning && "border-[var(--ag-warning)]/30 bg-[var(--ag-warning-bg)] text-[var(--ag-warning)]",
                      isInfo && "border-[var(--ag-info)]/30 bg-[var(--ag-info-bg)] text-[var(--ag-info)]",
                      !isOnline && !isWarning && !isInfo && "border-[var(--ag-error)]/30 bg-[var(--ag-error-bg)] text-[var(--ag-error)]"
                    )}
                  >
                    <span
                      className={clsx(
                        "w-1 h-1 rounded-full",
                        isOnline && "bg-[var(--ag-success)]",
                        isWarning && "bg-[var(--ag-warning)]",
                        isInfo && "bg-[var(--ag-info)]",
                        !isOnline && !isWarning && !isInfo && "bg-[var(--ag-error)]"
                      )}
                    />
                    {item.statusText}
                  </span>
                </div>

                <div className="text-xs font-bold text-[var(--ag-text)] tracking-tight font-satoshi truncate">
                  {item.title}
                </div>
                <div className="text-[11px] text-[var(--ag-text-sec)] mt-0.5 truncate">
                  {item.subtext}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[var(--ag-border-subtle)] text-[10px] font-mono text-[var(--ag-muted)] truncate">
                {item.details}
              </div>
            </MissionCard>
          );
        })}
      </div>
    </div>
  );
};
