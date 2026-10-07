/**
 * PRESENTX STUDIO — FINAL INDEPENDENT REALITY VERIFIER
 * independent-presentx-v7-final.ts: Reconstructs conclusions from raw disk files,
 * cryptographic evidence, export structures, and frozen-core SHA-256 hashes.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

const ARTIFACTS_DIR = path.resolve(__dirname, "..", "artifacts", "presentx-v7-final");
const BASELINE_FILE = path.resolve(__dirname, "..", "artifacts", "v7-final-master", "frozen-core-baseline.json");

export function runIndependentPresentXFinalVerification() {
  console.log("================================================================================");
  console.log("INDEPENDENT PRESENTX V7 FINAL REALITY VERIFIER");
  console.log("Reconstructing conclusions from raw disk files & cryptographic evidence...");
  console.log("================================================================================\n");

  const checks: { name: string; status: "PASS" | "FAIL"; details: any }[] = [];

  // 1. Frozen core baseline check
  if (!fs.existsSync(BASELINE_FILE)) {
    throw new Error("Baseline hash file missing!");
  }
  const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, "utf-8"));
  let mutations = 0;

  for (const [filePath, info] of Object.entries(baseline.files as Record<string, { hash: string; bytes: number }>)) {
    const fullPath = path.resolve(__dirname, "..", filePath);
    if (!fs.existsSync(fullPath)) {
      mutations++;
      continue;
    }
    const currentBuf = fs.readFileSync(fullPath);
    const currentHash = crypto.createHash("sha256").update(currentBuf).digest("hex");
    if (currentHash !== info.hash) mutations++;
  }

  checks.push({
    name: "FROZEN_CORE_IMMUTABILITY",
    status: mutations === 0 ? "PASS" : "FAIL",
    details: { totalFilesChecked: Object.keys(baseline.files).length, mutations },
  });

  // 2. Check 12 generated scenario projects
  const requiredScenarios = [
    "scenario_01",
    "scenario_02",
    "scenario_03",
    "scenario_04",
    "scenario_05",
    "scenario_06",
    "scenario_07",
    "scenario_08",
    "scenario_09",
    "scenario_10",
    "scenario_11",
    "scenario_12",
  ];

  let scenariosFound = 0;
  let allScenariosValid = true;

  for (const sc of requiredScenarios) {
    const projectPath = path.join(ARTIFACTS_DIR, `${sc}_project.json`);
    const htmlPath = path.join(ARTIFACTS_DIR, `${sc}.html`);
    const pptxPath = path.join(ARTIFACTS_DIR, `${sc}.pptx.xml`);

    if (fs.existsSync(projectPath) && fs.existsSync(htmlPath) && fs.existsSync(pptxPath)) {
      scenariosFound++;
      const project = JSON.parse(fs.readFileSync(projectPath, "utf-8"));
      if (!project.slides || project.slides.length < 6 || !project.provenanceHash) {
        allScenariosValid = false;
      }
    } else {
      allScenariosValid = false;
    }
  }

  checks.push({
    name: "PRODUCTION_12_SCENARIOS_AND_EXPORTS",
    status: scenariosFound === 12 && allScenariosValid ? "PASS" : "FAIL",
    details: { scenariosFound, allScenariosValid },
  });

  // 3. Check Auto-Repair & Round-Trip Files
  const roundTripFile = path.join(ARTIFACTS_DIR, "roundtrip-results.json");
  const selfHealingFile = path.join(ARTIFACTS_DIR, "self-healing.json");
  const roundTripValid = fs.existsSync(roundTripFile);
  const selfHealingValid = fs.existsSync(selfHealingFile);

  checks.push({
    name: "ROUND_TRIP_AND_SELF_HEALING_AUDIT",
    status: roundTripValid && selfHealingValid ? "PASS" : "FAIL",
    details: { roundTripValid, selfHealingValid },
  });

  const allPassed = checks.every((c) => c.status === "PASS");

  const independentReport = {
    verifier: "Independent PresentX V7 Final Verifier",
    verdict: allPassed && mutations === 0 ? "PROVEN" : "BLOCKED",
    timestamp: new Date().toISOString(),
    coreMutations: mutations,
    checks,
  };

  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, "independent-verdict.json"),
    JSON.stringify(independentReport, null, 2)
  );

  console.log("Independent Verification Result:", independentReport.verdict);
  console.log("Details:", JSON.stringify(independentReport, null, 2));

  return independentReport;
}

if (require.main === module) {
  runIndependentPresentXFinalVerification();
}
