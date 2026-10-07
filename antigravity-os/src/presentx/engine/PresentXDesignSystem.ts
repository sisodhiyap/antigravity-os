/**
 * PRESENTX STUDIO — DESIGN SYSTEM & VISUAL DIRECTION ENGINE
 * PresentXDesignSystem.ts: Token generators, typography, calibrated color palettes,
 * and real structured SVG charts & vector diagrams.
 */

import { VisualDirection, DesignTokens, ChartSpecification, DiagramSpecification } from "../types";

export const VISUAL_DIRECTIONS: Record<VisualDirection, { name: string; description: string; tokens: DesignTokens }> = {
  EDITORIAL: {
    name: "Editorial Serif",
    description: "High-contrast editorial elegance with warm ivory backgrounds and refined serif headers.",
    tokens: {
      primaryColor: "#1A1A1A",
      secondaryColor: "#7A6B58",
      accentColor: "#C98A4C",
      backgroundColor: "#FBF9F5",
      surfaceColor: "#FFFFFF",
      textColor: "#1C1917",
      textSecondaryColor: "#57534E",
      fontHeading: "Newsreader, Playfair Display, Georgia, serif",
      fontBody: "Inter, -apple-system, sans-serif",
      borderRadius: "0.25rem",
      cardStyle: "SOLID",
    },
  },
  MINIMAL: {
    name: "Swiss Minimalist",
    description: "Pristine white space, strict geometric grids, and crisp Swiss typography.",
    tokens: {
      primaryColor: "#0F172A",
      secondaryColor: "#64748B",
      accentColor: "#3B82F6",
      backgroundColor: "#F8FAFC",
      surfaceColor: "#FFFFFF",
      textColor: "#0F172A",
      textSecondaryColor: "#64748B",
      fontHeading: "Inter, system-ui, sans-serif",
      fontBody: "Inter, system-ui, sans-serif",
      borderRadius: "0.5rem",
      cardStyle: "OUTLINE",
    },
  },
  CORPORATE: {
    name: "Executive Trust",
    description: "Deep navy and slate palette engineered for boardrooms, enterprise proposals, and investor trust.",
    tokens: {
      primaryColor: "#0F2744",
      secondaryColor: "#334E68",
      accentColor: "#0284C7",
      backgroundColor: "#F0F4F8",
      surfaceColor: "#FFFFFF",
      textColor: "#102A43",
      textSecondaryColor: "#486581",
      fontHeading: "Inter, Satoshi, sans-serif",
      fontBody: "Inter, sans-serif",
      borderRadius: "0.5rem",
      cardStyle: "SOLID",
    },
  },
  TECH: {
    name: "Cyber Tech",
    description: "Modern developer aesthetics with dark graphite background and neon cyan accents.",
    tokens: {
      primaryColor: "#00F0FF",
      secondaryColor: "#7000FF",
      accentColor: "#00F0FF",
      backgroundColor: "#0B0F17",
      surfaceColor: "#111827",
      textColor: "#F3F4F6",
      textSecondaryColor: "#9CA3AF",
      fontHeading: "JetBrains Mono, Fira Code, monospace",
      fontBody: "Inter, sans-serif",
      borderRadius: "0.75rem",
      cardStyle: "GLASS",
    },
  },
  FUTURISTIC: {
    name: "Antigravity Gold (Signature)",
    description: "Deep obsidian canvas paired with signature Antigravity gold glow and glassmorphism.",
    tokens: {
      primaryColor: "#D4AF37",
      secondaryColor: "#F0C75E",
      accentColor: "#FFD978",
      backgroundColor: "#080808",
      surfaceColor: "#121215",
      textColor: "#F5F5F5",
      textSecondaryColor: "#A3A3A3",
      fontHeading: "Inter, Satoshi, sans-serif",
      fontBody: "Inter, sans-serif",
      borderRadius: "0.875rem",
      cardStyle: "GLASS",
    },
  },
  CREATIVE: {
    name: "Studio Bold",
    description: "Expressive color blocking, asymmetric rhythm, and high-impact agency design.",
    tokens: {
      primaryColor: "#FF3366",
      secondaryColor: "#6C5CE7",
      accentColor: "#00D2D3",
      backgroundColor: "#0D0C1D",
      surfaceColor: "#16152B",
      textColor: "#FFFFFF",
      textSecondaryColor: "#B2B1C2",
      fontHeading: "Space Grotesk, Syne, sans-serif",
      fontBody: "Inter, sans-serif",
      borderRadius: "1rem",
      cardStyle: "GRADIENT",
    },
  },
  LUXURY: {
    name: "Velvet Obsidian",
    description: "Champagne gold against charcoal velvet, tailored for ultra-premium brands and luxury assets.",
    tokens: {
      primaryColor: "#E5C07B",
      secondaryColor: "#C678DD",
      accentColor: "#98C379",
      backgroundColor: "#0A0A0C",
      surfaceColor: "#141418",
      textColor: "#EAEAEA",
      textSecondaryColor: "#8E8E93",
      fontHeading: "Cinzel, Cormorant Garamond, serif",
      fontBody: "Inter, sans-serif",
      borderRadius: "0.375rem",
      cardStyle: "GLASS",
    },
  },
  DATA_DRIVEN: {
    name: "Quant Analytics",
    description: "High information density, rich telemetry cards, and vibrant multi-series chart palettes.",
    tokens: {
      primaryColor: "#10B981",
      secondaryColor: "#6366F1",
      accentColor: "#F59E0B",
      backgroundColor: "#090D16",
      surfaceColor: "#0F172A",
      textColor: "#F8FAFC",
      textSecondaryColor: "#94A3B8",
      fontHeading: "Inter, monospace",
      fontBody: "Inter, sans-serif",
      borderRadius: "0.5rem",
      cardStyle: "SOLID",
    },
  },
  ACADEMIC: {
    name: "Scholarly Research",
    description: "Structured footnotes, side-by-side evidence columns, and neutral scholarly clarity.",
    tokens: {
      primaryColor: "#2D3748",
      secondaryColor: "#4A5568",
      accentColor: "#3182CE",
      backgroundColor: "#F7FAFC",
      surfaceColor: "#FFFFFF",
      textColor: "#1A202C",
      textSecondaryColor: "#718096",
      fontHeading: "Merriweather, Georgia, serif",
      fontBody: "Inter, sans-serif",
      borderRadius: "0.25rem",
      cardStyle: "OUTLINE",
    },
  },
};

