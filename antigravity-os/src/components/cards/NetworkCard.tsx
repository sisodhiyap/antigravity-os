"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { Wifi, ArrowDown, ArrowUp, Activity } from "lucide-react";
import { NetworkMetric } from "@/types/telemetry";
import { formatBytes } from "@/lib/utils";

interface NetworkCardProps {
  network: NetworkMetric;
}

export const NetworkCard: React.FC<NetworkCardProps> = ({ network }) => {
  return (
    <Card glow="neon">
      <CardHeader>
        <CardTitle>
          <Wifi className="w-4 h-4 text-cyber-neon" />
          <span>NETWORK & INTERFACE</span>
        </CardTitle>
        <Badge variant="neon" dot>
          {network.latencyMs} ms PING
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 font-mono">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <ArrowDown className="w-3 h-3 text-cyber-cyan" /> DOWNLOAD RATE
            </div>
            <div className="text-sm font-bold text-cyber-cyan">
              {formatBytes(network.rxSec)}/s
            </div>
            <div className="text-[9px] text-slate-500">
              TOTAL: {formatBytes(network.rxBytes)}
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <ArrowUp className="w-3 h-3 text-cyber-neon" /> UPLOAD RATE
            </div>
            <div className="text-sm font-bold text-cyber-neon">
              {formatBytes(network.txSec)}/s
            </div>
            <div className="text-[9px] text-slate-500">
              TOTAL: {formatBytes(network.txBytes)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-white/5">
          <span>INTERFACE</span>
          <span className="text-slate-200 font-bold">{network.iface}</span>
        </div>
      </CardContent>
    </Card>
  );
};
