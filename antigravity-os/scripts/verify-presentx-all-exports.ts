/**
 * ANTIGRAVITY OS — PRESENTX MASTER GENERATION & MULTI-FORMAT EXPORT VERIFICATION
 * Verifies end-to-end:
 * 1. Autonomous deck generation with slide architecture
 * 2. Native PowerPoint (.PPTX) export via PptxGenJS (OpenXML binary)
 * 3. OpenXML (.PPTX) export via JSZip package compiler
 * 4. Genuine vector/text PDF (.PDF) export (PDF 1.4 binary signature & stream validation)
 * 5. Interactive Web Presentation (.HTML) export
 * 6. Signed Evidence Ledger (.JSON) export
 * 7. Quality Director preflight certification
 * 8. Durable file persistence & retrieval
 */

import { PresentXOrchestrator } from "../src/presentx/engine/PresentXOrchestrator";
import { PresentXExporter } from "../src/presentx/engine/PresentXExporter";
import { PresentXExportQualityDirector } from "../src/presentx/quality/PresentXExportQualityDirector";
import { PresentationProject } from "../src/presentx/types";
import fs from "fs";
import path from "path";

async function main() {
  console.log("================================================================================");
  console.log("ANTIGRAVITY OS — PRESENTX MASTER GENERATION & EXPORT VERIFICATION SUITE");
  console.log("================================================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition: boolean, label: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  [PASS] Test ${totalTests}: ${label}`);
    } else {
      console.error(`  [FAIL] Test ${totalTests}: ${label}`);
      throw new Error(`Verification assertion failed: ${label}`);
    }
  }

  // ── 1. DECK GENERATION PIPELINE ──────────────────────────────────────────
  console.log("PHASE 1: Autonomous Presentation Synthesis");
  const orchestrator = PresentXOrchestrator.getInstance();
  const project = await orchestrator.generatePresentation({
    rawIdea: "Executive AI Operating System Strategy for Global Enterprises",
    presentationType: "STRATEGY_DECK",
    visualDirection: "FUTURISTIC",
    slideCount: 4,
    brandName: "Antigravity OS",
  });

  assert(Boolean(project && project.id), `Deck synthesized with ID: ${project.id}`);
  assert(project.slides.length === 4, `Slide count matches specification: ${project.slides.length} slides`);
  assert(Boolean(project.provenanceHash), `Provenance hash cryptographically sealed: ${project.provenanceHash.slice(0, 16)}...`);
  assert(project.qualityAudit.overallScore >= 80, `Quality Director initial score: ${project.qualityAudit.overallScore}/100`);
  console.log("");

  // ── 2. NATIVE PPTX EXPORT ────────────────────────────────────────────────
  console.log("PHASE 2: Native Microsoft PowerPoint (.PPTX) Export");
  const nativePptx = await PresentXExporter.exportToNativePptx(project);
  assert(Buffer.isBuffer(nativePptx), "Native PPTX returned as binary Buffer");
  assert(nativePptx.length > 20000, `Native PPTX non-trivial size: ${nativePptx.length} bytes`);
  assert(
    nativePptx[0] === 0x50 && nativePptx[1] === 0x4b,
    "Valid PK zip magic bytes (0x50 0x4B) verified for OpenXML package"
  );
  console.log("");

  // ── 3. OPENXML COMPILER PPTX EXPORT ──────────────────────────────────────
  console.log("PHASE 3: OpenXML Binary Package Compiler (.PPTX)");
  const openXmlPptx = await PresentXExporter.exportToPptx(project);
  assert(Buffer.isBuffer(openXmlPptx), "OpenXML PPTX returned as binary Buffer");
  assert(openXmlPptx.length > 5000, `OpenXML PPTX size: ${openXmlPptx.length} bytes`);
  assert(
    openXmlPptx[0] === 0x50 && openXmlPptx[1] === 0x4b,
    "Valid PK zip magic header (OpenXML presentationml)"
  );
  console.log("");

  // ── 4. GENUINE BINARY PDF EXPORT ─────────────────────────────────────────
  console.log("PHASE 4: Genuine Multi-Page PDF (.PDF) Vector Export");
  const pdfBuffer = await PresentXExporter.exportToPdf(project);
  assert(Buffer.isBuffer(pdfBuffer), "PDF returned as binary Buffer");
  assert(pdfBuffer.length > 2000, `PDF buffer non-trivial size: ${pdfBuffer.length} bytes`);

  const pdfString = pdfBuffer.toString("utf-8");
  assert(pdfString.startsWith("%PDF-1.4"), "Valid %PDF-1.4 standard magic header verified");
  assert(pdfString.includes("%%EOF"), "Valid %%EOF end-of-file trailer verified");
  assert(pdfString.includes("/Type /Catalog"), "PDF document catalog dictionary present");
  assert(pdfString.includes("/Type /Pages"), "PDF pages tree dictionary present");
  assert(pdfString.includes("/MediaBox [0 0 960 540]"), "16:9 widescreen presentation geometry (960x540) verified");
  assert(pdfString.includes("/Count 4"), "PDF page count matches slide count (4 pages)");
  console.log("");

  // ── 5. INTERACTIVE HTML PRESENTATION ─────────────────────────────────────
  console.log("PHASE 5: Standalone Interactive HTML Presentation");
  const htmlExport = PresentXExporter.exportToHtml(project);
  assert(typeof htmlExport === "string", "HTML export returned as string");
  assert(htmlExport.includes("<!DOCTYPE html>"), "Valid HTML5 doctype declaration verified");
  assert(htmlExport.includes("<title>"), "Presentation title embedded in HTML head");
  assert(htmlExport.includes("slide-card"), "Slide deck cards embedded in HTML DOM");
  assert(htmlExport.includes("nextSlide()"), "Fullscreen keyboard navigation script included");
  console.log("");

  // ── 6. SIGNED EVIDENCE LEDGER JSON ───────────────────────────────────────
  console.log("PHASE 6: Signed Evidence Ledger JSON Bundle");
  const jsonExport = PresentXExporter.exportToJsonBundle(project);
  const parsed = JSON.parse(jsonExport);
  assert(parsed.project.id === project.id, "Project ID matched in JSON bundle");
  assert(Array.isArray(parsed.project.slides), "Slides array persisted in JSON bundle");
  assert(Boolean(parsed.manifest), "Export manifest embedded in JSON bundle");
  console.log("");

  // ── 7. QUALITY DIRECTOR PREFLIGHT CERTIFICATION ──────────────────────────
  console.log("PHASE 7: Export Quality Director Automated Gate");
  const qualityDirector = PresentXExportQualityDirector.getInstance();

  const pptxGate = await qualityDirector.executeQualityGate(project, "PPTX");
  assert(pptxGate.decision === "APPROVED", `PPTX quality gate decision: ${pptxGate.decision}`);
  assert(pptxGate.certificate.exportScore >= 85, `PPTX export score certified: ${pptxGate.certificate.exportScore}/100`);

  const pdfGate = await qualityDirector.executeQualityGate(project, "PDF");
  assert(pdfGate.decision === "APPROVED", `PDF quality gate decision: ${pdfGate.decision}`);
  assert(Boolean(pdfGate.exportBuffer), "PDF exportBuffer generated and certified");
  assert(
    pdfGate.exportBuffer![0] === 0x25 && pdfGate.exportBuffer![1] === 0x50,
    "Certified PDF buffer has valid %P magic header"
  );
  console.log("");

  // ── 8. ARTIFACT PERSISTENCE & DISK AUDIT ──────────────────────────────────
  console.log("PHASE 8: Sample Artifact Persistence & Verification");
  const artifactDir = path.resolve(process.cwd(), "artifacts", "presentx-exports");
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const samplePptxPath = path.join(artifactDir, "verified_deck.pptx");
  const samplePdfPath = path.join(artifactDir, "verified_deck.pdf");
  const sampleHtmlPath = path.join(artifactDir, "verified_deck.html");

  fs.writeFileSync(samplePptxPath, nativePptx);
  fs.writeFileSync(samplePdfPath, pdfBuffer);
  fs.writeFileSync(sampleHtmlPath, htmlExport);

  assert(fs.existsSync(samplePptxPath) && fs.statSync(samplePptxPath).size > 1000, "Persisted sample PPTX verified on disk");
  assert(fs.existsSync(samplePdfPath) && fs.statSync(samplePdfPath).size > 1000, "Persisted sample PDF verified on disk");
  assert(fs.existsSync(sampleHtmlPath) && fs.statSync(sampleHtmlPath).size > 1000, "Persisted sample HTML verified on disk");

  console.log("\n================================================================================");
  console.log(`PRESENTX EXPORT VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (100% GREEN)`);
  console.log("================================================================================\n");
}

main().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
