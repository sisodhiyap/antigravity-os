import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Mission Control Foundations ───────────────────────────
        mc: {
          bg:          "#080808",
          bgDeep:      "#0D0D0F",
          surface:     "#121212",
          surfaceElev: "#181818",
          card:        "#151518",
          border:      "#222225",
          borderSubtle:"rgba(255, 255, 255, 0.07)",
          // Gold
          gold:        "#D4AF37",
          goldBright:  "#F0C75E",
          goldGlow:    "#FFD978",
          goldSoft:    "rgba(212, 175, 55, 0.14)",
          goldBorder:  "rgba(212, 175, 55, 0.35)",
          // Text
          text:        "#F5F5F5",
          textSec:     "#B8B8B8",
          muted:       "#777777",
          // Status
          success:     "#39D98A",
          warning:     "#F5B942",
          danger:      "#FF5C5C",
          info:        "#63B3FF",
        },
        // Legacy AG Tokens (backward compat)
        ag: {
          bg:       "#080808",
          bgDeep:   "#0D0D0F",
          surface:  "#121212",
          elevated: "#181818",
          border:   "#222225",
          gold:     "#D4AF37",
          goldBright:"#F0C75E",
          goldSoft: "#9F8420",
          text:     "#F5F5F5",
          textSec:  "#B8B8B8",
          muted:    "#777777",
          success:  "#39D98A",
          warning:  "#F5B942",
          error:    "#FF5C5C",
          info:     "#63B3FF",
        },
        // Light mode surfaces (data-theme="light")
        mcLight: {
          bg:       "#F4F3EF",
          surface:  "#FFFFFF",
          surfaceSec:"#ECEAE4",
          border:   "rgba(0, 0, 0, 0.10)",
          text:     "#171717",
          textSec:  "#555555",
          muted:    "#666666",
          gold:     "#B18A24",
        },
      },
      fontFamily: {
        satoshi: ["Satoshi", "Inter", "sans-serif"],
        geist:   ["Geist", "Inter", "sans-serif"],
        inter:   ["Inter", "sans-serif"],
        mono:    ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius, 0.75rem)",
        md: "calc(var(--radius, 0.75rem) - 2px)",
        sm: "calc(var(--radius, 0.75rem) - 4px)",
      },
      boxShadow: {
        "mission-hover": "0 0 0 1px rgba(212,175,55,0.35), 0 0 24px -4px rgba(212,175,55,0.15), 0 12px 40px rgba(0,0,0,0.35)",
        "mission-selected": "-4px 0 18px rgba(212,175,55,0.25), 0 0 0 1px rgba(212,175,55,0.4)",
        "gold-sm":  "0 0 12px -4px rgba(212,175,55,0.35)",
        "gold-md":  "0 0 24px -6px rgba(212,175,55,0.4)",
        "gold-lg":  "0 0 40px -8px rgba(212,175,55,0.45)",
      },
      animation: {
        "pulse-gold":    "pulse-gold 2.5s ease-in-out infinite",
        "fade-in":       "fade-in 0.25s ease-out",
        "slide-up":      "slide-up 0.3s cubic-bezier(0.16,1,0.3,1)",
        "slide-in-left": "slide-in-left 0.25s cubic-bezier(0.16,1,0.3,1)",
        "status-pulse":  "status-pulse 2s ease-in-out infinite",
        "flow-pulse":    "flow-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(212,175,55,0.3)" },
          "50%":       { boxShadow: "0 0 20px rgba(212,175,55,0.6)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "status-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":       { opacity: "0.5", transform: "scale(0.85)" },
        },
        "flow-pulse": {
          "0%":   { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
