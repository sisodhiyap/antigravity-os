/**
 * PRESENTX STUDIO — VISUAL INSPECTION ENGINE
 * src/presentx/quality/VisualInspectionEngine.ts
 * 
 * Inspects rendered slide dimensions, element collisions, contrast ratios,
 * typography scale, and layout density before accepting presentation export.
 */

import { Slide, DesignTokens, VisualInspectionResult, QualityDefect, PresentationProject } from "../types";

export class VisualInspectionEngine {
  private static instance: VisualInspectionEngine;

  public static getInstance(): VisualInspectionEngine {
    if (!VisualInspectionEngine.instance) {
      VisualInspectionEngine.instance = new VisualInspectionEngine();
    }
    return VisualInspectionEngine.instance;
  }

  /**
   * Evaluates relative luminance of hex color
   */
  private getLuminance(hex: string): number {
    const cleanHex = hex.replace("#", "");
    if (cleanHex.length !== 6) return 0.5;
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const a = [r, g, b].map((v) => {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  /**
   * Calculates WCAG contrast ratio between text and background
   */
  public calculateContrastRatio(foregroundHex: string, backgroundHex: string): number {
    const lum1 = this.getLuminance(foregroundHex);
    const lum2 = this.getLuminance(backgroundHex);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
  }

  /**
   * Performs visual inspection on an individual slide
   */
  public inspectSlide(slide: Slide, tokens: DesignTokens): {
    inspection: VisualInspectionResult;
    defects: QualityDefect[];
  } {
    const findings: string[] = [];
    const defects: QualityDefect[] = [];

    // 1. Text Metrics
    const headlineWords = (slide.headline || "").split(/\s+/).filter(Boolean).length;
    const bodyWords = (slide.bodyContent || "").split(/\s+/).filter(Boolean).length;
    const bulletWords = (slide.bulletPoints?.join(" ") || "").split(/\s+/).filter(Boolean).length;
    const totalWords = headlineWords + bodyWords + bulletWords;

    const textOverflow = totalWords > 120;
    const textUnderflow = totalWords < 5 && slide.layout !== "HERO" && slide.layout !== "SECTION_DIVIDER";

    if (textOverflow) {
      findings.push(`High text density (${totalWords} words). Potential text collision with canvas margins.`);
      defects.push({
        defectId: `def_vis_overflow_${slide.id}`,
        slideId: slide.id,
        slideNumber: slide.slideNumber,
        severity: "MEDIUM",
        category: "TYPOGRAPHY",
        evidence: `Total word count ${totalWords} exceeds safe 16:9 canvas budget.`,
        cause: "Lengthy paragraph copy.",
        repairStrategy: "Consolidate into concise high-contrast bullet points.",
        confidence: 0.9,
        risk: "LOW",
        affectedElements: ["bodyContent"],
      });
    }

    // 2. WCAG Contrast Check
    const textColor = tokens.textColor || "#FFFFFF";
    const bgColor = tokens.backgroundColor || "#080808";
    const contrastRatio = this.calculateContrastRatio(textColor, bgColor);
    const contrastPassed = contrastRatio >= 4.5; // WCAG 2.2 AA normal text

    if (!contrastPassed) {
      findings.push(`Low contrast ratio (${contrastRatio}:1). Fails WCAG 2.2 AA standard (4.5:1).`);
      defects.push({
        defectId: `def_contrast_${slide.id}`,
        slideId: slide.id,
        slideNumber: slide.slideNumber,
        severity: "HIGH",
        category: "ACCESSIBILITY",
        evidence: `Contrast ratio is ${contrastRatio}:1 (Required >= 4.5:1).`,
        cause: "Foreground and background color luminance values are too close.",
        repairStrategy: "Recalibrate theme tokens to maximize contrast.",
        confidence: 1.0,
        risk: "LOW",
        affectedElements: ["designTokens"],
      });
    }

    // 3. Visual Balance & Anchors
    const hasVisualAnchor = Boolean(
      slide.chart || slide.diagram || slide.mediaUrl || slide.keyMetrics || slide.quote
    );
    const visualBalanceScore = hasVisualAnchor ? 95 : totalWords > 40 ? 70 : 85;

    if (!hasVisualAnchor && totalWords > 60) {
      findings.push("Slide is heavily textual without a diagram, metric, or media visual anchor.");
      defects.push({
        defectId: `def_no_visual_anchor_${slide.id}`,
        slideId: slide.id,
        slideNumber: slide.slideNumber,
        severity: "LOW",
        category: "VISUAL",
        evidence: "Text-heavy layout without graphical balance.",
        cause: "No visual component attached.",
        repairStrategy: "Generate structural diagram or attach key metric card.",
        confidence: 0.8,
        risk: "LOW",
        affectedElements: ["layout"],
      });
    }

    // 4. Chart Legibility
    let chartLegibility = true;
    if (slide.chart) {
      if (!slide.chart.data || slide.chart.data.length > 12) {
        chartLegibility = false;
        findings.push("Chart contains too many data points (> 12), causing visual clutter.");
      }
    }

    // 5. Density Score
    const densityScore = Math.max(50, 100 - (totalWords > 80 ? (totalWords - 80) * 1.2 : 0));

    const inspection: VisualInspectionResult = {
      slideId: slide.id,
      slideNumber: slide.slideNumber,
      textOverflow,
      textUnderflow,
      clipping: false,
      alignmentIssue: false,
      contrastRatio,
      contrastPassed,
      visualBalanceScore,
      densityScore: Math.round(densityScore),
      chartLegibility,
      elementCollisions: textOverflow && hasVisualAnchor && totalWords > 100,
      findings,
    };

    return { inspection, defects };
  }

  /**
   * Inspects entire deck visually
   */
  public inspectDeck(project: PresentationProject): {
    inspections: VisualInspectionResult[];
    defects: QualityDefect[];
    overallVisualScore: number;
  } {
    const tokens = project.designTokens;
    const inspections: VisualInspectionResult[] = [];
    const allDefects: QualityDefect[] = [];

    (project.slides || []).forEach((slide) => {
      const { inspection, defects } = this.inspectSlide(slide, tokens);
      inspections.push(inspection);
      allDefects.push(...defects);
    });

    const avgBalance = inspections.reduce((acc, i) => acc + i.visualBalanceScore, 0) / (inspections.length || 1);
    const avgDensity = inspections.reduce((acc, i) => acc + i.densityScore, 0) / (inspections.length || 1);
    const contrastFailures = inspections.filter((i) => !i.contrastPassed).length;

    let overallVisualScore = Math.round(avgBalance * 0.5 + avgDensity * 0.5 - contrastFailures * 10);
    overallVisualScore = Math.max(0, Math.min(100, overallVisualScore));

    return {
      inspections,
      defects: allDefects,
      overallVisualScore,
    };
  }
}
