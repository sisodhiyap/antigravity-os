"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { ProgressBar } from "@/ui/ProgressBar";
import { Zap, Flame, Activity, Fan } from "lucide-react";
import { GpuMetric } from "@/types/telemetry";

interface GpuCardProps {
  gpu: GpuMetric;
}

export const GpuCard: React.FC<GpuCardProps> = ({ gpu }) => {
  const vramPercent = (gpu.vramUsedMb / gpu.vramTotalMb) * 100;

  return (
    <Card glow="neon">
      <CardHeader>
        <CardTitle>
          <Zap className="w-4 h-4 text-cyber-neon animate-pulse" />
          <span>GPU HARDWARE (RTX 3060)</span>
        </CardTitle>
        <Badge variant="neon" dot>
          CUDA ACTIVE
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* VRAM Allocation */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono text-slate-300 mb-1">
            <span className="text-slate-400">VRAM 6GB USAGE</span>
            <span className="text-cyber-neon font-bold">
              {gpu.vramUsedMb} MB / {gpu.vramTotalMb} MB ({vramPercent.toFixed(1)}%)
            </span>
          </div>
          <ProgressBar value={vramPercent} color="neon" size="md" />
        </div>

        {/* Compute Load */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono text-slate-300 mb-1">
            <span className="text-slate-400">GPU COMPUTE LOAD</span>
            <span className="text-slate-200 font-bold">{gpu.usagePercent}%</span>
          </div>
          <ProgressBar value={gpu.usagePercent} color="cyan" size="sm" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5 text-center font-mono">
          <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" /> GPU TEMP
            </div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">{gpu.temperatureC}°C</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Activity className="w-3 h-3 text-cyber-pink" /> POWER
            </div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">{gpu.powerWatts} W</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Fan className="w-3 h-3 text-cyber-cyan" /> FAN SPEED
            </div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">
              {typeof gpu.fanSpeedPercent === "number" ? `${gpu.fanSpeedPercent}%` : gpu.fanSpeedPercent}
            </div>
          </div>
        </div>

        {/* Acceleration status badges */}
        <div className="flex gap-2 pt-1">
          <Badge variant="cyan" className="text-[10px] flex-1 justify-center py-1">
            TENSOR CORES: ON
          </Badge>
          <Badge variant="neon" className="text-[10px] flex-1 justify-center py-1">
            OLLAMA GPU OFFLOAD: 100%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
