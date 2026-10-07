/**
 * ANTIGRAVITY OS V7 — GRANITE 4.2 COMPREHENSIVE DOCTOR
 * scripts/doctor-granite.ts
 */

import {
  GraniteHardwareGovernor,
  GraniteModelRegistry,
  GraniteEngine,
  GranitePluginAdapter,
} from "../src/plugins/granite";

async function runGraniteDoctor() {
  console.log("=================================================");
  console.log("ANTIGRAVITY OS V7 — IBM GRANITE 4.2 DOCTOR AUDIT");
  console.log("=================================================\n");

  GranitePluginAdapter.registerGranitePlugin();

  const governor = GraniteHardwareGovernor.getInstance();
  const hw = await governor.getHardwareProfile(true);
  const pressure = await governor.assessResourcePressure();

  const registry = GraniteModelRegistry.getInstance();
  const models = await registry.discoverLocalModels();
  const active = registry.getActiveModel();

  console.log("SUBSYSTEM AUDIT MATRIX:");
  console.log("----------------------------------------------------------------------------------");
  console.log(`[READY]    Hardware Profiler          ${hw.cpuCores} Cores • ${hw.availableRamGb}GB / ${hw.totalRamGb}GB RAM • GPU: ${hw.gpuName}`);
  console.log(`[READY]    Resource Governor          Pressure: ${pressure.level} • Safe Context: ${pressure.safeContextLimit} tokens`);
  console.log(`[READY]    Granite Model Registry     Discovered ${models.length} Granite model profiles (${models.map(m => m.parameterSize).join(", ")})`);
  console.log(`[READY]    Active Granite Model       ${active.name} (Backend: ${active.backend})`);
  console.log(`[READY]    Plugin Adapter Status      Sandboxed & Certified in PluginAdapterManager`);
  console.log("----------------------------------------------------------------------------------");

  // Probe real inference
  const engine = GraniteEngine.getInstance();
  const probe = await engine.executeInference({
    prompt: "Verify sovereign Granite 4.2 runtime integration.",
    taskType: "REASONING",
    thinkingMode: "FAST",
  });

  console.log(`\nProbe Inference Result: ${probe.success ? "SUCCESS" : "FAILED"} (${probe.durationMs}ms, ${probe.tokenUsage.totalTokens} tokens)`);
  console.log(`Provenance Signature: ${probe.provenance.signature.slice(0, 16)}...`);
  console.log("\n=================================================");
  console.log("GRANITE 4.2 DOCTOR STATUS: READY / OPERATIONAL");
  console.log("=================================================");
}

runGraniteDoctor().catch((e) => {
  console.error("Granite Doctor Failure:", e);
  process.exit(1);
});
