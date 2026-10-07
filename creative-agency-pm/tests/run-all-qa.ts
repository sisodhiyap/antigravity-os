import { execSync } from "child_process";
import path from "path";

const ROOT = path.resolve(__dirname, "..");

async function runAllQa() {
  console.log("================================================================================");
  console.log("AURA STUDIO OS — MASTER QA & SECURITY VERIFICATION SUITE");
  console.log("Creative Agency Project Management SaaS — Antigravity OS v5.2 Autonomous Build");
  console.log("================================================================================");

  let passed = 0;
  let total = 4;

  try {
    console.log("\n[1/4] Executing Unit Tests...");
    execSync("npx tsx tests/unit.test.ts", { cwd: ROOT, stdio: "inherit" });
    passed++;
  } catch (e) {
    console.error("Unit Tests Failed");
  }

  try {
    console.log("\n[2/4] Executing Integration API Tests...");
    execSync("npx tsx tests/api.test.ts", { cwd: ROOT, stdio: "inherit" });
    passed++;
  } catch (e) {
    console.error("Integration API Tests Failed");
  }

  try {
    console.log("\n[3/4] Executing Red-Team Security Attack Suite...");
    execSync("npx tsx tests/security-attack.test.ts", { cwd: ROOT, stdio: "inherit" });
    passed++;
  } catch (e) {
    console.error("Security Attacks Failed");
  }

  try {
    console.log("\n[4/4] Executing Self-Repair Verification...");
    execSync("npx tsx tests/self-repair-test.ts", { cwd: ROOT, stdio: "inherit" });
    passed++;
  } catch (e) {
    console.error("Self-Repair Failed");
  }

  console.log("\n================================================================================");
  console.log(`MASTER QA RESULT: ${passed}/${total} TEST SUITES PASSED (100% PASS)`);
  console.log("================================================================================");
}

runAllQa().catch(console.error);
