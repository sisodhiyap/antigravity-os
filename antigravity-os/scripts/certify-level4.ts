/**
 * ANTIGRAVITY LEVEL-4 MASTER CERTIFICATION PIPELINE RUNNER
 *
 * Runs the comprehensive end-to-end certification pipeline:
 * 1. Master Platform Baseline (32 tests)
 * 2. Failure Injection & Security Red Team (17 tests)
 * 3. 10-App Factory Benchmarks Suite (10 benchmarks)
 * 4. Real-World Stress Factory (5 apps, 80 files, 15 defects healed, 100 tests)
 * 5. Real Playwright Chromium Browser E2E (15 tests)
 * 6. Real HTTP API Integration (17 endpoints)
 * 7. Real AI Provider Fault Injection (8 tests)
 * 8. Real Sandbox Attack & Escape Defense (11 attacks)
 * 9. Real Concurrency & Isolation Stress (35 parallel tasks)
 * 10. Production Deployment, Governance & Rollback Suite (10 tests)
 * 11. Strict TypeScript Compilation Gate (tsc --noEmit, 0 errors required)
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const EVIDENCE_DIR = path.resolve(process.cwd(), "artifacts", "level4");

interface StageResult {
  stageNumber: number;
  name: string;
  command: string;
  passed: boolean;
  durationMs: number;
  exitCode: number;
  outputSummary: string;
}

const stages: StageResult[] = [];

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function runStage(stageNumber: number, name: string, command: string): boolean {
  console.log(`\n==================================================================`);
  console.log(`[STAGE ${stageNumber}/11] ${name}`);
  console.log(`Command: ${command}`);
  console.log(`==================================================================`);

  const start = performance.now();
  let passed = false;
  let exitCode = 0;
  let outputSummary = "";

  try {
    const output = execSync(command, {
      cwd: process.cwd(),
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 120000,
    });
    passed = true;
    exitCode = 0;
    const lines = output.trim().split("\n");
    outputSummary = lines.slice(-5).join(" | ");
    console.log(output);
  } catch (err: any) {
    passed = false;
    exitCode = err.status ?? 1;
    outputSummary = (err.stdout || err.message || "").trim().split("\n").slice(-3).join(" | ");
    console.error(`❌ Stage ${stageNumber} FAILED (exit ${exitCode})`);
    if (err.stdout) console.log(err.stdout);
    if (err.stderr) console.error(err.stderr);
  }

  const durationMs = Math.round(performance.now() - start);
  stages.push({ stageNumber, name, command, passed, durationMs, exitCode, outputSummary });
  return passed;
}

async function main() {
  ensureDir(EVIDENCE_DIR);

  console.log("╔══════════════════════════════════════════════════════════════════╗");
  console.log("║    ANTIGRAVITY LEVEL-4 MASTER CERTIFICATION PIPELINE RUNNER     ║");
  console.log("║    Production-Deployment-Ready Autonomous Software Factory       ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝");
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Node: ${process.version} | Platform: ${process.platform}\n`);

  const masterStart = performance.now();

  runStage(1, "Master Platform Foundation Suite (32 Tests)", "npx tsx scripts/validate-platform.ts");
  runStage(2, "Failure Injection & Security Red Team (17 Tests)", "npx tsx scripts/test-failure-injection.ts");
  runStage(3, "10-App Factory Benchmarks Suite (10 Benchmarks)", "npx tsx scripts/run-all-benchmarks.ts");
  runStage(4, "Real-World Stress Factory (5 Apps, 80 Files, 15 Defects, 100 Tests)", "npx tsx scripts/stress-factory-validation.ts");
  runStage(5, "Real Playwright Chromium Browser E2E (15 Tests)", "npx tsx scripts/real-browser-validation.ts");
  runStage(6, "Real HTTP API Integration Tests (17 Endpoints)", "npx tsx scripts/http-integration-validation.ts");
  runStage(7, "Real AI Provider Fault Injection (8 Tests)", "npx tsx scripts/ai-provider-fault-injection.ts");
  runStage(8, "Real Sandbox Attack & Escape Defense (11 Attacks)", "npx tsx scripts/sandbox-attack-validation.ts");
  runStage(9, "Real Concurrency & Isolation Stress (35 Tasks)", "npx tsx scripts/concurrency-stress-validation.ts");
  runStage(10, "Level 4 Production Deployment & Rollback Suite (10 Tests)", "npx tsx scripts/level4-deployment-validation.ts");
  runStage(11, "Strict TypeScript Compilation Gate (0 Errors Required)", "npm run typecheck");

  const totalDurationMs = Math.round(performance.now() - masterStart);
  const allPassed = stages.every((s) => s.passed);

  const report = {
    certificationTarget: "LEVEL 4 — PRODUCTION-DEPLOYMENT-READY AUTONOMOUS SOFTWARE FACTORY",
    timestamp: new Date().toISOString(),
    totalDurationSeconds: Math.round(totalDurationMs / 1000),
    totalStages: stages.length,
    passedStages: stages.filter((s) => s.passed).length,
    failedStages: stages.filter((s) => !s.passed).length,
    allPassed,
    stages,
  };

  fs.writeFileSync(
    path.join(EVIDENCE_DIR, "master-certification-report.json"),
    JSON.stringify(report, null, 2),
    "utf-8"
  );

  console.log("\n==================================================================");
  console.log("🏆 FINAL MASTER LEVEL-4 CERTIFICATION STAGE SUMMARY");
  console.log("==================================================================");
  stages.forEach((s) => {
    const icon = s.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`  [${icon}] Stage ${s.stageNumber}: ${s.name} (${s.durationMs}ms, exit ${s.exitCode})`);
  });
  console.log(`\n⏱️ Total Execution Time: ${Math.round(totalDurationMs / 1000)}s`);
  console.log(`📁 Master Evidence File: artifacts/level4/master-certification-report.json`);
  console.log("==================================================================");

  if (!allPassed) {
    console.error("❌ CERTIFICATION FAILED — One or more validation stages failed.");
    process.exit(1);
  }

  console.log("🎉 ALL 11 VALIDATION STAGES PASSED CONSECUTIVELY.");
  console.log("📜 ANTIGRAVITY IS OFFICIALLY LEVEL 4 PRODUCTION FACTORY CERTIFIED.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Master Level 4 certification runner fatal error:", err);
  process.exit(1);
});
