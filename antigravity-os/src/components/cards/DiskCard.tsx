"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { ProgressBar } from "@/ui/ProgressBar";
import { HardDrive, Server } from "lucide-react";
import { DiskMetric } from "@/types/telemetry";

interface DiskCardProps {
  disks: DiskMetric[];
}

export const DiskCard: React.FC<DiskCardProps> = ({ disks }) => {
  return (
    <Card glow="cyan">
      <CardHeader>
        <CardTitle>
          <HardDrive className="w-4 h-4 text-cyber-cyan" />
          <span>WINDOWS STORAGE & DRIVES</span>
        </CardTitle>
        <Badge variant="cyan" dot>
          {disks.length} VOLUMES
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {disks.map((disk) => (
          <div key={disk.fs} className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400 font-bold">
                DRIVE [{disk.fs}] ({disk.type})
              </span>
              <span className="text-cyber-cyan font-bold">
                {disk.usedGb} GB / {disk.sizeGb} GB ({disk.usePercent}%)
              </span>
            </div>
            <ProgressBar value={disk.usePercent} color="cyan" size="md" />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>MOUNT: {disk.mount}</span>
              <span>AVAILABLE: <span className="text-slate-200 font-semibold">{disk.availableGb} GB</span></span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
