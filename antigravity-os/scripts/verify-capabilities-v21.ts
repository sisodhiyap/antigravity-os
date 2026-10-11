/**
 * ANTIGRAVITY OS v2.1 — AUTHORITATIVE CAPABILITY REGISTRY VERIFICATION SCRIPT
 * Tests all 17 capability domains for empirical truthful status.
 */

import { authoritativeRegistry } from "../src/capabilities/AuthoritativeRegistry";

async function main() {
  console.log("============================================================");
  console.log("ANTIGRAVITY OS v2.1 — AUTHORITATIVE CAPABILITY MATRIX AUDIT");
  console.log("============================================================\n");

  const capabilities = await authoritativeRegistry.evaluateAllCapabilities();
  console.log(`Total Authoritative Domains Evaluated: ${capabilities.length}\n`);

  capabilities.forEach((c, idx) => {
    console.log(
      `[${String(idx + 1).padStart(2, "0")}] ${c.id.padEnd(26)} | Status: ${c.status.padEnd(20)} | Impl: ${c.implementationStatus.padEnd(11)} | Conn: ${c.connectionStatus.padEnd(12)} | Verified: ${c.isRealExecutionVerified}`
    );
  });

  if (capabilities.length < 17) {
    throw new Error(`Expected at least 17 capability domains, but found ${capabilities.length}`);
  }

  const strandsCap = capabilities.find((c) => c.id === "strands-decider");
  if (!strandsCap || strandsCap.status !== "READY") {
    throw new Error("Strands Decider capability not reporting READY status!");
  }

  const pptxCap = capabilities.find((c) => c.id === "presentx-native-pptx");
  if (!pptxCap || pptxCap.status !== "READY") {
    throw new Error("PresentX Native PPTX capability not reporting READY status!");
  }

  console.log("\n============================================================");
  console.log("AUTHORITATIVE CAPABILITY MATRIX AUDIT PASSED!");
  console.log("============================================================");
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
