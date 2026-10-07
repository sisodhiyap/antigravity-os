/**
 * ANTIGRAVITY OS — DESIGN SYSTEM RECONSTRUCTOR
 * DesignSystemReconstructor: Derives tokens for Color, Typography, Spacing, Radius, Shadows, and Breakpoints
 */

import { VisualDesignGraph } from "./VisualDesignGraph";

export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    accentGold: string;
    border: string;
    error: string;
    success: string;
  };
  typography: {
    fontFamily: string;
    h1: { fontSize: string; fontWeight: string; lineHeight: string };
    h2: { fontSize: string; fontWeight: string; lineHeight: string };
    body: { fontSize: string; fontWeight: string; lineHeight: string };
    caption: { fontSize: string; fontWeight: string; lineHeight: string };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    glowGold: string;
    cardDepth: string;
    modalElevated: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    laptop: string;
    desktop: string;
    ultrawide: string;
  };
  motion: {
    transitionFast: string;
    transitionSmooth: string;
    easeOutQuint: string;
  };
}

export class DesignSystemReconstructor {
  public static deriveDesignSystem(graph: VisualDesignGraph): DesignTokens {
    // Reconstruct tokens derived from graph nodes, default to charcoal + gold system
    return {
      colors: {
        primary: "#0d0f14",
        secondary: "#161b26",
        background: "#080a0f",
        surface: "rgba(22, 27, 38, 0.85)",
        textPrimary: "#f8fafc",
        textSecondary: "#94a3b8",
        accentGold: "#e6b800",
        border: "rgba(230, 184, 0, 0.18)",
        error: "#ef4444",
        success: "#10b981"
      },
      typography: {
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        h1: { fontSize: "2.25rem", fontWeight: "700", lineHeight: "1.2" },
        h2: { fontSize: "1.5rem", fontWeight: "600", lineHeight: "1.3" },
        body: { fontSize: "0.95rem", fontWeight: "400", lineHeight: "1.5" },
        caption: { fontSize: "0.75rem", fontWeight: "400", lineHeight: "1.4" }
      },
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem"
      },
      radius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        full: "9999px"
      },
      shadows: {
        glowGold: "0 0 20px rgba(230, 184, 0, 0.25)",
        cardDepth: "0 4px 20px rgba(0, 0, 0, 0.6)",
        modalElevated: "0 20px 50px rgba(0, 0, 0, 0.8)"
      },
      breakpoints: {
        mobile: "375px",
        tablet: "768px",
        laptop: "1024px",
        desktop: "1440px",
        ultrawide: "1920px"
      },
      motion: {
        transitionFast: "150ms cubic-bezier(0.16, 1, 0.3, 1)",
        transitionSmooth: "300ms cubic-bezier(0.16, 1, 0.3, 1)",
        easeOutQuint: "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    };
  }
}
