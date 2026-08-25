import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "cyber";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const variantStyles = {
      primary: "bg-cyber-cyan text-slate-950 hover:bg-cyber-cyan/90 font-semibold shadow-glow-cyan",
      secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700",
      outline: "border border-cyber-cyan/40 text-cyber-cyan hover:bg-cyber-cyan/10 hover:border-cyber-cyan",
      ghost: "text-slate-300 hover:text-white hover:bg-white/5",
      danger: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30",
      cyber: "bg-gradient-to-r from-cyber-cyan to-cyber-purple text-white font-bold hover:opacity-90 shadow-glow-purple",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-md",
      md: "h-10 px-4 text-sm rounded-lg",
      lg: "h-12 px-6 text-base rounded-xl",
      icon: "h-9 w-9 p-0 rounded-lg flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
