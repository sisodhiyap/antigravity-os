"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { ProgressBar } from "@/ui/ProgressBar";
import { Video, Film, PlayCircle } from "lucide-react";
import { VideoQueueItem } from "@/types/telemetry";

interface VideoQueueCardProps {
  queue: VideoQueueItem[];
}

export const VideoQueueCard: React.FC<VideoQueueCardProps> = ({ queue }) => {
  const renderingCount = queue.filter((v) => v.status === "rendering").length;

  return (
    <Card glow="cyan">
      <CardHeader>
        <CardTitle>
          <Video className="w-4 h-4 text-cyber-cyan" />
          <span>REMOTION & BLENDER VIDEO QUEUE</span>
        </CardTitle>
        <Badge variant="cyan" dot>
          {renderingCount} RENDERING
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
                <Film className="w-3 h-3 text-cyber-cyan" />
                <span className="text-slate-200 font-bold">{item.title}</span>
              </div>
              <Badge
                variant={item.status === "rendering" ? "cyan" : item.status === "finished" ? "neon" : "default"}
                className="text-[9px] px-1.5 py-0"
              >
                {item.status.toUpperCase()}
              </Badge>
            </div>

            <div className="flex justify-between text-[10px] text-slate-400">
              <span>ENGINE: <span className="text-slate-200 font-semibold">{item.engine}</span></span>
              <span>ASPECT: <span className="text-cyber-cyan">{item.aspectRatio}</span> • {item.fps} FPS</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>DURATION: {item.durationSeconds}s</span>
                <span>{item.progressPercent}%</span>
              </div>
              <ProgressBar value={item.progressPercent} color="cyan" size="sm" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
