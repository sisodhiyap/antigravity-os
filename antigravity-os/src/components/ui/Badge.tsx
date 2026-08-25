import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "cyan" | "neon" | "purple" | "pink" | "amber" | "default" | "danger";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  dot = false,
  children,
  ...props
}) => {
  const variantStyles = {
    default: "bg-slate-800/80 text-slate-300 border border-slate-700/50",
    cyan: "bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 shadow-[0_0_10px_-3px_rgba(0,240,255,0.3)]",
    neon: "bg-cyber-neon/10 text-cyber-neon border border-cyber-neon/30 shadow-[0_0_10px_-3px_rgba(57,255,20,0.3)]",
    purple: "bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/30 shadow-[0_0_10px_-3px_rgba(157,78,221,0.3)]",
    pink: "bg-cyber-pink/10 text-cyber-pink border border-cyber-pink/30 shadow-[0_0_10px_-3px_rgba(255,0,127,0.3)]",
    amber: "bg-cyber-amber/10 text-cyber-amber border border-cyber-amber/30 shadow-[0_0_10px_-3px_rgba(255,183,3,0.3)]",
    danger: "bg-red-500/10 text-red-400 border border-red-500/30",
  };

  const dotColors = {
    default: "bg-slate-400",
    cyan: "bg-cyber-cyan animate-pulse",
    neon: "bg-cyber-neon animate-pulse",
    purple: "bg-cyber-purple animate-pulse",
    pink: "bg-cyber-pink animate-pulse",
    amber: "bg-cyber-amber animate-pulse",
    danger: "bg-red-400 animate-ping",
  };

  return (
    <span
      className={cn(
        "cyber-badge font-mono text-[11px]",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])} />}
      {children}
    </span>
  );
};
