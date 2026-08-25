/**
 * ANTIGRAVITY MCP, FIGMA & FILESYSTEM HARDENING VALIDATION
 */
import { figmaAdapter } from "../src/server/tools/figma-adapter";
import { filesystemSecurity } from "../src/server/tools/filesystem-security";
import { mcpRegistry } from "../src/server/tools/mcp-registry";

async function main() {
  console.log("==================================================================");
  console.log("🚀 STARTING MCP, FIGMA & FILESYSTEM HARDENING VALIDATION");
  console.log("==================================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, title: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${title}`);
    }
  }

  // 1. Filesystem Security Sandbox Validation
  console.log("1. Testing Filesystem Security Sandboxing & Secret Protection...");
  const validFile = filesystemSecurity.validatePath("package.json");
  assert(validFile.allowed === true, "Valid workspace file allowed (package.json)");

  const traversalAttempt = filesystemSecurity.validatePath("../../../Windows/System32/cmd.exe");
  assert(traversalAttempt.allowed === false, "Path traversal outside workspace strictly DENIED");
  assert(Boolean(traversalAttempt.reason?.includes("PATH_TRAVERSAL")), "Path traversal reason recorded");

  const secretAttempt = filesystemSecurity.validatePath(".env");
  assert(secretAttempt.allowed === false, "Direct access to .env secret strictly DENIED");
  assert(secretAttempt.isSecretFile === true, "Secret file classification verified");

  // 2. Figma Adapter Validation
  console.log("\n2. Testing Figma Adapter & Secure Auth State...");
  const figmaState = figmaAdapter.getExecutionState();
  assert(figmaState.mode === "LIVE" || figmaState.mode === "AUTH_REQUIRED", "Figma returns non-fabricated execution state");
  
  const tokenRes = await figmaAdapter.extractTokens("test_file_id");
  assert(Boolean(tokenRes.tokens.colors.primary), "Design tokens extracted (colors/typography/radii)");
  assert(tokenRes.tokens.radii.md === 8, "Design token scales properly populated");

  const frameRes = await figmaAdapter.extractFrame("test_file_id", "0:1");
  assert(frameRes.width === 1440, "Desktop frame dimensions 1440px preserved");

  // 3. MCP Server Ecosystem Validation
  console.log("\n3. Testing Installed MCP Servers Governance Registry...");
  const allServers = mcpRegistry.getAllServers();
  assert(allServers.length >= 7, `Verified ${allServers.length} MCP servers registered`);
  
  const stitch = mcpRegistry.getServer("StitchMCP");
  assert(stitch?.status === "HEALTHY", "Google Stitch MCP is HEALTHY");

  const blender = mcpRegistry.getServer("blender");
  assert(blender?.status === "HEALTHY", "Blender 3D MCP is HEALTHY");

  const playwright = mcpRegistry.getServer("playwright");
  assert(playwright?.status === "HEALTHY", "Playwright Browser MCP is HEALTHY");

  const prisma = mcpRegistry.getServer("prisma-mcp-server");
  assert(prisma?.status === "HEALTHY", "Prisma Database MCP is HEALTHY");

  console.log("\n==================================================================");
  console.log(`SUMMARY: ${passed}/${total} MCP & SECURITY TESTS PASSED`);
  console.log("==================================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("MCP & Figma validation crashed:", err);
  process.exit(1);
});
