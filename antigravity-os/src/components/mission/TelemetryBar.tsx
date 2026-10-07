"use client";

import React from "react";
import { clsx } from "clsx";
import { Cpu, Zap, MemoryStick, HardDrive, Activity } from "lucide-react";
import { MissionCard } from "@/components/ui/MissionCard";

export interface TelemetryItemProps {
  label: string;
  value: number;
  total?: number;
  unit: string;
  subtext?: string;
  icon: React.ReactNode;
  warningThreshold?: number;
  criticalThreshold?: number;
}

export const TelemetryItem: React.FC<TelemetryItemProps> = ({
  label,
  value,
  total,
  unit,
  subtext,
  icon,
  warningThreshold = 80,
  criticalThreshold = 95,
}) => {
  const percentage = total && total > 0 ? Math.min(100, Math.round((value / total) * 100)) : Math.min(100, Math.round(value));
  const isCritical = percentage >= criticalThreshold;
  const isWarning = percentage >= warningThreshold && !isCritical;

  return (
    <div className="space-y-1.5 p-3 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)]">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[var(--ag-gold)]">{icon}</span>
          <span className="font-bold text-[var(--ag-text)]">{label}</span>
        </div>
        <div className="font-mono text-[11px] text-[var(--ag-text-sec)]">
          <strong className="text-[var(--ag-text)] font-semibold">{value}</strong>
          {total ? ` / ${total} ${unit}` : ` ${unit}`}
          <span className="ml-1 text-[var(--ag-muted)]">({percentage}%)</span>
        </div>
      </div>

      <div className="mc-progress-track">
        <div
          className={clsx(
            "mc-progress-fill",
            isCritical && "!bg-[var(--ag-error)]",
            isWarning && "!bg-[var(--ag-warning)]"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {subtext && (
        <div className="text-[10px] text-[var(--ag-muted)] flex justify-between">
          <span>{subtext}</span>
          <span>{isCritical ? "HIGH LOAD" : isWarning ? "ELEVATED" : "OPTIMAL"}</span>
        </div>
      )}
    </div>
  );
};

export interface ComputeTelemetryProps {
  gpuVramUsedGb?: number;
  gpuVramTotalGb?: number;
  gpuUsagePercent?: number;
  ramUsedGb?: number;
  ramTotalGb?: number;
  cpuPercent?: number;
  diskPercent?: number;
  className?: string;
}

export const ComputeTelemetry: React.FC<ComputeTelemetryProps> = ({
  gpuVramUsedGb = 4.2,
  gpuVramTotalGb = 6.0,
  gpuUsagePercent = 15,
  ramUsedGb = 13.8,
  ramTotalGb = 16.0,
  cpuPercent = 8,
  diskPercent = 42,
  className,
}) => {
  return (
    <MissionCard
      title="Compute Telemetry Deck"
      description="Real-time hardware envelope & resource utilization metrics"
      icon={<Activity className="w-4 h-4" />}
      className={clsx("space-y-3", className)}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <TelemetryItem
          label="GPU VRAM"
          value={gpuVramUsedGb}
          total={gpuVramTotalGb}
          unit="GB"
          subtext="RTX 3060 Dedicated"
          icon={<Zap className="w-3.5 h-3.5" />}
        />
        <TelemetryItem
          label="HOST RAM"
          value={ramUsedGb}
          total={ramTotalGb}
          unit="GB"
          subtext="16GB DDR5 High-Speed"
          icon={<MemoryStick className="w-3.5 h-3.5" />}
        />
        <TelemetryItem
          label="CPU LOAD"
          value={cpuPercent}
          unit="%"
          subtext="Ryzen 9 6900HS (16T)"
          icon={<Cpu className="w-3.5 h-3.5" />}
        />
        <TelemetryItem
          label="LOCAL DISK"
          value={diskPercent}
          unit="%"
          subtext="NVMe High IOPS Storage"
          icon={<HardDrive className="w-3.5 h-3.5" />}
        />
      </div>
    </MissionCard>
  );
};
