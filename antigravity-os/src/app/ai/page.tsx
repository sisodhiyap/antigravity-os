"use client";

import React, { useState, useEffect } from "react";
import {
  Brain, Cpu, Wifi, RefreshCw, Sliders,
  CheckCircle2, AlertTriangle, Zap, MemoryStick,
  ArrowRight, Activity,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, MetricCard, StatusBadge } from "@/components/ui/DesignSystem";
import { Button } from "@/components/ui/Button";
import { useLiveTelemetry } from "@/hooks/useLiveTelemetry";
import { useSystemStore } from "@/stores/useSystemStore";
import { clsx } from "clsx";

type RoutingMode = "AUTO" | "FAST" | "BALANCED" | "QUALITY" | "LOCAL_ONLY" | "CLOUD_ONLY" | "CHEAPEST";

const ROUTING_MODES: { value: RoutingMode; label: string; desc: string }[] = [
  { value: "AUTO",       label: "Auto",        desc: "Smart selection based on task" },
  { value: "FAST",       label: "Fast",         desc: "Minimize time to first token" },
  { value: "BALANCED",   label: "Balanced",     desc: "Optimize speed + quality" },
  { value: "QUALITY",    label: "Quality",      desc: "Best available model" },
  { value: "LOCAL_ONLY", label: "Local Only",   desc: "No cloud calls" },
  { value: "CLOUD_ONLY", label: "Cloud Only",   desc: "OpenRouter only" },
  { value: "CHEAPEST",   label: "Cheapest",     desc: "Minimize token cost" },
];

export default function AIControlCenterPage() {
  const { data: telemetry } = useLiveTelemetry();
  const { telemetry: storeTelemetry } = useSystemStore();
  const t = telemetry || storeTelemetry;

  const [routingMode, setRoutingMode] = useState<RoutingMode>("AUTO");
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [simPrompt, setSimPrompt] = useState("Architect a distributed event-bus for high-throughput messaging");
  const [routingDecision, setRoutingDecision] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    async function fetchProviders() {
      setLoading(true);
      try {
        const res = await fetch("/api/providers");
        if (res.ok) {
          const data = await res.json();
          setProviders(data.providers || []);
        }
      } catch {}
      setLoading(false);
    }
    fetchProviders();
  }, []);

  async function simulateRouting() {
    if (!simPrompt.trim()) return;
    setSimLoading(true);
    setRoutingDecision(null);
    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: simPrompt, policy: routingMode }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoutingDecision(data);
      }
    } catch {}
    setSimLoading(false);
  }

  const providerCards = [
    {
      name: "Ollama",
      icon: Brain,
      status: "online" as const,
      model: "Local models",
      latency: null,
      vram: t?.gpu?.vramUsedMb ? (t.gpu.vramUsedMb / 1024).toFixed(1) : null,
      ram: t?.ram?.usedGb ?? null,
    },
    {
      name: "AirLLM",
      icon: Cpu,
      status: "online" as const,
      model: "Qwen3-32B (4-bit)",
      latency: null,
      vram: t?.gpu?.vramUsedMb ? (t.gpu.vramUsedMb / 1024).toFixed(1) : null,
      ram: null,
    },
    {
      name: "OpenRouter",
      icon: Wifi,
      status: "ready" as const,
      model: "Cloud routing",
      latency: null,
      vram: null,
      ram: null,
    },
  ];

  return (
    <AppShell>
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[var(--ag-text)] font-satoshi tracking-tight">
          AI Control Center
        </h1>
        <p className="text-sm text-[var(--ag-text-sec)]">
          3-tier inference mesh — Ollama · AirLLM · OpenRouter
        </p>
      </div>

      {/* Routing Mode Selector */}
      <section aria-label="Routing mode">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ag-muted)]">
          Routing Policy
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Select routing mode">
          {ROUTING_MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setRoutingMode(m.value)}
              aria-pressed={routingMode === m.value}
              title={m.desc}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wide border transition-all duration-150",
                routingMode === m.value
                  ? "bg-[var(--ag-gold-alpha)] border-[var(--ag-gold)]/30 text-[var(--ag-gold)]"
                  : "border-[var(--ag-border)] text-[var(--ag-muted)] hover:text-[var(--ag-text-sec)] hover:border-[var(--ag-gold-soft)]/40"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </section>

      {/* Model Routing Matrix */}
      <section aria-label="Model routing matrix">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ag-muted)]">
          Model Routing Matrix
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {providerCards.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.name} className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[var(--ag-text-sec)]" aria-hidden="true" />
                    </div>
                    <span className="font-semibold text-[var(--ag-text)] text-sm">{p.name}</span>
                  </div>
                  <StatusBadge variant={p.status} label={p.status.toUpperCase()} pulse={p.status === "online"} />
                </div>

                <div className="text-[11px] text-[var(--ag-muted)] truncate">{p.model}</div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <div className="text-[9px] uppercase tracking-wider text-[var(--ag-muted)]">Latency</div>
                    <div className="text-sm font-semibold text-[var(--ag-text)] tabular-nums">
                      {p.latency ? `${p.latency}ms` : "—"}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[9px] uppercase tracking-wider text-[var(--ag-muted)]">VRAM</div>
                    <div className="text-sm font-semibold text-[var(--ag-text)] tabular-nums">
                      {p.vram ? `${p.vram} GB` : "—"}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Routing Simulator */}
      <section aria-label="Routing decision simulator">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ag-muted)]">
          Why This Model?
        </div>
        <Card className="p-5 space-y-4">
          <div className="flex gap-3">
            <input
              value={simPrompt}
              onChange={(e) => setSimPrompt(e.target.value)}
              placeholder="Describe a task to see routing decision..."
              className="ag-input flex-1"
              aria-label="Task description for routing simulation"
            />
            <Button
              onClick={simulateRouting}
              loading={simLoading}
              variant="ghost"
              icon={<Activity className="w-3.5 h-3.5" />}
            >
              Simulate
            </Button>
          </div>

          {routingDecision && (
            <div className="p-4 rounded-lg bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-3 animate-[fade-in_0.25s_ease-out]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--ag-success)]" aria-hidden="true" />
                <span className="text-[12px] font-semibold text-[var(--ag-text)]">
                  Selected: {routingDecision.provider || "Ollama"} / {routingDecision.model || "Local"}
                </span>
              </div>
              <p className="text-[12px] text-[var(--ag-text-sec)] leading-relaxed">
                {routingDecision.reason || "Routed based on task classification and available VRAM."}
              </p>
              {routingDecision.fallback && (
                <p className="text-[11px] text-[var(--ag-muted)]">
                  Fallback: {routingDecision.fallback}
                </p>
              )}
            </div>
          )}
        </Card>
      </section>
    </AppShell>
  );
}
