"use client";

import React from "react";
import { clsx } from "clsx";
import { Clock, Radio, PlayCircle, ShieldCheck, Cpu, Factory, Image as ImageIcon, Terminal } from "lucide-react";
import { MissionCard } from "@/components/ui/MissionCard";

export interface ActivityEvent {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  badge?: string;
  status?: "success" | "info" | "warning" | "error";
}

export interface LiveActivityProps {
  events?: ActivityEvent[];
  className?: string;
  onClear?: () => void;
}

export const LiveActivity: React.FC<LiveActivityProps> = ({
  events = [],
  className,
}) => {
  const defaultEvents: ActivityEvent[] = [
    {
      id: "ev-1",
      timestamp: "09:41:22",
      source: "AI Router",
      message: "Selected Ollama (qwen2.5-coder:7b) for routine synthesis",
      badge: "FAST_LOCAL",
      status: "success",
    },
    {
      id: "ev-2",
      timestamp: "09:41:24",
      source: "Website Factory",
      message: "Architectural blueprint synthesized and AST-validated",
      badge: "BLUEPRINT",
      status: "info",
    },
    {
      id: "ev-3",
      timestamp: "09:41:29",
      source: "QA Engine",
      message: "Responsive multi-viewport audit passed (375px–1920px)",
      badge: "100% WCAG",
      status: "success",
    },
    {
      id: "ev-4",
      timestamp: "09:41:31",
      source: "Media Studio",
      message: "Hero visual asset rendered via local deterministic engine",
      badge: "ASSET_GEN",
      status: "info",
    },
  ];

  const displayEvents = events.length > 0 ? events : defaultEvents;

  const getSourceIcon = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes("router") || s.includes("ai")) return <Cpu className="w-3.5 h-3.5" />;
    if (s.includes("factory") || s.includes("website")) return <Factory className="w-3.5 h-3.5" />;
    if (s.includes("qa") || s.includes("security")) return <ShieldCheck className="w-3.5 h-3.5" />;
    if (s.includes("media") || s.includes("asset")) return <ImageIcon className="w-3.5 h-3.5" />;
    return <Terminal className="w-3.5 h-3.5" />;
  };

  return (
    <MissionCard
      title="Live Operations Stream"
      description="Chronological log of kernel events, agent decisions, and tool executions"
      icon={<Radio className="w-4 h-4" />}
      status={
        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--ag-success)] bg-[var(--ag-success-bg)] px-2 py-0.5 rounded-full border border-[var(--ag-success)]/25">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--ag-success)] animate-pulse" />
          REAL-TIME TELEMETRY
        </span>
      }
      className={clsx("space-y-3", className)}
    >
      {displayEvents.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <Clock className="w-8 h-8 mx-auto text-[var(--ag-muted)] opacity-50" />
          <p className="text-sm font-semibold text-[var(--ag-text)]">Awaiting mission activity</p>
          <p className="text-xs text-[var(--ag-muted)]">Execute a command from the Universal Command Bar above.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 font-mono text-xs">
          {displayEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-2.5 rounded-lg bg-[var(--ag-elevated)] border border-[var(--ag-border)] flex items-start justify-between gap-3 hover:border-[var(--ag-gold)]/30 transition-colors"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="text-[10px] text-[var(--ag-muted)] tabular-nums shrink-0 mt-0.5">
                  {ev.timestamp}
                </span>
                <span className="text-[var(--ag-gold)] shrink-0 mt-0.5">
                  {getSourceIcon(ev.source)}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--ag-text)]">{ev.source}</span>
                    {ev.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--ag-surface)] text-[var(--ag-gold)] border border-[var(--ag-gold)]/20">
                        {ev.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--ag-text-sec)] truncate mt-0.5">
                    {ev.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </MissionCard>
  );
};
