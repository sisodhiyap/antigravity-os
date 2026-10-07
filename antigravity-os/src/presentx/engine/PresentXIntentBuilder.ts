/**
 * PRESENTX STUDIO — INTELLIGENT INTENT BUILDER
 * PresentXIntentBuilder.ts: Decomposes natural language prompts and multi-modal
 * inputs into an editable, high-fidelity Intent/Brief Card. Clearly flags explicit
 * vs. inferred dimensions with confidence scores.
 */

import { IntentCard, PresentationType, VisualDirection } from "../types";

export class PresentXIntentBuilder {
  private static instance: PresentXIntentBuilder;

  public static getInstance(): PresentXIntentBuilder {
    if (!this.instance) {
      this.instance = new PresentXIntentBuilder();
    }
    return this.instance;
  }

  /**
   * Deconstructs a natural language brief into a structured, editable Intent Card
   */
  public buildIntentCard(rawPrompt: string): IntentCard {
    const prompt = rawPrompt.trim();
    const lower = prompt.toLowerCase();

    // 1. Slide Count Extraction
    const slideMatch = lower.match(/(\d+)\s*[- ]*slides?/);
    const hasExplicitSlides = !!slideMatch;
    const slideCount = hasExplicitSlides ? parseInt(slideMatch![1], 10) : 10;

    // 2. Project Type Detection
    let projectType: PresentationType = "PITCH_DECK";
    let isTypeExplicit = false;
    if (lower.includes("pitch deck") || lower.includes("investor")) {
      projectType = "PITCH_DECK";
      isTypeExplicit = true;
    } else if (lower.includes("case study") || lower.includes("ux case")) {
      projectType = "CASE_STUDY";
      isTypeExplicit = true;
    } else if (lower.includes("executive brief") || lower.includes("briefing") || lower.includes("board")) {
      projectType = "REPORT";
      isTypeExplicit = true;
    } else if (lower.includes("workshop") || lower.includes("training")) {
      projectType = "WORKSHOP";
      isTypeExplicit = true;
    } else if (lower.includes("proposal") || lower.includes("rfp")) {
      projectType = "PROPOSAL";
      isTypeExplicit = true;
    } else if (lower.includes("portfolio")) {
      projectType = "PORTFOLIO";
      isTypeExplicit = true;
    }

    // 3. Audience Extraction
    let audience = "Executive Leadership & Decision Makers";
    let isAudienceExplicit = false;
    if (lower.includes("creative director") || lower.includes("creative directors") || lower.includes("agency leadership") || lower.includes("agency ceo") || lower.includes("agency director") || lower.includes("agency directors")) {
      audience = "Creative Directors & Agency Leadership";
      isAudienceExplicit = true;
    } else if (lower.includes("board")) {
      audience = "Board of Directors & Executive Leadership";
      isAudienceExplicit = true;
    } else if (lower.includes("investor") || lower.includes("vc") || lower.includes("angel")) {
      audience = "Venture Capital Investors & Partners";
      isAudienceExplicit = true;
    } else if (lower.includes("engineer") || lower.includes("developer") || lower.includes("architect")) {
      audience = "Technical Directors & Lead Architects";
      isAudienceExplicit = true;
    } else if (lower.includes("client") || lower.includes("customer")) {
      audience = "Prospective Enterprise Clients";
      isAudienceExplicit = true;
    }

    // 4. Visual Style & Tone
    let visualStyle: VisualDirection = "FUTURISTIC";
    let isStyleExplicit = false;
    if (lower.includes("editorial") || lower.includes("vogue") || lower.includes("magazine")) {
      visualStyle = "EDITORIAL";
      isStyleExplicit = true;
    } else if (lower.includes("minimal") || lower.includes("clean") || lower.includes("simple")) {
      visualStyle = "MINIMAL";
      isStyleExplicit = true;
    } else if (lower.includes("luxury") || lower.includes("dark gold") || lower.includes("premium")) {
      visualStyle = "LUXURY";
      isStyleExplicit = true;
    } else if (lower.includes("corporate") || lower.includes("formal") || lower.includes("board")) {
      visualStyle = "CORPORATE";
      isStyleExplicit = true;
    } else if (lower.includes("data") || lower.includes("analytics") || lower.includes("chart")) {
      visualStyle = "DATA_DRIVEN";
      isStyleExplicit = true;
    }

    // 5. Tone
    let tone = "Authoritative & Strategic";
    let isToneExplicit = false;
    if (lower.includes("cinematic") || lower.includes("dramatic")) {
      tone = "Cinematic & Visionary";
      isToneExplicit = true;
    } else if (lower.includes("persuasive") || lower.includes("urgent")) {
      tone = "High-Impact & Persuasive";
      isToneExplicit = true;
    }

    // 6. Speaker Notes Requirement
    const hasNotesExplicit = lower.includes("speaker notes") || lower.includes("notes") || lower.includes("presenter notes");
    const speakerNotesRequired = hasNotesExplicit ? true : true; // Default true for executive decks

    // 7. Export Target
    let exportTarget: "PPTX" | "PDF" | "HTML" | "JSON" = "PPTX";
    let isExportExplicit = false;
    if (lower.includes("pptx") || lower.includes("powerpoint")) {
      exportTarget = "PPTX";
      isExportExplicit = true;
    } else if (lower.includes("pdf")) {
      exportTarget = "PDF";
      isExportExplicit = true;
    }

    return {
      projectType: {
        value: projectType,
        inferred: !isTypeExplicit,
        confidence: isTypeExplicit ? 0.98 : 0.82,
        sourceText: isTypeExplicit ? prompt : undefined,
      },
      audience: {
        value: audience,
        inferred: !isAudienceExplicit,
        confidence: isAudienceExplicit ? 0.95 : 0.78,
      },
      objective: {
        value: `Demonstrate strategic transformation and market upside of ${prompt.slice(0, 50)}...`,
        inferred: true,
        confidence: 0.85,
      },
      purpose: {
        value: "Strategic alignment and executive buy-in",
        inferred: true,
        confidence: 0.80,
      },
      tone: {
        value: tone,
        inferred: !isToneExplicit,
        confidence: isToneExplicit ? 0.95 : 0.75,
      },
      slideCount: {
        value: Math.min(30, Math.max(1, slideCount)),
        inferred: !hasExplicitSlides,
        confidence: hasExplicitSlides ? 1.0 : 0.80,
      },
      contentDepth: {
        value: "EXECUTIVE",
        inferred: true,
        confidence: 0.88,
      },
      visualStyle: {
        value: visualStyle,
        inferred: !isStyleExplicit,
        confidence: isStyleExplicit ? 0.95 : 0.80,
      },
      brand: {
        value: "Antigravity OS Sovereign Standard",
        inferred: true,
        confidence: 0.70,
      },
      language: {
        value: "English (US)",
        inferred: true,
        confidence: 0.95,
      },
      factualityLevel: {
        value: "STRICT_VERIFIED",
        inferred: !lower.includes("verified facts"),
        confidence: 0.95,
      },
      speakerNotesRequired: {
        value: speakerNotesRequired,
        inferred: !hasNotesExplicit,
        confidence: hasNotesExplicit ? 1.0 : 0.85,
      },
      callToAction: {
        value: "Schedule execution roadmap alignment and approve deployment.",
        inferred: true,
        confidence: 0.80,
      },
      exportTarget: {
        value: exportTarget,
        inferred: !isExportExplicit,
        confidence: isExportExplicit ? 1.0 : 0.90,
      },
    };
  }
}