export class PresentXDesignSystem {
  public static getTokensForDirection(direction: VisualDirection): DesignTokens {
    return VISUAL_DIRECTIONS[direction]?.tokens || VISUAL_DIRECTIONS.FUTURISTIC.tokens;
  }

  /**
   * Renders real vector SVG charts for data visualization
   */
  public static renderChartSvg(chart: ChartSpecification, tokens: DesignTokens, width = 600, height = 300): string {
    const data = chart.data || [];
    if (data.length === 0) return "<svg></svg>";

    const padding = 40;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;
    const maxVal = Math.max(...data.map((d) => d.value), 1);

    if (chart.type === "DONUT" || chart.type === "PIE") {
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.min(chartW, chartH) / 2 - 10;
      const innerR = chart.type === "DONUT" ? r * 0.58 : 0;
      const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
      let startAngle = 0;

      const colors = [tokens.primaryColor, tokens.accentColor, tokens.secondaryColor, "#6366F1", "#EC4899", "#14B8A6"];

      const slices = data.map((d, i) => {
        const sliceAngle = (d.value / total) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);

        const ix1 = cx + innerR * Math.cos(endAngle);
        const iy1 = cy + innerR * Math.sin(endAngle);
        const ix2 = cx + innerR * Math.cos(startAngle);
        const iy2 = cy + innerR * Math.sin(startAngle);

        const largeArc = sliceAngle > Math.PI ? 1 : 0;
        const color = colors[i % colors.length];

        const pathData = innerR > 0
          ? `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`
          : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

        startAngle = endAngle;
        return `<path d="${pathData}" fill="${color}" stroke="${tokens.backgroundColor}" stroke-width="2" opacity="0.9" />`;
      }).join("\n");

      return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%">
        ${slices}
        <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" fill="${tokens.textColor}" font-size="12" font-family="${tokens.fontHeading}" font-weight="bold">${chart.title}</text>
      </svg>`;
    }

    if (chart.type === "LINE" || chart.type === "AREA") {
      const step = chartW / Math.max(data.length - 1, 1);
      const points = data.map((d, i) => {
        const x = padding + i * step;
        const y = padding + chartH - (d.value / maxVal) * chartH;
        return { x, y, label: d.label, val: d.value };
      });

      const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
      const areaPath = `M ${points[0].x} ${padding + chartH} L ${points.map((p) => `${p.x} ${p.y}`).join(" L ")} L ${points[points.length - 1].x} ${padding + chartH} Z`;

      return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${tokens.primaryColor}" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="${tokens.primaryColor}" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <!-- Grid lines -->
        <line x1="${padding}" y1="${padding + chartH}" x2="${padding + chartW}" y2="${padding + chartH}" stroke="${tokens.textSecondaryColor}" stroke-opacity="0.2" stroke-width="1"/>
        <line x1="${padding}" y1="${padding + chartH / 2}" x2="${padding + chartW}" y2="${padding + chartH / 2}" stroke="${tokens.textSecondaryColor}" stroke-opacity="0.1" stroke-dasharray="4" stroke-width="1"/>
        
        <!-- Area fill -->
        <path d="${areaPath}" fill="url(#chartGrad)"/>
        
        <!-- Line stroke -->
        <polyline points="${polylinePoints}" fill="none" stroke="${tokens.primaryColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        
        <!-- Data dots -->
        ${points.map((p) => `
          <circle cx="${p.x}" cy="${p.y}" r="4" fill="${tokens.surfaceColor}" stroke="${tokens.primaryColor}" stroke-width="2"/>
          <text x="${p.x}" y="${padding + chartH + 18}" text-anchor="middle" fill="${tokens.textSecondaryColor}" font-size="10" font-family="${tokens.fontBody}">${p.label}</text>
        `).join("")}
      </svg>`;
    }

