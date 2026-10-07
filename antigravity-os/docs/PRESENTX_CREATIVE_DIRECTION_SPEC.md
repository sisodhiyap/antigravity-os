# PRESENTX STUDIO — CREATIVE DIRECTION SPECIFICATION

**Mission**: Antigravity OS V7 — Ultimate Creative Direction Specification  
**Engine**: `PresentXCreativeDirector` (`src/presentx/engine/PresentXCreativeDirector.ts`)  
**Design System**: `PresentXDesignSystem` (`src/presentx/engine/PresentXDesignSystem.ts`)  
**Version**: 7.0.0-PROD  

---

## 1. The Creative Director Mandate

The PresentX Creative Director is not a simple text-to-slide wrapper. Its purpose is to formulate the strategic, narrative, and aesthetic identity of every generated presentation before any slide layout is assembled.

The Creative Director answers five fundamental questions:
1. **What should this deck say?** (Core Thesis)
2. **Why should the audience care?** (Audience Insight & Emotional Stakes)
3. **What should they remember?** (Primary Takeaway & Metric Anchors)
4. **How should the story progress?** (Narrative Strategy & Tension Arc)
5. **What should each slide feel like?** (Visual Metaphor & Slide Rhythm)

---

## 2. Creative Brief Architecture

Every presentation synthesized by PresentX embeds a formal `CreativeBrief`:

```typescript
export interface CreativeBrief {
  thesis: string;
  audienceInsight: string;
  narrativeStrategy: string;
  emotionalArc: string;
  visualMetaphor: string;
  designDirection: string;
  typographyDirection: string;
  colorDirection: string;
  imageDirection: string;
  chartStrategy: string;
  slideRhythm: string;
  callToAction: string;
}
```

---

## 3. Narrative & Emotional Arc Strategy

PresentX enforces an Inverted Pyramid narrative structure:
- **Phase 1: Hook & Urgency (Tension 8/10)** — Immediate confrontation with the core macro shift or problem.
- **Phase 2: Context & Paradigm Shift (Tension 5/10)** — Broad framing of legacy bottlenecks vs modern autonomous intelligence.
- **Phase 3: Structural Proof & Mechanics (Tension 4/10)** — Verified evidence, architecture diagrams, and empirical KPI data grids.
- **Phase 4: Compounding Upside & Momentum (Tension 7/10)** — 5-year compounding ROI trajectory and operational leverage.
- **Phase 5: Definitive Action / Mobilization (Tension 9/10)** — Explicit call to action and deployment roadmap.

---

## 4. Visual Directions & Palette Systems

PresentX offers 9 curated aesthetic directions calibrated for high-contrast presentation environments:

1. **FUTURISTIC (Sovereign Gold / Dark Crystalline)**: Primary `#D4AF37`, Surface `#111827`, Background `#080808`. Volumetric gold ambient lighting with Satoshi typography.
2. **EDITORIAL (Vogue Monochrome / Minimal Luxury)**: Primary `#FFFFFF`, Accent `#D4AF37`, Background `#050505`. Playfair Display serif typography with asymmetric whitespace.
3. **TECH (Cyber Cyan / Terminal Blue)**: Primary `#38BDF8`, Accent `#818CF8`, Background `#090D16`. JetBrains Mono code tokens and dense technical diagramming.
4. **CORPORATE (Executive Navy & Silver)**: Primary `#3B82F6`, Accent `#60A5FA`, Background `#0A0F1D`. Inter sans-serif with structured KPI metric cards.
5. **LUXURY (Obsidian & Champagne)**: Primary `#E5C07B`, Accent `#98C379`, Background `#040404`. High contrast gold foil borders with glassmorphism overlays.
6. **DATA_DRIVEN (Analytics Teal & Slate)**: Primary `#14B8A6`, Accent `#F59E0B`, Background `#080E14`. High data-ink ratio area and bar chart visualizations.
7. **MINIMAL (Pure Noir & Clean Line)**: Primary `#E2E8F0`, Accent `#94A3B8`, Background `#000000`. Strict grid alignment and zero unnecessary decoration.
8. **CREATIVE (Neon Amber & Violet)**: Primary `#F59E0B`, Accent `#A855F7`, Background `#0D0714`. Expressive asymmetrical layout rhythms.
9. **ACADEMIC (Deep Burgundy & Cream)**: Primary `#E11D48`, Accent `#FBBF24`, Background `#0C0407`. Structured citation callouts and evidence links.
