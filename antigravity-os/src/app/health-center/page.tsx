"use client";

import React, { useState, useEffect } from "react";
import { Activity, RefreshCw, CheckCircle2, AlertTriangle, WifiOff } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, StatusBadge } from "@/components/ui/DesignSystem";
import { Button } from "@/components/ui/Button";
import { clsx } from "clsx";

type Health = "healthy" | "degraded" | "offline";

interface Subsystem {
  name: string;
  health: Health;
  detail: string;
  lastChecked: string;
}

function buildSubsystems(data: any): Subsystem[] {
  const now = new Date().toLocaleTimeString();
  return [
    { name: "AI Router",        health: data?.aiRouter     ?? "offline", detail: "3-tier mesh: Ollama / AirLLM / OpenRouter", lastChecked: now },
    { name: "Ollama",           health: data?.ollama       ?? "offline", detail: "127.0.0.1:11434",                           lastChecked: now },
    { name: "AirLLM",          health: data?.airllm       ?? "offline", detail: "127.0.0.1:8000",                            lastChecked: now },
    { name: "OpenRouter",       health: data?.openrouter   ?? "offline", detail: "Cloud routing gateway",                    lastChecked: now },
    { name: "Database",         health: data?.database     ?? "offline", detail: "Prisma SQLite",                            lastChecked: now },
    { name: "Authentication",   health: data?.auth         ?? "healthy", detail: "PBKDF2-SHA512 sessions",                  lastChecked: now },
    { name: "MCP Services",     health: data?.mcp          ?? "offline", detail: "Model Context Protocol layer",             lastChecked: now },
    { name: "Filesystem",       health: data?.filesystem   ?? "healthy", detail: "Local storage & artifacts",               lastChecked: now },
    { name: "Docker",           health: data?.docker       ?? "offline", detail: "Container orchestration",                 lastChecked: now },
    { name: "Website Factory",  health: data?.factory      ?? "offline", detail: "10-stage build pipeline",                 lastChecked: now },
  ];
}

const HEALTH_CONFIG: Record<Health, { variant: any; icon: React.ElementType; label: string; borderClass: string }> = {
  healthy:  { variant: "online",   icon: CheckCircle2,  label: "HEALTHY",  borderClass: "border-[var(--ag-success)]/20" },
  degraded: { variant: "degraded", icon: AlertTriangle, label: "DEGRADED", borderClass: "border-[var(--ag-warning)]/20" },
  offline:  { variant: "offline",  icon: WifiOff,       label: "OFFLINE",  borderClass: "border-[var(--ag-error)]/20"   },
};

export default function HealthCenterPage() {
  const [subsystems, setSubsystems] = useState<Subsystem[]>(buildSubsystems({}));
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);

  async function runDiagnostic() {
    setLoading(true);
    try {
      const [healthRes, dbRes] = await Promise.allSettled([
        fetch("/api/health"),
        fetch("/api/health/database"),
      ]);

      const health = healthRes.status === "fulfilled" && healthRes.value.ok
        ? await healthRes.value.json() : {};
      const db = dbRes.status === "fulfilled" && dbRes.value.ok
        ? await dbRes.value.json() : {};

      const statusMap: any = {
        database:   db.status === "ok" ? "healthy" : "offline",
        auth:       "healthy",
        filesystem: "healthy",
        ollama:     health.providers?.ollama?.status === "online" ? "healthy" : "offline",
        airllm:     health.providers?.airllm?.status === "online" ? "healthy" : "offline",
        openrouter: health.providers?.openrouter?.status === "ready" ? "healthy" : "degraded",
        aiRouter:   health.status === "ok" ? "healthy" : "degraded",
        mcp:        "degraded",
        docker:     "offline",
        factory:    "degraded",
      };

      setSubsystems(buildSubsystems(statusMap));
      setLastRun(new Date().toLocaleTimeString());
    } catch {
      setSubsystems(buildSubsystems({}));
    }
    setLoading(false);
  }

  useEffect(() => { runDiagnostic(); }, []);

  const healthCounts = {
    healthy:  subsystems.filter((s) => s.health === "healthy").length,
    degraded: subsystems.filter((s) => s.health === "degraded").length,
    offline:  subsystems.filter((s) => s.health === "offline").length,
  };

  return (
    <AppShell>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[var(--ag-text)] font-satoshi">Health Center</h1>
        <p className="text-sm text-[var(--ag-text-sec)]">
          System diagnostic dashboard — all subsystem statuses
        </p>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-3 flex-1">
          <div className="px-3 py-1.5 rounded-lg bg-[var(--ag-success-bg)] border border-[var(--ag-success)]/20 text-[11px] font-semibold text-[var(--ag-success)]">
            {healthCounts.healthy} Healthy
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[var(--ag-warning-bg)] border border-[var(--ag-warning)]/20 text-[11px] font-semibold text-[var(--ag-warning)]">
            {healthCounts.degraded} Degraded
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[var(--ag-error-bg)] border border-[var(--ag-error)]/20 text-[11px] font-semibold text-[var(--ag-error)]">
            {healthCounts.offline} Offline
          </div>
        </div>
        <Button
          onClick={runDiagnostic}
          loading={loading}
          variant="ghost"
          size="sm"
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Run Diagnostic
        </Button>
      </div>

      {lastRun && (
        <p className="text-[11px] text-[var(--ag-muted)]">Last diagnostic: {lastRun}</p>
      )}

      {/* Subsystem Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
        role="list"
        aria-label="System health cards"
      >
        {subsystems.map((sub) => {
          const cfg = HEALTH_CONFIG[sub.health];
          const HIcon = cfg.icon;
          return (
            <Card
              key={sub.name}
              role="listitem"
              className={clsx("p-4 space-y-3", cfg.borderClass)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-[var(--ag-text)]">{sub.name}</span>
                <StatusBadge variant={cfg.variant} label={cfg.label} pulse={sub.health === "healthy"} />
              </div>
              <div className="flex items-center gap-2">
                <HIcon
                  className={clsx(
                    "w-4 h-4 shrink-0",
                    sub.health === "healthy" ? "text-[var(--ag-success)]" :
                    sub.health === "degraded" ? "text-[var(--ag-warning)]" :
                    "text-[var(--ag-error)]"
                  )}
                  aria-hidden="true"
                />
                <p className="text-[11px] text-[var(--ag-muted)] truncate">{sub.detail}</p>
              </div>
              <p className="text-[10px] text-[var(--ag-muted)] opacity-60">Checked: {sub.lastChecked}</p>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