    // Default: Structured Bar Chart
    const barWidth = Math.min((chartW / data.length) * 0.6, 48);
    const spacing = chartW / data.length;

    const bars = data.map((d, i) => {
      const barH = (d.value / maxVal) * chartH;
      const x = padding + i * spacing + (spacing - barWidth) / 2;
      const y = padding + chartH - barH;

      return `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="4" fill="${tokens.primaryColor}" opacity="0.85"/>
        <text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" fill="${tokens.textColor}" font-size="10" font-weight="bold" font-family="${tokens.fontBody}">${d.value}${chart.units || ""}</text>
        <text x="${x + barWidth / 2}" y="${padding + chartH + 18}" text-anchor="middle" fill="${tokens.textSecondaryColor}" font-size="10" font-family="${tokens.fontBody}">${d.label}</text>
      `;
    }).join("\n");

    return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      <!-- Baseline -->
      <line x1="${padding}" y1="${padding + chartH}" x2="${padding + chartW}" y2="${padding + chartH}" stroke="${tokens.textSecondaryColor}" stroke-opacity="0.2" stroke-width="1"/>
      ${bars}
    </svg>`;
  }

  /**
   * Renders real vector SVG diagrams for workflows & architectures
   */
  public static renderDiagramSvg(diagram: DiagramSpecification, tokens: DesignTokens, width = 600, height = 260): string {
    const steps = diagram.steps || [];
    if (steps.length === 0) return "<svg></svg>";

    if (diagram.type === "TIMELINE" || diagram.type === "PROCESS") {
      const padding = 30;
      const usableW = width - padding * 2;
      const stepW = usableW / steps.length;
      const lineY = height / 2 - 10;

      const nodes = steps.map((s, i) => {
        const cx = padding + i * stepW + stepW / 2;
        return `
          <g>
            <circle cx="${cx}" cy="${lineY}" r="16" fill="${tokens.surfaceColor}" stroke="${tokens.primaryColor}" stroke-width="2"/>
            <text x="${cx}" y="${lineY + 4}" text-anchor="middle" fill="${tokens.primaryColor}" font-size="11" font-weight="bold" font-family="${tokens.fontHeading}">${s.number}</text>
            <text x="${cx}" y="${lineY + 36}" text-anchor="middle" fill="${tokens.textColor}" font-size="12" font-weight="bold" font-family="${tokens.fontHeading}">${s.title}</text>
            <text x="${cx}" y="${lineY + 52}" text-anchor="middle" fill="${tokens.textSecondaryColor}" font-size="9" font-family="${tokens.fontBody}" width="${stepW - 10}">${s.description.slice(0, 30)}</text>
          </g>
        `;
      }).join("\n");

      return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%">
        <!-- Connecting Line -->
        <line x1="${padding + stepW / 2}" y1="${lineY}" x2="${width - padding - stepW / 2}" y2="${lineY}" stroke="${tokens.primaryColor}" stroke-opacity="0.3" stroke-width="3" stroke-dasharray="6"/>
        ${nodes}
      </svg>`;
    }

    // Default: 2x2 Matrix or Process Grid
    return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="8" fill="${tokens.surfaceColor}" stroke="${tokens.primaryColor}" stroke-opacity="0.2" stroke-width="1"/>
      <text x="${width / 2}" y="45" text-anchor="middle" fill="${tokens.textColor}" font-size="14" font-weight="bold" font-family="${tokens.fontHeading}">${diagram.title}</text>
      ${steps.map((s, i) => {
        const x = 40 + (i % 2) * (width / 2 - 30);
        const y = 80 + Math.floor(i / 2) * 70;
        return `
          <g>
            <rect x="${x}" y="${y}" width="${width / 2 - 50}" height="56" rx="6" fill="${tokens.backgroundColor}" stroke="${tokens.primaryColor}" stroke-opacity="0.15"/>
            <text x="${x + 12}" y="${y + 22}" fill="${tokens.primaryColor}" font-size="11" font-weight="bold" font-family="${tokens.fontHeading}">${s.number}. ${s.title}</text>
            <text x="${x + 12}" y="${y + 40}" fill="${tokens.textSecondaryColor}" font-size="9" font-family="${tokens.fontBody}">${s.description.slice(0, 38)}</text>
          </g>
        `;
      }).join("\n")}
    </svg>`;
  }
}
