"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { Box, Play, CheckCircle2, RefreshCw } from "lucide-react";
import { DockerContainerMetric } from "@/types/telemetry";

interface DockerCardProps {
  docker: DockerContainerMetric[];
}

export const DockerCard: React.FC<DockerCardProps> = ({ docker }) => {
  const runningCount = docker.filter((d) => d.status === "running").length;

  return (
    <Card glow="cyan">
      <CardHeader>
        <CardTitle>
          <Box className="w-4 h-4 text-cyber-cyan" />
          <span>DOCKER CONTAINERS</span>
        </CardTitle>
        <Badge variant="cyan" dot>
          {runningCount} / {docker.length} ONLINE
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-2">
          {docker.map((c) => (
            <div
              key={c.id}
              className="bg-slate-950/60 p-2.5 rounded-lg border border-white/5 flex items-center justify-between text-xs font-mono"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-neon animate-pulse" />
                  <span className="text-slate-200 font-bold">{c.name}</span>
                </div>
                <div className="text-[10px] text-slate-500 flex gap-2">
                  <span>IMG: {c.image}</span>
                  <span>PORTS: {c.ports}</span>
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <Badge variant="neon" className="text-[9px] px-1.5 py-0">
                  {c.status.toUpperCase()}
                </Badge>
                <div className="text-[10px] text-slate-400">
                  CPU: <span className="text-slate-200">{c.cpuPercent}%</span> | MEM: <span className="text-slate-200">{c.memoryMb}MB</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
