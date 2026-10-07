"use client";

import React from "react";
import { clsx } from "clsx";
import { Cpu, Brain, Wifi, ArrowRight, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { MissionCard } from "@/components/ui/MissionCard";

export interface AIComputeFlowProps {
  activeTier?: "FAST_LOCAL" | "LOCAL_LARGE" | "CLOUD" | "VISION" | "LONG_CONTEXT";
  selectedProvider?: string;
  selectedModel?: string;
  latencyMs?: number;
  tokensUsed?: number;
  fallbackChain?: string[];
  isFallbackActive?: boolean;
  className?: string;
}

export const AIComputeFlow: React.FC<AIComputeFlowProps> = ({
  activeTier = "FAST_LOCAL",
  selectedProvider = "ollama",
  selectedModel = "qwen2.5-coder:7b",
  latencyMs = 32,
  tokensUsed = 75,
  fallbackChain = ["nvidia/nemotron-3.5-lightning:free", "airllm/Qwen/Qwen3-32B"],
  isFallbackActive = false,
  className,
}) => {
  const providers = [
    {
      id: "ollama",
      name: "Ollama",
      tier: "FAST_LOCAL",
      label: "FAST LOCAL",
      sub: "7B / 14B Qwen Coder",
      icon: Brain,
      isPrimary: selectedProvider.toLowerCase().includes("ollama"),
      status: "LIVE (30.7 tok/s)",
      statusType: "online",
    },
    {
      id: "airllm",
      name: "AirLLM",
      tier: "LOCAL_LARGE",
      label: "LARGE LOCAL",
      sub: "32B Layer Streaming",
      icon: Cpu,
      isPrimary: selectedProvider.toLowerCase().includes("airllm"),
      status: "SAFE FALLBACK",
      statusType: "warning",
    },
    {
      id: "openrouter",
      name: "OpenRouter",
      tier: "CLOUD",
      label: "CLOUD SWARM",
      sub: "Free Tier Mesh",
      icon: Wifi,
      isPrimary: selectedProvider.toLowerCase().includes("openrouter") || selectedProvider.toLowerCase().includes("nvidia"),
      status: "READY",
      statusType: "info",
    },
  ];

  return (
    <MissionCard
      title="AI Compute Routing Architecture"
      description="Intelligent multi-tier model selection with memory safety guards & zero-latency fallback"
      icon={<Zap className="w-4 h-4" />}
      status={
        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--ag-gold)] bg-[var(--ag-gold-alpha)] px-2 py-0.5 rounded-full border border-[var(--ag-gold)]/25">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--ag-gold)] animate-[status-pulse_2s_ease-in-out_infinite]" />
          AUTO-ROUTING ACTIVE
        </span>
      }
      className={clsx("space-y-4", className)}
    >
      {/* Visual Workflow Pipeline */}
      <div className="p-4 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)]">
        {/* Top: Flow Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-3 text-center">
          {/* Node 1: Request */}
          <div className="p-3 rounded-lg bg-[var(--ag-surface)] border border-[var(--ag-border)] flex flex-col items-center justify-center">
            <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--ag-muted)]">Step 1</span>
            <span className="text-xs font-bold text-[var(--ag-text)] mt-1">USER REQUEST</span>
            <span className="text-[10px] text-[var(--ag-text-sec)]">Code / Prompt / AST</span>
          </div>

          <div className="hidden md:flex justify-center text-[var(--ag-muted)]">
            <ArrowRight className="w-4 h-4 text-[var(--ag-gold)]" />
          </div>

          {/* Node 2: Classifier */}
          <div className="p-3 rounded-lg bg-[var(--ag-surface)] border border-[var(--ag-gold)]/30 shadow-[var(--ag-shadow-gold)] flex flex-col items-center justify-center">
            <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--ag-gold)]">Step 2</span>
            <span className="text-xs font-bold text-[var(--ag-text)] mt-1">INTENT CLASSIFIER</span>
            <span className="text-[10px] text-[var(--ag-gold)] font-mono">{activeTier}</span>
          </div>

          <div className="hidden md:flex justify-center text-[var(--ag-muted)]">
            <ArrowRight className="w-4 h-4 text-[var(--ag-gold)]" />
          </div>

          {/* Node 3: Response */}
          <div className="p-3 rounded-lg bg-[var(--ag-surface)] border border-[var(--ag-success)]/30 flex flex-col items-center justify-center">
            <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--ag-success)]">Step 3</span>
            <span className="text-xs font-bold text-[var(--ag-text)] mt-1">SYNTHESIS</span>
            <span className="text-[10px] text-[var(--ag-success)] font-mono">Streamed Response</span>
          </div>
        </div>

        {/* Middle: Provider Selection Cards */}
        <div className="mt-4 pt-4 border-t border-[var(--ag-border-subtle)] grid grid-cols-1 sm:grid-cols-3 gap-3">
          {providers.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className={clsx(
                  "p-3 rounded-lg border transition-all duration-200 flex flex-col justify-between",
                  p.isPrimary
                    ? "bg-[var(--ag-gold-alpha)] border-[var(--ag-gold)] shadow-[var(--ag-shadow-gold)]"
                    : "bg-[var(--ag-surface)] border-[var(--ag-border-subtle)] opacity-70 hover:opacity-100"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={clsx(
                        "w-4 h-4",
                        p.isPrimary ? "text-[var(--ag-gold)]" : "text-[var(--ag-muted)]"
                      )}
                    />
                    <span className="text-xs font-bold text-[var(--ag-text)]">{p.name}</span>
                  </div>
                  {p.isPrimary ? (
                    <span className="text-[9px] font-mono font-bold text-[var(--ag-gold)] px-1.5 py-0.5 rounded bg-[var(--ag-gold-soft)] border border-[var(--ag-gold)]/30">
                      ACTIVE ROUTE
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-[var(--ag-muted)]">STANDBY</span>
                  )}
                </div>

                <div className="text-[11px] text-[var(--ag-text-sec)]">{p.sub}</div>

                <div className="mt-3 pt-2 border-t border-[var(--ag-border-subtle)] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[var(--ag-muted)]">Status:</span>
                  <span
                    className={clsx(
                      p.statusType === "online"
                        ? "text-[var(--ag-success)]"
                        : p.statusType === "warning"
                        ? "text-[var(--ag-warning)]"
                        : "text-[var(--ag-info)]"
                    )}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom: Active Route Telemetry Strip */}
        <div className="mt-3 pt-3 border-t border-[var(--ag-border-subtle)] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[var(--ag-muted)]">Active Model:</span>
            <span className="text-[var(--ag-gold)] font-bold">{selectedModel}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-[var(--ag-text-sec)]">
              Latency: <strong className="text-[var(--ag-text)]">{latencyMs}ms</strong>
            </span>
            <span className="text-[var(--ag-text-sec)]">
              Tokens: <strong className="text-[var(--ag-text)]">{tokensUsed} tok</strong>
            </span>
            <span className="text-[var(--ag-text-sec)]">
              Fallback Chain: <strong className="text-[var(--ag-muted)]">{fallbackChain.length} nodes</strong>
            </span>
          </div>
        </div>
      </div>
    </MissionCard>
  );
};
