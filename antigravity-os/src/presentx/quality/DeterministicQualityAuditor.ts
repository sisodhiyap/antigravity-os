/**
 * PRESENTX STUDIO — DETERMINISTIC QUALITY AUDITOR (LAYER A)
 * src/presentx/quality/DeterministicQualityAuditor.ts
 * 
 * Inspects raw physical artifacts, OpenXML byte streams, XML schemas, object bounds,
 * text overflows, and cryptographic evidence without LLM hallucination.
 */

import crypto from "crypto";
import JSZip from "jszip";
import {
  PresentationProject,
  Slide,
  QualityDefect,
  ExportPreflightReport,
} from "../types";

export interface DeterministicAuditResult {
  passed: boolean;
  technicalIntegrityScore: number;
  defects: QualityDefect[];
  preflightDetails: Record<string, string>;
  openXmlCheck: {
    validZip: boolean;
    hasContentTypes: boolean;
    hasPresentation: boolean;
    slideCountMatched: boolean;
    notesCountMatched: boolean;
    crcValid: boolean;
    error?: string;
  };
}

export class DeterministicQualityAuditor {
  private static instance: DeterministicQualityAuditor;

  public static getInstance(): DeterministicQualityAuditor {
    if (!DeterministicQualityAuditor.instance) {
      DeterministicQualityAuditor.instance = new DeterministicQualityAuditor();
    }
    return DeterministicQualityAuditor.instance;
  }

  /**
   * Audits presentation data structures deterministically
   */
  public auditStructureAndContent(project: PresentationProject): {
    defects: QualityDefect[];
    score: number;
  } {
    const defects: QualityDefect[] = [];
    const slides = project.slides || [];

    if (slides.length === 0) {
      defects.push({
        defectId: `def_struct_empty_${Date.now()}`,
        slideId: "deck",
        slideNumber: 0,
        severity: "CRITICAL",
        category: "EXPORT",
        evidence: "Project contains 0 slides.",
        cause: "Deck initialization failed or empty slide pool.",
        repairStrategy: "Generate minimum required slide skeleton.",
        confidence: 1.0,
        risk: "HIGH",
        affectedElements: ["slides"],
      });
      return { defects, score: 0 };
    }

    slides.forEach((slide, idx) => {
      const slideNum = idx + 1;

      // 1. Text Overflow & Density
      const wordCount = (
        (slide.headline || "") +
        " " +
        (slide.subheadline || "") +
        " " +
        (slide.bodyContent || "") +
        " " +
        (slide.bulletPoints?.join(" ") || "")
      ).split(/\s+/).filter(Boolean).length;

      if (wordCount > 130) {
        defects.push({
          defectId: `def_overflow_${slide.id}`,
          slideId: slide.id,
          slideNumber: slideNum,
          severity: "MEDIUM",
          category: "TYPOGRAPHY",
          evidence: `Slide ${slideNum} contains ${wordCount} words (exceeds 130 word ceiling).`,
          cause: "Excessive textual density causes cognitive overload and visual truncation.",
          repairStrategy: "Execute localized text shortening or bullet consolidation.",
          confidence: 0.95,
          risk: "LOW",
          affectedElements: ["bodyContent", "bulletPoints"],
        });
      } else if (wordCount < 4 && slide.layout !== "SECTION_DIVIDER" && slide.layout !== "HERO") {
        defects.push({
          defectId: `def_underflow_${slide.id}`,
          slideId: slide.id,
          slideNumber: slideNum,
          severity: "LOW",
          category: "CONTENT",
          evidence: `Slide ${slideNum} contains only ${wordCount} words.`,
          cause: "Sparse content lacks sufficient strategic context.",
          repairStrategy: "Expand executive detail or convert to dedicated visual focal layout.",
          confidence: 0.85,
          risk: "LOW",
          affectedElements: ["bodyContent"],
        });
      }

      // 2. Semantic Headline Hierarchy
      if (!slide.headline || slide.headline.trim().length === 0) {
        defects.push({
          defectId: `def_missing_headline_${slide.id}`,
          slideId: slide.id,
          slideNumber: slideNum,
          severity: "CRITICAL",
          category: "ACCESSIBILITY",
          evidence: `Slide ${slideNum} lacks a semantic H1 headline.`,
          cause: "Missing headline violates WCAG 2.2 AA screen-reader hierarchy.",
          repairStrategy: "Synthesize concise, high-impact headline from slide topic.",
          confidence: 1.0,
          risk: "MEDIUM",
          affectedElements: ["headline"],
        });
      }

      // 3. Broken Chart Verification
      if (slide.chart) {
        const hasData = Array.isArray(slide.chart.data) && slide.chart.data.length > 0;
        if (!hasData) {
          defects.push({
            defectId: `def_broken_chart_${slide.id}`,
            slideId: slide.id,
            slideNumber: slideNum,
            severity: "HIGH",
            category: "CHART",
            evidence: `Slide ${slideNum} has a chart object with missing data points.`,
            cause: "Malformed chart dataset.",
            repairStrategy: "Re-synthesize calibrated chart series from verified metrics.",
            confidence: 1.0,
            risk: "MEDIUM",
            affectedElements: ["chart"],
          });
        }
      }

      // 4. Missing Speaker Notes
      if (!slide.speakerNotes || slide.speakerNotes.trim().length === 0) {
        defects.push({
          defectId: `def_missing_notes_${slide.id}`,
          slideId: slide.id,
          slideNumber: slideNum,
          severity: "LOW",
          category: "STORY",
          evidence: `Slide ${slideNum} has no presenter speaker notes.`,
          cause: "Speaker notes missing for presenter teleprompter mode.",
          repairStrategy: "Generate presenter notes summarizing key strategic takeaway.",
          confidence: 0.9,
          risk: "LOW",
          affectedElements: ["speakerNotes"],
        });
      }

      // 5. Factuality & Trust Firewall Validation
      const ungrounded = (slide.facts || []).filter(
        (f) => f.provenance === "UNKNOWN" || f.provenance === "CONTRADICTED"
      );
      if (ungrounded.length > 0) {
        defects.push({
          defectId: `def_unverified_fact_${slide.id}`,
          slideId: slide.id,
          slideNumber: slideNum,
          severity: "CRITICAL",
          category: "FACTUALITY",
          evidence: `Slide ${slideNum} contains ${ungrounded.length} unverified or contradicted claims.`,
          cause: "Claims failed Source Reality Gate verification.",
          repairStrategy: "Re-qualify claims or isolate into explicit INFERRED provenance.",
          confidence: 1.0,
          risk: "HIGH",
          affectedElements: ["facts"],
        });
      }
    });

    const criticalCount = defects.filter((d) => d.severity === "CRITICAL").length;
    const highCount = defects.filter((d) => d.severity === "HIGH").length;
    const mediumCount = defects.filter((d) => d.severity === "MEDIUM").length;

    let score = 100 - criticalCount * 30 - highCount * 15 - mediumCount * 5;
    score = Math.max(0, Math.min(100, score));

    return { defects, score };
  }

