/**
 * PRESENTX STUDIO — CREATIVE DIRECTOR ENGINE
 * PresentXCreativeDirector.ts: Evaluates presentation intent and synthesizes
 * an authoritative Creative Brief determining thesis, emotional arc, visual metaphor,
 * design language, and slide rhythm.
 */

import { PresentationBrief, CreativeBrief, VisualDirection } from "../types";
import { VISUAL_DIRECTIONS } from "./PresentXDesignSystem";

export class PresentXCreativeDirector {
  private static instance: PresentXCreativeDirector;

  public static getInstance(): PresentXCreativeDirector {
    if (!this.instance) {
      this.instance = new PresentXCreativeDirector();
    }
    return this.instance;
  }

  /**
   * Synthesizes a strategic creative brief for deck generation
   */
  public synthesizeCreativeBrief(
    brief: PresentationBrief,
    rawPrompt: string,
    visualDirection: VisualDirection
  ): CreativeBrief {
    const styleInfo = VISUAL_DIRECTIONS[visualDirection] || VISUAL_DIRECTIONS.FUTURISTIC;
    const isExecutive = brief.audience.toLowerCase().includes("executive") || brief.audience.toLowerCase().includes("director") || brief.audience.toLowerCase().includes("ceo") || brief.audience.toLowerCase().includes("board");
    const isTechnical = brief.audience.toLowerCase().includes("engineer") || brief.audience.toLowerCase().includes("developer") || rawPrompt.toLowerCase().includes("pipeline") || rawPrompt.toLowerCase().includes("architecture");

    // Core Thesis formulation
    const cleanTopic = brief.title.replace(/^(How|Why|The|A|An)\s+/i, "");
    const thesis = isExecutive
      ? `Accelerating strategic transformation through ${cleanTopic} unlocks compounding operational leverage, margin expansion, and decisive competitive moat.`
      : `Adopting modern ${cleanTopic} fundamentally reconstitutes creative and operational velocity while guaranteeing deterministic quality and control.`;

    // Audience Insight
    const audienceInsight = isExecutive
      ? "Leadership seeks immediate clarity on return on investment, defensive positioning, risk containment, and predictable execution velocity."
      : isTechnical
      ? "Practitioners require rigorous architectural proof, system mechanics, concrete data flows, and zero-compromise reliability."
      : "Stakeholders demand clear contextual understanding, compelling narrative momentum, and unambiguous next actions.";

    // Narrative Strategy & Emotional Arc
    const narrativeStrategy = "Inverted Pyramid (Headline Takeaway → Structural Proof → Mechanics → Compounding Upside → Definitive Call to Action)";
    const emotionalArc = "Urgent Problem Realization (Tension 8/10) → Paradigm Shift & Discovery (Tension 5/10) → Structural Proof & Validation (Tension 4/10) → Strategic Empowerment & Mobilization (Tension 9/10)";

    // Visual Metaphors
    const visualMetaphor = visualDirection === "FUTURISTIC" || visualDirection === "TECH"
      ? "Dynamic interconnected neural graph nodes, luminescent volumetric paths, and dark crystalline architectures."
      : visualDirection === "LUXURY" || visualDirection === "EDITORIAL"
      ? "Restrained high-contrast typography, generous negative space, refined metallic accents, and editorial asymmetry."
      : "Clean modular information blocks, calibrated hierarchy, and authoritative corporate precision.";

    // Directional specs
    const typographyDirection = `Primary Heading: ${styleInfo.tokens?.fontHeading || "Satoshi"} (High Contrast, Bold) • Body: ${styleInfo.tokens?.fontBody || "Inter"} (Clear, Readable Line Height)`;
    const colorDirection = `Dominant Palette: ${styleInfo.name} • Primary: ${styleInfo.tokens?.primaryColor || "#D4AF37"} • Accent: ${styleInfo.tokens?.accentColor || "#38BDF8"} • Background: ${styleInfo.tokens?.backgroundColor || "#080808"}`;
    const imageDirection = "Cinematic 35mm wide-aperture photography or high-fidelity technical diagrams. Strictly avoid generic stock clip-art.";
    const chartStrategy = "Data-ink maximization: High contrast data series, embedded direct labels, explicit provenance tagging, zero 3D visual distortion.";
    const slideRhythm = "Alternating high-impact focal slides with structured multi-column proof layouts to sustain visual engagement without cognitive fatigue.";
    const callToAction = brief.callToAction || `Mobilize initial execution phase and deploy ${brief.brandName || "strategic framework"}.`;

    return {
      thesis,
      audienceInsight,
      narrativeStrategy,
      emotionalArc,
      visualMetaphor,
      designDirection: `${styleInfo.name} (${visualDirection})`,
      typographyDirection,
      colorDirection,
      imageDirection,
      chartStrategy,
      slideRhythm,
      callToAction,
    };
  }
}
