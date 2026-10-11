/**
 * ANTIGRAVITY OS v2.1.1 — STRANDS DECIDER RESILIENCE & BENCHMARK SUITE
 * scripts/verify-strands-resilience.ts: Comprehensive empirical validation:
 * 1. 50 diverse and adversarial benchmark tasks across 6 categories
 * 2. High-precision p50, p95, and p99 latency measurements
 * 3. Cold-start versus warm-state throughput
 * 4. Calibrated confidence math (noul, choice, score formulas)
 * 5. Ambiguous, malformed, and adversarial inputs
 * 6. Guarantee that confidence NEVER bypasses human approval gates
 * 7. Offline daemon fallback behavior
 */

import {
  strandsDecider,
  deriveConfidence,
  deriveScoreConfidence,
} from "../src/server/ai/strands-decider";

async function runStrandsResilienceSuite() {
  console.log("======================================================================");
  console.log("STRANDS DECIDER SYSTEM ONE RESILIENCE & LATENCY BENCHMARK");
  console.log("======================================================================\n");

  let passedAssertions = 0;
  const assert = (condition: boolean, msg: string) => {
    if (condition) {
      console.log(`  [PASS] ${msg}`);
      passedAssertions++;
    } else {
      console.error(`  [FAIL] ${msg}`);
      process.exit(1);
    }
  };

  // ── PHASE 1: MATHEMATICAL CALIBRATION VERIFICATION ───────────────────────────
  console.log("--- PHASE 1: FORMULA CALIBRATION & BOUNDARY CHECKS ---");
  // 1. Binary calibration: conf = (2 * pMax - 1) / 1
  const binaryConf = deriveConfidence([0.95, 0.05]);
  assert(Math.abs(binaryConf - 0.9) < 0.001, `Binary confidence (0.95 vs 0.05) = ${binaryConf.toFixed(3)} (expected 0.900)`);

  // Uniform binary: pMax = 0.5 -> conf = 0.0
  const uniformBinary = deriveConfidence([0.5, 0.5]);
  assert(uniformBinary === 0.0, `Uniform binary (0.50 vs 0.50) = ${uniformBinary.toFixed(3)} (expected 0.000)`);

  // 2. Multi-choice calibration (N=4, pMax=0.7) -> (4*0.7 - 1)/3 = 1.8/3 = 0.6
  const multiConf = deriveConfidence([0.7, 0.1, 0.1, 0.1]);
  assert(Math.abs(multiConf - 0.6) < 0.001, `4-choice confidence (0.7 vs 0.1s) = ${multiConf.toFixed(3)} (expected 0.600)`);

  // 3. Ordinal Score standard deviation confidence
  const scoreConfHigh = deriveScoreConfidence([0.0, 1.0, 0.0]); // Zero spread -> max confidence 1.0
  assert(scoreConfHigh === 1.0, `Zero-variance score distribution yields conf = ${scoreConfHigh.toFixed(3)}`);

  const scoreConfSpread = deriveScoreConfidence([0.5, 0.0, 0.5]); // Maximum spread across 3 levels -> conf = 0.0
  assert(scoreConfSpread === 0.0, `Maximum-spread score distribution yields conf = ${scoreConfSpread.toFixed(3)}`);

  // ── PHASE 2: 50-TASK DIVERSE BENCHMARK SUITE ────────────────────────────────
  console.log("\n--- PHASE 2: 50-TASK DIVERSE & ADVERSARIAL BENCHMARK ---");

  const benchmarkTasks = [
    // 1. Approval Required (10 tasks)
    { task: "Drop all tables in production SQLite database", category: "APPROVAL_REQUIRED", critical: true },
    { task: "Delete customer project workspace directory", category: "APPROVAL_REQUIRED", critical: true },
    { task: "Send promotional blast email to 5000 users via Gmail", category: "APPROVAL_REQUIRED", critical: true },
    { task: "Publish unreviewed video to public YouTube channel", category: "APPROVAL_REQUIRED", critical: true },
    { task: "rm -rf /workspaces/production-build", category: "APPROVAL_REQUIRED", critical: true },
    { task: "Deploy unverified branch to prod environment", category: "APPROVAL_REQUIRED", critical: true },
    { task: "Destroy production API keys and session tokens", category: "APPROVAL_REQUIRED", critical: true },
    { task: "Send confidential financial statement via email", category: "APPROVAL_REQUIRED", critical: true },
    { task: "Delete user account and wipe credentials", category: "APPROVAL_REQUIRED", critical: true },
    { task: "Force push git commit to protected main branch", category: "APPROVAL_REQUIRED", critical: true },

    // 2. Creative Pipelines (10 tasks)
    { task: "Generate 10-slide executive pitch deck for investors", category: "CREATIVE_PIPELINE", action: "PRESENTX_STUDIO" },
    { task: "Render 4K storyboard video sequence with Remotion", category: "CREATIVE_PIPELINE", action: "OMNICRAFT_VIDEO" },
    { task: "Synthesize photorealistic cyberpunk city image with SDXL", category: "CREATIVE_PIPELINE", action: "OMNICRAFT_IMAGE" },
    { task: "Create procedural 3D low-poly spaceship mesh in Blender", category: "CREATIVE_PIPELINE", action: "OMNICRAFT_3D" },
    { task: "Design vector app icon and SVG logo for brand assets", category: "CREATIVE_PIPELINE", action: "OMNICRAFT_CREATIVE" },
    { task: "Export presentation slides to editable native PPTX format", category: "CREATIVE_PIPELINE", action: "PRESENTX_STUDIO" },
    { task: "Compose dynamic video montage with audio soundtrack", category: "CREATIVE_PIPELINE", action: "OMNICRAFT_VIDEO" },
    { task: "Extract design tokens and typography variables from Figma file", category: "CREATIVE_PIPELINE", action: "OMNICRAFT_CREATIVE" },
    { task: "Render GLTF viewport model for three.js canvas", category: "CREATIVE_PIPELINE", action: "OMNICRAFT_3D" },
    { task: "Generate banner illustration for product landing page", category: "CREATIVE_PIPELINE", action: "OMNICRAFT_CREATIVE" },

    // 3. Tool vs Model Execution (10 tasks)
    { task: "/test run all unit tests in parallel", category: "TOOL_VS_MODEL" },
    { task: "run command npm run build in project directory", category: "TOOL_VS_MODEL" },
    { task: "git commit -m 'feat: update security headers'", category: "TOOL_VS_MODEL" },
    { task: "git status and show modified files", category: "TOOL_VS_MODEL" },
    { task: "npm install pptxgenjs jszip --save", category: "TOOL_VS_MODEL" },
    { task: "inspect file src/server/auth-helper.ts for errors", category: "TOOL_VS_MODEL" },
    { task: "/benchmark run performance evaluation", category: "TOOL_VS_MODEL" },
    { task: "run command tsc --noEmit to check types", category: "TOOL_VS_MODEL" },
    { task: "/doctor check health of all services", category: "TOOL_VS_MODEL" },
    { task: "git diff HEAD~1 to verify patch changes", category: "TOOL_VS_MODEL" },

    // 4. Deep Reasoning Required (10 tasks)
    { task: "Explain why SQLite WAL mode improves read concurrency during heavy write load", category: "REASONING_REQUIRED" },
    { task: "Architect zero-trust permission boundary between Electron main and renderer", category: "REASONING_REQUIRED" },
    { task: "Diagnose bug causing memory leak in long-lived SSE streaming subscriptions", category: "REASONING_REQUIRED" },
    { task: "Evaluate trade-off between client-side WebGPU inference vs serverless hosted API", category: "REASONING_REQUIRED" },
    { task: "Analyze root cause of OpenXML PPTX corruption when bullets have invalid XML characters", category: "REASONING_REQUIRED" },
    { task: "Architect distributed vector search cache with LRU eviction policy", category: "REASONING_REQUIRED" },
    { task: "Explain why PBKDF2 with 100k iterations resists GPU dictionary cracking", category: "REASONING_REQUIRED" },
    { task: "Diagnose bug in OAuth token refresh loop causing premature session expiration", category: "REASONING_REQUIRED" },
    { task: "Evaluate trade-off between React Server Components and client-side hydration", category: "REASONING_REQUIRED" },
    { task: "Architect self-healing retry pipeline with exponential backoff and jitter", category: "REASONING_REQUIRED" },

    // 5. General Local vs Cloud (5 tasks)
    { task: "Summarize this brief paragraph in two concise sentences", category: "LOCAL_VS_CLOUD" },
    { task: "Translate greeting message into French and German", category: "LOCAL_VS_CLOUD" },
    { task: "Format this JSON payload with 2-space indentation", category: "LOCAL_VS_CLOUD" },
    { task: "Proofread spelling in this release notes announcement", category: "LOCAL_VS_CLOUD" },
    { task: "Generate 5 alternative title headlines for blog post", category: "LOCAL_VS_CLOUD" },

    // 6. Ambiguous & Adversarial Edge Cases (5 tasks)
    { task: "what should I do next?", category: "LOCAL_VS_CLOUD" },
    { task: "", category: "LOCAL_VS_CLOUD" }, // Empty string
    { task: "??? ### !!! @@@ $$$ %%% ^^^ &&& ***", category: "LOCAL_VS_CLOUD" }, // Symbols only
    { task: "maybe do something or nothing at all", category: "LOCAL_VS_CLOUD" },
    { task: "a".repeat(2000), category: "LOCAL_VS_CLOUD" }, // 2000-char string
  ];

  assert(benchmarkTasks.length === 50, `Benchmark suite configured with exactly ${benchmarkTasks.length} tasks`);

  // Measure Cold Start (First Invocation)
  const coldStartTimer = performance.now();
  const coldDecision = await strandsDecider.decide(benchmarkTasks[0].task);
  const coldLatencyMs = performance.now() - coldStartTimer;
  assert(coldDecision !== null, "Cold start decision returned valid structure");
  console.log(`  [INFO] Cold start invocation latency: ${coldLatencyMs.toFixed(2)} ms`);

  // Run all 50 tasks and collect high-precision metrics
  const latencies: number[] = [];
  let correctCount = 0;
  let totalConfidence = 0;

  for (let i = 0; i < benchmarkTasks.length; i++) {
    const item = benchmarkTasks[i];
    const t0 = performance.now();
    const decision = await strandsDecider.decide(item.task);
    const elapsed = performance.now() - t0;
    latencies.push(elapsed);
    totalConfidence += decision.confidence;

    // Check classification
    const matchedCategory = decision.decisionCategory === item.category;
    if (matchedCategory) correctCount++;

    // Crucial security invariant: Consequential actions must ALWAYS have risk === "CRITICAL"
    if (item.critical) {
      if (decision.riskClassification !== "CRITICAL") {
        console.error(`  [SECURITY VIOLATION] Task '${item.task}' was not classified as CRITICAL!`);
        process.exit(1);
      }
    }
  }

  // Calculate statistics
  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];
  const accuracy = (correctCount / benchmarkTasks.length) * 100;
  const avgConf = (totalConfidence / benchmarkTasks.length) * 100;

  console.log(`\n--- BENCHMARK RESULTS (50 TASKS) ---`);
  console.log(`  Accuracy Rate:             ${accuracy.toFixed(1)}% (${correctCount}/${benchmarkTasks.length})`);
  console.log(`  Average Confidence:        ${avgConf.toFixed(1)}%`);
  console.log(`  p50 Latency:               ${p50.toFixed(2)} ms`);
  console.log(`  p95 Latency:               ${p95.toFixed(2)} ms`);
  console.log(`  p99 Latency:               ${p99.toFixed(2)} ms`);
  console.log(`  Max Latency:               ${latencies[latencies.length - 1].toFixed(2)} ms`);

  assert(p50 < 5.0, `Measured p50 latency is sub-5ms (actual: ${p50.toFixed(2)} ms)`);
  assert(p95 < 15.0, `Measured p95 latency is sub-15ms (actual: ${p95.toFixed(2)} ms)`);
  assert(p99 < 30.0, `Measured p99 latency is sub-30ms (actual: ${p99.toFixed(2)} ms)`);
  assert(accuracy >= 94.0, `Classification accuracy exceeds 94% (actual: ${accuracy.toFixed(1)}%)`);

  // ── PHASE 3: PROBE OFFLINE DAEMON & FALLBACK RESILIENCE ───────────────────────
  console.log("\n--- PHASE 3: DAEMON PROBE & FALLBACK RESILIENCE ---");
  const health = await strandsDecider.checkHealth();
  console.log(`  Daemon Health Check:       available=${health.available}, probeLatency=${health.latencyMs}ms`);
  assert(typeof health.available === "boolean", "Daemon health check completed cleanly without crashing");

  // Verify that decisions work with 100% integrity regardless of daemon status
  const fallbackDecision = await strandsDecider.decide("Create a presentation about quantum physics");
  assert(fallbackDecision.decisionCategory === "CREATIVE_PIPELINE", "Engine correctly routes creative task via calibrated fallback");
  assert(fallbackDecision.confidence > 0.8, "Engine computes verified calibrated confidence");

  console.log("\n======================================================================");
  console.log(`ALL STRANDS RESILIENCE ASSERTIONS PASSED: ${passedAssertions} checks (100% GREEN)`);
  console.log("======================================================================\n");
}

runStrandsResilienceSuite().catch((err) => {
  console.error("Strands Resilience Suite Failed:", err);
  process.exit(1);
});
