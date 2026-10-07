# PRESENTX STUDIO — DECK DIRECTOR SPECIFICATION

**Mission**: Antigravity OS V7 — Deck Director Specification  
**Engine**: `PresentXDeckDirector` (`src/presentx/engine/PresentXDeckDirector.ts`)  
**Version**: 7.0.0-PROD  

---

## 1. Deck Director Purpose

Traditional presentation tools score individual slides in isolation. The **PresentX Deck Director** evaluates the holistic presentation architecture across 8 core dimensions:

1. **Narrative Continuity**: Does the story arc hold together seamlessly from opening hook to closing CTA?
2. **Visual Rhythm & Variety**: Are layouts alternated to sustain cognitive engagement without visual fatigue?
3. **Repetition Radar**: Are identical card or column containers repeated on adjacent slides?
4. **Information Hierarchy**: Are takeaways immediately legible in under 3 seconds?
5. **Cognitive Load & Word Density**: Does any slide exceed executive glanceability thresholds (>60 words)?
6. **Factuality & Evidence Grounding**: Is every factual claim linked to an E3 cryptographic proof?
7. **Accessibility & Contrast**: Does every slide meet WCAG 2.2 AA (>= 4.5:1 text contrast)?
8. **Brand Consistency**: Are fonts, colors, and border radii uniformly governed?

---

## 2. Deck Health Telemetry Model

```typescript
export interface DeckHealth {
  narrative: number;           // 0 - 100
  storyFlow: number;           // 0 - 100
  visualVariety: number;       // 0 - 100
  hierarchy: number;           // 0 - 100
  factuality: number;          // 0 - 100
  accessibility: number;       // 0 - 100
  brandConsistency: number;    // 0 - 100
  cognitiveLoadScore: number;  // 0 - 100
  overallScore: number;        // 0 - 100
  repetitionWarnings: string[];
  recommendations: DeckRecommendation[];
}
```

---

## 3. Repetition Detection & Bridge Slide Recommendations

When the Deck Director analyzes a deck, it inspects layout sequence patterns:
- **Rule 1 (Adjacent Repetition)**: If Slide $N$ and Slide $N+1$ share the same layout (e.g. two consecutive `METRICS_GRID` or `THREE_COLUMN` slides), a medium-severity repetition warning is triggered, recommending an Editorial or SVG diagram substitution.
- **Rule 2 (Density Cap)**: If more than 60% of total slides in a deck rely on structured card containers, a high-severity cognitive load alert is raised.
- **Rule 3 (Story Gaps)**: If a presentation transitions from Problem to Solution without an empirical bridge slide, the Deck Director recommends inserting an Evidence or KPI transition slide.
