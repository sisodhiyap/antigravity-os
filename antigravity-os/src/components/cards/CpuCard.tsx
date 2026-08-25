"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { ProgressBar } from "@/ui/ProgressBar";
import { Cpu, Flame, Gauge, Layers } from "lucide-react";
import { CpuMetric } from "@/types/telemetry";

interface CpuCardProps {
  cpu: CpuMetric;
}

export const CpuCard: React.FC<CpuCardProps> = ({ cpu }) => {
  return (
    <Card glow="cyan">
      <CardHeader>
        <CardTitle>
          <Cpu className="w-4 h-4 text-cyber-cyan animate-pulse" />
          <span>CPU METRICS</span>
        </CardTitle>
        <Badge variant="cyan" dot>
          {cpu.usagePercent.toFixed(1)}% LOAD
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center text-xs font-mono text-slate-300 mb-1">
            <span className="text-slate-400 truncate max-w-[200px]">{cpu.model}</span>
            <span className="text-cyber-cyan font-bold">{cpu.frequencyGhz.toFixed(2)} GHz</span>
          </div>
          <ProgressBar value={cpu.usagePercent} color="cyan" size="md" />
        </div>

        {/* Vital stats row */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5 text-center font-mono">
          <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" /> TEMP
            </div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">{cpu.temperatureC}°C</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Layers className="w-3 h-3 text-cyber-purple" /> CORES
            </div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">{cpu.cores}C / {cpu.threads}T</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Gauge className="w-3 h-3 text-cyber-neon" /> BOOST
            </div>
            <div className="text-xs font-bold text-cyber-neon mt-0.5">ACTIVE</div>
          </div>
        </div>

        {/* 12-Core Multi-Load Mini Bars */}
        <div>
          <div className="text-[10px] font-mono text-slate-400 mb-1.5 flex justify-between">
            <span>CORE LOAD MATRIX</span>
            <span>12 CORES</span>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {cpu.coreLoads.map((load, idx) => (
              <div key={idx} className="bg-slate-900/80 p-1 rounded border border-white/5 text-center">
                <div className="text-[9px] font-mono text-slate-400">C{idx + 1}</div>
                <div
                  className={`text-[10px] font-mono font-bold ${
                    load > 60 ? "text-orange-400" : load > 30 ? "text-cyber-cyan" : "text-slate-300"
                  }`}
                >
                  {load}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