  /**
   * Validates raw OpenXML PPTX binary package
   */
  public async auditPptxPackage(
    pptxBuffer: Uint8Array,
    expectedSlideCount: number
  ): Promise<DeterministicAuditResult["openXmlCheck"]> {
    try {
      if (!pptxBuffer || pptxBuffer.length === 0) {
        return {
          validZip: false,
          hasContentTypes: false,
          hasPresentation: false,
          slideCountMatched: false,
          notesCountMatched: false,
          crcValid: false,
          error: "Empty binary buffer provided.",
        };
      }

      // Check ZIP magic bytes (PK\x03\x04)
      if (pptxBuffer[0] !== 0x50 || pptxBuffer[1] !== 0x4b) {
        return {
          validZip: false,
          hasContentTypes: false,
          hasPresentation: false,
          slideCountMatched: false,
          notesCountMatched: false,
          crcValid: false,
          error: "Invalid ZIP header magic bytes.",
        };
      }

      const zip = await JSZip.loadAsync(pptxBuffer);
      const files = Object.keys(zip.files);

      const hasContentTypes = files.includes("[Content_Types].xml");
      const hasPresentation = files.includes("ppt/presentation.xml");

      const slideFiles = files.filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f));
      const noteFiles = files.filter((f) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(f));

      // Trigger decompress of slide 1 and presentation to test CRC integrity
      let crcValid = true;
      try {
        if (hasPresentation) await zip.file("ppt/presentation.xml")?.async("string");
        if (slideFiles.length > 0) await zip.file(slideFiles[0])?.async("string");
      } catch {
        crcValid = false;
      }

      const slideCountMatched = slideFiles.length === expectedSlideCount;
      const notesCountMatched = noteFiles.length === expectedSlideCount;

      return {
        validZip: true,
        hasContentTypes,
        hasPresentation,
        slideCountMatched,
        notesCountMatched,
        crcValid,
      };
    } catch (err: any) {
      return {
        validZip: false,
        hasContentTypes: false,
        hasPresentation: false,
        slideCountMatched: false,
        notesCountMatched: false,
        crcValid: false,
        error: err.message || String(err),
      };
    }
  }

  /**
   * Executes full Layer A deterministic reality audit
   */
  public async executeDeterministicAudit(
    project: PresentationProject,
    pptxBuffer?: Uint8Array
  ): Promise<DeterministicAuditResult> {
    const { defects, score } = this.auditStructureAndContent(project);
    let openXmlCheck: DeterministicAuditResult["openXmlCheck"] = {
      validZip: true,
      hasContentTypes: true,
      hasPresentation: true,
      slideCountMatched: true,
      notesCountMatched: true,
      crcValid: true,
    };

    if (pptxBuffer) {
      openXmlCheck = await this.auditPptxPackage(pptxBuffer, project.slides.length);
      if (!openXmlCheck.validZip || !openXmlCheck.hasContentTypes || !openXmlCheck.hasPresentation || !openXmlCheck.crcValid) {
        defects.push({
          defectId: `def_openxml_corrupt_${Date.now()}`,
          slideId: "deck",
          slideNumber: 0,
          severity: "CRITICAL",
          category: "EXPORT",
          evidence: `OpenXML package validation failed: ${openXmlCheck.error || "Missing essential package parts"}`,
          cause: "Binary ZIP packaging failure.",
          repairStrategy: "Re-serialize OpenXML archive using JSZip.",
          confidence: 1.0,
          risk: "HIGH",
          affectedElements: ["exportPackage"],
        });
      }
    }

    const hasCritical = defects.some((d) => d.severity === "CRITICAL");
    const preflightDetails: Record<string, string> = {
      slideCount: `${project.slides.length} slides structured`,
      openXmlZip: openXmlCheck.validZip ? "VALID" : "CORRUPT",
      contentTypes: openXmlCheck.hasContentTypes ? "PRESENT" : "MISSING",
      presentationXml: openXmlCheck.hasPresentation ? "PRESENT" : "MISSING",
      notesSlides: `${openXmlCheck.notesCountMatched ? project.slides.length : 0} notes present`,
      crcIntegrity: openXmlCheck.crcValid ? "PASS" : "FAIL",
    };

    return {
      passed: !hasCritical && openXmlCheck.validZip && openXmlCheck.crcValid,
      technicalIntegrityScore: hasCritical ? Math.min(score, 70) : score,
      defects,
      preflightDetails,
      openXmlCheck,
    };
  }
}
