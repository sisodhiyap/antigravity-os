import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0 to 100
  color?: "cyan" | "neon" | "purple" | "pink" | "amber" | "gradient";
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = "cyan",
  className,
  showLabel = false,
  size = "md",
}) => {
  const clamped = Math.max(0, Math.min(100, value));

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const colorStyles = {
    cyan: "bg-cyber-cyan shadow-[0_0_10px_rgba(0,240,255,0.7)]",
    neon: "bg-cyber-neon shadow-[0_0_10px_rgba(57,255,20,0.7)]",
    purple: "bg-cyber-purple shadow-[0_0_10px_rgba(157,78,221,0.7)]",
    pink: "bg-cyber-pink shadow-[0_0_10px_rgba(255,0,127,0.7)]",
    amber: "bg-cyber-amber shadow-[0_0_10px_rgba(255,183,3,0.7)]",
    gradient: "bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-neon shadow-[0_0_12px_rgba(0,240,255,0.5)]",
  };

  return (
    <div className={cn("w-full space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs font-mono text-slate-400">
          <span>PROGRESS</span>
          <span className="text-slate-200 font-semibold">{clamped.toFixed(1)}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-slate-900/80 rounded-full overflow-hidden border border-white/5 p-0.5",
          sizeClasses[size]
        )}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", colorStyles[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
