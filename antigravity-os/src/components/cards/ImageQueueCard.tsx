"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { ProgressBar } from "@/ui/ProgressBar";
import { Image, Sparkles, Clock } from "lucide-react";
import { ImageQueueItem } from "@/types/telemetry";

interface ImageQueueCardProps {
  queue: ImageQueueItem[];
}

export const ImageQueueCard: React.FC<ImageQueueCardProps> = ({ queue }) => {
  const activeCount = queue.filter((i) => i.status === "processing").length;

  return (
    <Card glow="pink">
      <CardHeader>
        <CardTitle>
          <Image className="w-4 h-4 text-cyber-pink" />
          <span>SDXL / FLUX IMAGE QUEUE</span>
        </CardTitle>
        <Badge variant="pink" dot>
          {activeCount} RENDERING
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {queue.map((item) => (
          <div
            key={item.id}
            className="bg-slate-950/60 p-2.5 rounded-lg border border-white/5 space-y-1.5 font-mono text-xs"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyber-pink" />
                <span className="text-slate-200 font-bold">{item.model}</span>
                <span className="text-[10px] text-slate-500">[{item.resolution}]</span>
              </div>
              <Badge
                variant={item.status === "processing" ? "pink" : item.status === "completed" ? "neon" : "default"}
                className="text-[9px] px-1.5 py-0"
              >
                {item.status.toUpperCase()}
              </Badge>
            </div>

            <div className="text-[11px] text-slate-400 truncate">{item.prompt}</div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> ETA: {item.etaSeconds}s
                </span>
                <span>{item.progressPercent}%</span>
              </div>
              <ProgressBar value={item.progressPercent} color="pink" size="sm" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
