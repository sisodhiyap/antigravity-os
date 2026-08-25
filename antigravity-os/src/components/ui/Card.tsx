import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "cyan" | "neon" | "purple" | "pink" | "amber" | "none";
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow = "none", hoverable = true, children, ...props }, ref) => {
    const glowClasses = {
      none: "",
      cyan: "border-cyber-cyan/20 hover:border-cyber-cyan/50 hover:shadow-glow-cyan",
      neon: "border-cyber-neon/20 hover:border-cyber-neon/50 hover:shadow-glow-neon",
      purple: "border-cyber-purple/20 hover:border-cyber-purple/50 hover:shadow-glow-purple",
      pink: "border-cyber-pink/20 hover:border-cyber-pink/50 hover:shadow-glow-pink",
      amber: "border-cyber-amber/20 hover:border-cyber-amber/50 hover:shadow-glow-amber",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "glass-panel rounded-xl p-5 relative overflow-hidden transition-all duration-300",
          hoverable && "glass-panel-hover",
          glowClasses[glow],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/5", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-sm font-semibold tracking-wider text-slate-200 flex items-center gap-2", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-1", className)} {...props} />
));
CardContent.displayName = "CardContent";
