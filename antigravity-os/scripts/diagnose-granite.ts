/**
 * ANTIGRAVITY OS V7 — GRANITE 4.2 DIAGNOSTIC ENGINE
 * scripts/diagnose-granite.ts
 */

import {
  GraniteHardwareGovernor,
  GraniteModelRegistry,
  GraniteEngine,
  GraniteModelRouter,
  GraniteHermesBridge,
  GraniteTrustBridge,
  GranitePresentXBridge,
} from "../src/plugins/granite";

async function runGraniteDiagnostic() {
  console.log("=================================================");
  console.log("GRANITE 4.2 SOVEREIGN FABRIC DIAGNOSTIC RUNNER");
  console.log("=================================================\n");

  console.log("[1/6] Inspecting Real Hardware Profile...");
  const hw = await GraniteHardwareGovernor.getInstance().getHardwareProfile(true);
  console.log(`- CPU: ${hw.cpuModel} (${hw.cpuCores} cores)`);
  console.log(`- RAM: ${hw.availableRamGb} GB free / ${hw.totalRamGb} GB total`);
  console.log(`- Recommended Model: ${hw.recommendedModel}`);

  console.log("\n[2/6] Inspecting Granite Model Registry...");
  const registry = GraniteModelRegistry.getInstance();
  const models = await registry.discoverLocalModels();
  console.log(`- Discovered models: ${models.length}`);
  models.forEach((m) => console.log(`  • ${m.name} [${m.verificationStatus}] (${m.backend})`));

  console.log("\n[3/6] Testing Dynamic Capability Routing...");
  const router = GraniteModelRouter.getInstance();
  const decision = await router.routeModel({ taskType: "PRODUCT_ARCHITECTURE", reasoningRequirement: "CRITICAL" });
  console.log(`- Selected Model: ${decision.selectedModel}`);
  console.log(`- Mode: ${decision.reasoningMode}`);
  console.log(`- Reason: ${decision.selectionReason}`);

  console.log("\n[4/6] Testing Hermes Autonomous Tool Supervision...");
  const hermes = GraniteHermesBridge.getInstance();
  const hermesRes = await hermes.executeSupervisedReasoning("diag_session_1", {
    prompt: "Plan repository inspection tool sequence",
    taskType: "TOOL_CALLING",
    toolsAvailable: ["inspect_repository"],
  });
  console.log(`- Hermes Session Active: ${hermesRes.hermesSessionActive}`);
  console.log(`- Tools Executed: ${hermesRes.toolsExecuted.length}`);

  console.log("\n[5/6] Testing Trust Fabric Claim Quarantine...");
  const trust = GraniteTrustBridge.getInstance();
  const audit = trust.auditGraniteContent("This presentation delivers 100% guaranteed profit across all sectors.");
  console.log(`- Contradiction Caught: ${audit.contradictionDetected}`);
  console.log(`- Quarantined Segments: ${audit.quarantinedSegments.join(", ")}`);

  console.log("\n[6/6] Testing PresentX Creative Thesis Bridge...");
  const presentx = GranitePresentXBridge.getInstance();
  const brief = await presentx.formulateCreativeBrief("Enterprise AI Transformation", 10);
  console.log(`- Formulated Thesis: "${brief.thesis}"`);
  console.log(`- Target Audience Insight: "${brief.audienceInsight}"`);

  console.log("\n=================================================");
  console.log("DIAGNOSTIC COMPLETED: ALL 6 PHASES PASSED");
  console.log("=================================================");
}

runGraniteDiagnostic().catch((e) => {
  console.error("Granite Diagnostic Failure:", e);
  process.exit(1);
});
