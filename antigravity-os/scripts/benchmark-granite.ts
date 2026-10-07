/**
 * ANTIGRAVITY OS V7 — GRANITE 4.2 BENCHMARK RUNNER
 * scripts/benchmark-granite.ts
 */

import fs from "fs";
import path from "path";
import { GraniteBenchmarkEngine } from "../src/plugins/granite";

const ARTIFACTS_DIR = path.resolve(process.cwd(), "artifacts", "granite-v7", "benchmark");

async function runGraniteBenchmark() {
  console.log("================================================================================");
  console.log("ANTIGRAVITY OS V7 — IBM GRANITE 4.2 MULTI-DOMAIN BENCHMARK ENGINE");
  console.log("================================================================================\n");

  if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

  const engine = GraniteBenchmarkEngine.getInstance();
  console.log(">>> Executing 10-Scenario Benchmark across Granite Model Family...\n");

  const result = await engine.runFullBenchmark();

  console.log("BENCHMARK SCORE TABLE:");
  console.log("----------------------------------------------------------------------------------");
  console.log("Scenario ID                     | Model           | Score | Latency | Tokens");
  console.log("----------------------------------------------------------------------------------");
  result.detailedScores.forEach((s) => {
    console.log(`${s.scenarioId.padEnd(31)} | ${s.modelId.padEnd(15)} | ${String(s.overallScore).padStart(5)} | ${String(s.latencyMs).padStart(5)}ms | ${s.tokenCount}`);
  });
  console.log("----------------------------------------------------------------------------------");

  console.log("\nMODEL RANKINGS:");
  result.modelRankings.forEach((r, idx) => {
    console.log(`  #${idx + 1}: ${r.modelId} — Average Score: ${r.averageScore}/100 • Average Latency: ${r.averageLatencyMs}ms`);
  });

  const benchmarkPath = path.join(ARTIFACTS_DIR, "benchmark-results.json");
  fs.writeFileSync(benchmarkPath, JSON.stringify(result, null, 2));

  console.log(`\nPersisted Raw Benchmark Results: ${benchmarkPath}`);
  console.log("================================================================================");
  console.log(`BENCHMARK VERDICT: ${result.judgingDecision} (Signature: ${result.verdictSignature.slice(0, 16)}...)`);
  console.log("================================================================================\n");
}

runGraniteBenchmark().catch((e) => {
  console.error("Granite Benchmark Failure:", e);
  process.exit(1);
});
