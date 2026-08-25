"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { ProgressBar } from "@/ui/ProgressBar";
import { HardDrive, Server, RefreshCw } from "lucide-react";
import { RamMetric } from "@/types/telemetry";

interface RamCardProps {
  ram: RamMetric;
}

export const RamCard: React.FC<RamCardProps> = ({ ram }) => {
  const ramPercent = (ram.usedGb / ram.totalGb) * 100;
  const swapPercent = (ram.swapUsedGb / ram.swapTotalGb) * 100;

  return (
    <Card glow="purple">
      <CardHeader>
        <CardTitle>
          <Server className="w-4 h-4 text-cyber-purple animate-pulse" />
          <span>SYSTEM MEMORY (RAM)</span>
        </CardTitle>
        <Badge variant="purple" dot>
          {ramPercent.toFixed(1)}% USED
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Physical RAM */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono text-slate-300 mb-1">
            <span className="text-slate-400">PHYSICAL 16GB RAM</span>
            <span className="text-cyber-purple font-bold">
              {ram.usedGb.toFixed(1)} GB / {ram.totalGb.toFixed(1)} GB
            </span>
          </div>
          <ProgressBar value={ramPercent} color="purple" size="md" />
        </div>

        {/* Swap / Virtual Memory */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono text-slate-300 mb-1">
            <span className="text-slate-400">PAGEFILE / SWAP</span>
            <span className="text-slate-300 font-bold">
              {ram.swapUsedGb.toFixed(1)} GB / {ram.swapTotalGb.toFixed(1)} GB
            </span>
          </div>
          <ProgressBar value={swapPercent} color="cyan" size="sm" />
        </div>

        {/* Breakdown Row */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5 text-center font-mono">
          <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <div className="text-[10px] text-slate-400">FREE RAM</div>
            <div className="text-xs font-bold text-cyber-neon mt-0.5">{ram.freeGb.toFixed(1)} GB</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <div className="text-[10px] text-slate-400">CACHED</div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">{ram.cachedMb} MB</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <div className="text-[10px] text-slate-400">BUFFERS</div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">{ram.buffersMb} MB</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-900/40 p-2 rounded-lg border border-white/5">
          <span>UPGRADE EXPANSION</span>
          <span className="text-cyber-cyan font-bold">32 GB READY</span>
        </div>
      </CardContent>
    </Card>
  );
};
