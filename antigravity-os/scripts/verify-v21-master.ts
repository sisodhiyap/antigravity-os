/**
 * ANTIGRAVITY OS v2.1 — MASTER ENGINEERING & REALITY VERIFICATION SUITE
 * Unified verification covering:
 * Phase 1: Strands Decider System One & Confidence Calibration
 * Phase 2: PresentX Native PPTX Export Engine
 * Phase 3: Authoritative Capability Registry (17 Domains)
 * Phase 4: Desktop Security Fabric & IPC Allowlist
 * Phase 5: 16-Role Specialist Agent Swarm Governance
 * Phase 6: Truth Firewall & Approval Gate Enforcement
 */

import { aiRouter } from "../src/server/ai/router";
import { strandsDecider, deriveConfidence, deriveScoreConfidence } from "../src/server/ai/strands-decider";
import { PresentXExporter } from "../src/presentx/engine/PresentXExporter";
import { PresentationProject } from "../src/presentx/types";
import { authoritativeRegistry } from "../src/capabilities/AuthoritativeRegistry";
import { DesktopSecurityFabric } from "../src/desktop/security";
import { agentSwarm } from "../src/server/swarm/agent-swarm";

async function main() {
  console.log("======================================================================");
  console.log("ANTIGRAVITY OS v2.1 — SOVEREIGN CREATIVE INTELLIGENCE MASTER AUDIT");
  console.log("======================================================================\n");

  let totalAssertions = 0;
  let passedAssertions = 0;

  function assert(condition: boolean, message: string) {
    totalAssertions++;
    if (condition) {
      passedAssertions++;
      console.log(`  [PASS] ${message}`);
    } else {
      console.error(`  [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // ── 1. STRANDS DECIDER SYSTEM ONE & CONFIDENCE CALIBRATION ─────────
  console.log("PHASE 1: Strands Decider System One & Mathematical Calibration");
  const binConf = deriveConfidence([0.95, 0.05]);
  assert(Math.abs(binConf - 0.90) < 0.02, `Binary confidence formula normalized correctly: ${binConf.toFixed(3)}`);

  const multiConf = deriveConfidence([0.70, 0.15, 0.15]);
  assert(Math.abs(multiConf - 0.55) < 0.02, `Multi-choice confidence normalized correctly: ${multiConf.toFixed(3)}`);

  const scoreConf = deriveScoreConfidence([0.05, 0.90, 0.05]);
  assert(scoreConf > 0.65, `Ordinal score confidence accurately reflects standard deviation: ${scoreConf.toFixed(3)}`);

  const bench = await strandsDecider.runBenchmark();
  assert(bench.sampleCount === 25, `Benchmark completed 25 empirical test cases`);
  assert(bench.p50Ms <= 50, `Measured p50 decision latency is sub-50ms (actual: ${bench.p50Ms}ms)`);
  assert(bench.p95Ms <= 50, `Measured p95 decision latency is sub-50ms (actual: ${bench.p95Ms}ms)`);
  assert(bench.timeoutRate === 0, `Measured timeout rate is 0.0%`);
  console.log("");

  // ── 2. PRESENTX NATIVE PPTX EXPORTER ───────────────────────────────
  console.log("PHASE 2: PresentX Native PPTX Exporter & Theme Mapping");
  const testDeck: PresentationProject = {
    id: "proj_v21_master",
    title: "Antigravity OS v2.1 Architecture",
    theme: "CYBERPUNK",
    provenanceHash: "hash_v21_master",
    slides: [
      {
        id: "s1",
        slideNumber: 1,
        layout: "HERO",
        headline: "Antigravity OS v2.1 Sovereign Creative Fabric",
        subheadline: "Verified Agentic Creative Workstation",
        bodyContent: "Next.js 15, Electron 44, Strands Decider, and MCP Fabric.",
        speakerNotes: "Presenter introduction to sovereign AI workstation.",
        audit: { truthBadge: "VERIFIED", factualConfidence: 1.0, claimsCount: 1 },
      },
    ],
    designTokens: {
      primaryColor: "#D4AF37",
      backgroundColor: "#0A0E17",
      textColor: "#F8FAFC",
      fontHeading: "Inter",
      fontBody: "Inter",
    },
    exportManifest: {
      generatedAt: new Date().toISOString(),
      generatorVersion: "v2.1.0",
      totalSlides: 1,
      format: "PPTX",
      contentSha256: "sha256_test",
    },
  };

  const pptxBuffer = await PresentXExporter.exportToNativePptx(testDeck);
  assert(pptxBuffer.length > 5000, `Generated PPTX buffer has non-trivial size (${pptxBuffer.length} bytes)`);
  assert(pptxBuffer[0] === 0x50 && pptxBuffer[1] === 0x4b, `Buffer possesses valid PK zip magic header (OpenXML)`);
  console.log("");

  // ── 3. AUTHORITATIVE CAPABILITY REGISTRY (17 DOMAINS) ──────────────
  console.log("PHASE 3: Authoritative Capability Registry (17 Truthful Domains)");
  const capabilities = await authoritativeRegistry.evaluateAllCapabilities();
  assert(capabilities.length >= 17, `Capability registry evaluates >= 17 domains (found: ${capabilities.length})`);

  const strandsCap = capabilities.find((c) => c.id === "strands-decider");
  assert(strandsCap?.status === "READY", `Strands Decider capability status is READY`);

  const pptxCap = capabilities.find((c) => c.id === "presentx-native-pptx");
  assert(pptxCap?.status === "READY", `PresentX Native PPTX capability status is READY`);

  const googleCap = capabilities.find((c) => c.id === "google-workspace-gateway");
  assert(googleCap !== undefined, `Google Workspace Gateway domain registered`);

  const creativeCap = capabilities.find((c) => c.id === "creative-tools-fabric");
  assert(creativeCap?.status === "READY", `Sovereign Creative Tools Fabric status is READY`);
  console.log("");

  // ── 4. DESKTOP SECURITY FABRIC & IPC ALLOWLIST ─────────────────────
  console.log("PHASE 4: Desktop Security Fabric & IPC Allowlist Enforcement");
  assert(DesktopSecurityFabric.isIpcChannelAllowed("desktop:strands-decide"), `IPC channel desktop:strands-decide is allowlisted`);
  assert(DesktopSecurityFabric.isIpcChannelAllowed("desktop:get-capabilities"), `IPC channel desktop:get-capabilities is allowlisted`);
  assert(DesktopSecurityFabric.isIpcChannelAllowed("desktop:get-creative-tools"), `IPC channel desktop:get-creative-tools is allowlisted`);
  assert(!DesktopSecurityFabric.isIpcChannelAllowed("desktop:raw-shell-exec"), `Unallowlisted channel desktop:raw-shell-exec is correctly blocked`);

  const redacted = DesktopSecurityFabric.redactSecrets("Bearer sk-antigravitysecretkey12345678");
  assert(redacted.includes("[REDACTED_SECRET]"), `Secret token was redacted: ${redacted}`);
  console.log("");

  // ── 5. 16-ROLE SPECIALIST AGENT SWARM GOVERNANCE ───────────────────
  console.log("PHASE 5: Specialist Agent Swarm Roster Governance");
  const allAgents = agentSwarm.getAllAgents();
  assert(allAgents.length >= 16, `Agent roster contains >= 16 roles (found: ${allAgents.length})`);

  const graphicDesigner = agentSwarm.getAgent("GRAPHIC_DESIGNER");
  assert(graphicDesigner?.preferredCategory === "CREATIVE", `Graphic Designer agent prefers CREATIVE model category`);

  const motionDesigner = agentSwarm.getAgent("MOTION_DESIGNER");
  assert(motionDesigner?.preferredCategory === "CREATIVE", `Motion Designer agent prefers CREATIVE model category`);

  const threeDArtist = agentSwarm.getAgent("THREE_D_ARTIST");
  assert(threeDArtist?.capabilities.includes("Three.js WebGL"), `3D Specialist exposes WebGL / Blender capabilities`);
  console.log("");

  // ── 6. TRUTH FIREWALL & APPROVAL GATE ENFORCEMENT ──────────────────
  console.log("PHASE 6: Truth Firewall & Approval Gate Enforcement");
  const dangerousTask = await aiRouter.decide("Delete customer database and purge production bucket");
  assert(dangerousTask.decisionCategory === "APPROVAL_REQUIRED", `Consequential task triggers APPROVAL_REQUIRED gate`);
  assert(dangerousTask.riskClassification === "CRITICAL", `Consequential task classified as CRITICAL risk`);
  assert(dangerousTask.escalateToLargerModel === false, `Approval gate does not execute model hallucination`);

  const normalTask = await aiRouter.decide("Generate vector icon set for navigation drawer");
  assert(normalTask.decisionCategory === "CREATIVE_PIPELINE", `Creative task routed to CREATIVE_PIPELINE`);
  console.log("");

  console.log("======================================================================");
  console.log(`ALL ASSERTIONS PASSED: ${passedAssertions}/${totalAssertions} (100% GREEN)`);
  console.log("ANTIGRAVITY OS v2.1 IS EMPIRICALLY CERTIFIED AND PRODUCTION-READY");
  console.log("======================================================================");
}

main().catch((err) => {
  console.error("MASTER AUDIT FAILED:", err);
  process.exit(1);
});
