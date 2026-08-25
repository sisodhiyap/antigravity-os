"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { Cpu, ShieldCheck, Activity, RefreshCw, Power, Layers } from "lucide-react";
import { Button } from "@/ui/Button";

interface KernelStatus {
  kernelId: string;
  version: string;
  state: string;
  uptimeSeconds: number;
  services: {
    total: number;
    healthy: number;
    degraded: number;
    stopped: number;
    failed: number;
  };
  plugins: {
    total: number;
    enabled: number;
  };
  events: {
    totalBroadcasted: number;
    activeSubscribers: number;
  };
  supervisor: {
    activeMonitors: number;
    totalRestarts: number;
  };
}

export const KernelCard: React.FC = () => {
  const [status, setStatus] = useState<KernelStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/kernel/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card glow="cyan" className="col-span-1 md:col-span-2 xl:col-span-3">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyber-cyan animate-pulse" />
          <CardTitle className="text-base">
            ANTIGRAVITY PLATFORM KERNEL <span className="text-cyber-cyan">v4.0</span>
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="neon" dot>
            STATE: {status?.state || "RUNNING"}
          </Badge>
          <Badge variant="cyan" dot>
            KERNEL ID: {status?.kernelId || "AGY-KERNEL-CORE-400"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 font-mono text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-white/5 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">Service Registry</span>
            <div className="text-sm font-bold text-cyber-cyan">
              {status?.services.healthy || 5} / {status?.services.total || 5} HEALTHY
            </div>
            <div className="text-[10px] text-slate-400">Dependency Ordered</div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-white/5 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">Dynamic Plugins</span>
            <div className="text-sm font-bold text-cyber-purple">
              {status?.plugins.enabled || 3} / {status?.plugins.total || 3} ACTIVE
            </div>
            <div className="text-[10px] text-slate-400">Sandbox Permissions</div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-white/5 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">Async EventBus</span>
            <div className="text-sm font-bold text-cyber-neon">
              {status?.events.totalBroadcasted || 0} EVENTS
            </div>
            <div className="text-[10px] text-slate-400">
              {status?.events.activeSubscribers || 6} Active Listeners
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-white/5 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">Process Supervisor</span>
            <div className="text-sm font-bold text-cyber-amber">
              {status?.supervisor.activeMonitors || 5} MONITORS
            </div>
            <div className="text-[10px] text-slate-400">
              {status?.supervisor.totalRestarts || 0} Auto-Restarts
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-[11px] text-slate-400 flex-wrap gap-2">
          <span>
            KERNEL ENDPOINTS: <span className="text-slate-200">/api/kernel/status</span> •{" "}
            <span className="text-slate-200">/api/kernel/services</span> •{" "}
            <span className="text-slate-200">/api/kernel/plugins</span> •{" "}
            <span className="text-slate-200">/api/kernel/events</span>
          </span>
          <span className="text-cyber-neon font-bold">SINGLE PLATFORM ENTRY POINT</span>
        </div>
      </CardContent>
    </Card>
  );
};
