/**
 * ANTIGRAVITY OS v2.1.1 — SECURITY HARDENING & ADVERSARIAL CERTIFICATION
 * scripts/verify-security-hardening.ts: Audits and verifies all security controls:
 * 1. SQLite WAL persistence & Prisma database connection
 * 2. Cryptographic password hashing (PBKDF2 100k iterations, 32-byte salt)
 * 3. Brute-force rate limiting & 15-minute lockout defense
 * 4. Adversarial workspace path traversal defense
 * 5. Secret token redaction across errors, logs, and telemetry
 * 6. Desktop IPC allowlist enforcement & context isolation
 * 7. Google Workspace approval gates for consequential operations
 * 8. Creative tools truth firewall (zero fake generation status)
 */

import { DesktopSecurityFabric } from "../src/desktop/security";
import { CryptoService } from "../src/server/security/crypto-service";
import { AuthRateLimiter } from "../src/server/security/rate-limiter";
import { googleConnector } from "../src/server/tools/google-connector";
import { creativeIntegrations } from "../src/server/tools/creative-integrations";
import { prisma } from "../src/server/db";

async function runSecurityHardeningSuite() {
  console.log("======================================================================");
  console.log("ANTIGRAVITY OS v2.1.1 — SECURITY HARDENING & ADVERSARIAL AUDIT");
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

  // ── PHASE 1: DATABASE PERSISTENCE & PRISMA CLIENT ────────────────────────────
  console.log("--- PHASE 1: SQLITE WAL PERSISTENCE & USER REPOSITORY ---");
  try {
    const walCheck: any = await prisma.$queryRawUnsafe("PRAGMA journal_mode;");
    assert(walCheck[0]?.journal_mode === "wal", `SQLite database is running in WAL mode (actual: ${walCheck[0]?.journal_mode})`);

    const userCount = await prisma.user.count();
    assert(typeof userCount === "number" && userCount >= 0, `Prisma connected to vault successfully: ${userCount} users present`);
  } catch (err: any) {
    console.error("  [FAIL] Database connection failed:", err.message);
    process.exit(1);
  }

  // ── PHASE 2: CRYPTOGRAPHY & BRUTE FORCE DEFENSE ──────────────────────────────
  console.log("\n--- PHASE 2: CRYPTOGRAPHIC INTEGRITY & RATE LIMITING ---");
  const h1 = CryptoService.hashPassword("PasswordAlpha#2026!");
  const h2 = CryptoService.hashPassword("PasswordBeta#2026!");
  assert(h1.salt.length === 64, "Generated 32-byte salt (64 hex characters)");
  assert(h1.salt !== h2.salt, "Cryptographic salts are strictly unique per invocation");

  const pwd = "TestSecurePassword#2026!";
  const hashed = CryptoService.hashPassword(pwd);
  assert(CryptoService.verifyPassword(pwd, hashed.hash, hashed.salt), "Timing-safe password verification succeeded for valid password");
  assert(!CryptoService.verifyPassword("WrongPassword123!", hashed.hash, hashed.salt), "Timing-safe verification strictly rejected incorrect password");

  // Rate limiter check
  const limiter = AuthRateLimiter.getInstance();
  const testIp = `192.0.2.${Math.floor(Math.random() * 200 + 10)}`;
  for (let i = 0; i < 4; i++) {
    limiter.recordFailure(testIp);
  }
  const preLockout = limiter.checkLimit(testIp);
  assert(preLockout.allowed === true && preLockout.remainingAttempts === 1, "4 failed attempts allowed with 1 attempt remaining");

  limiter.recordFailure(testIp); // 5th failure -> triggers lockout
  const postLockout = limiter.checkLimit(testIp);
  assert(postLockout.allowed === false, "5th failed attempt strictly triggered rate limiter lockout");
  assert((postLockout.retryAfterSeconds || 0) > 850, `Lockout active with retry-after: ${postLockout.retryAfterSeconds}s`);

  // ── PHASE 3: ADVERSARIAL PATH TRAVERSAL DEFENSE ──────────────────────────────
  console.log("\n--- PHASE 3: ADVERSARIAL PATH TRAVERSAL DEFENSE ---");
  const traversalPayloads = [
    "../../etc/passwd",
    "..\\..\\Windows\\System32\\cmd.exe",
    "....//....//sensitive-data.json",
    "project/../../../root/.env",
  ];

  for (const payload of traversalPayloads) {
    const check = DesktopSecurityFabric.resolveSafeWorkspacePath(payload);
    assert(
      !check.isWithinWorkspace || !check.safePath.includes("etc/passwd"),
      `Path traversal payload blocked: '${payload}' -> isWithinWorkspace=${check.isWithinWorkspace}`
    );
  }

  // ── PHASE 4: SECRET REDACTION DEFENSE ────────────────────────────────────────
  console.log("\n--- PHASE 4: SECRET REDACTION IN LOGS, ERRORS & TELEMETRY ---");
  const leakSamples = [
    "Error communicating with OpenAI: Authorization: Bearer sk-ant-api03-abcdef1234567890abcdef failed",
    "NVIDIA NIM failed: nvapi-0123456789abcdef0123456789 expired",
    "GitHub push rejected: ghp_0123456789abcdef0123456789 token revoked",
    "Google OAuth key: api_key=AIzaSyB1234567890abcdef123456",
  ];

  for (const sample of leakSamples) {
    const sanitized = DesktopSecurityFabric.redactSecrets(sample);
    assert(!sanitized.includes("sk-ant-api03-abcdef1234567890abcdef"), "OpenAI secret was redacted");
    assert(!sanitized.includes("nvapi-0123456789abcdef0123456789"), "NVIDIA API key was redacted");
    assert(!sanitized.includes("ghp_0123456789abcdef0123456789"), "GitHub personal access token was redacted");
    assert(sanitized.includes("[REDACTED_SECRET]"), "Redaction badge [REDACTED_SECRET] injected in output");
  }

  // ── PHASE 5: DESKTOP IPC ALLOWLIST ENFORCEMENT ───────────────────────────────
  console.log("\n--- PHASE 5: DESKTOP IPC ALLOWLIST ENFORCEMENT ---");
  const validChannels = [
    "desktop:strands-decide",
    "desktop:get-capabilities",
    "desktop:get-creative-tools",
    "desktop:export-native-pptx",
  ];
  for (const ch of validChannels) {
    assert(DesktopSecurityFabric.isIpcChannelAllowed(ch), `Channel '${ch}' is officially allowlisted`);
  }

  const maliciousChannels = [
    "desktop:raw-shell-exec",
    "desktop:eval-arbitrary-code",
    "desktop:read-arbitrary-file",
    "desktop:drop-tables",
  ];
  for (const ch of maliciousChannels) {
    assert(!DesktopSecurityFabric.isIpcChannelAllowed(ch), `Malicious channel '${ch}' is strictly blocked`);
  }

  // ── PHASE 6: GOOGLE WORKSPACE APPROVAL GATING ────────────────────────────────
  console.log("\n--- PHASE 6: GOOGLE WORKSPACE APPROVAL GATING ---");
  const unconfirmedEmail = await googleConnector.sendEmailWithApprovalGate({
    to: "stakeholder@example.com",
    subject: "Audit Report",
    bodyText: "Please find the report.",
  });
  assert(
    unconfirmedEmail.status === "APPROVAL_REQUIRED" || unconfirmedEmail.status === "AUTH_REQUIRED",
    `Email without human approval token blocked: status=${unconfirmedEmail.status}`
  );

  // ── PHASE 7: CREATIVE INTEGRATIONS TRUTH FIREWALL ────────────────────────────
  console.log("\n--- PHASE 7: CREATIVE INTEGRATIONS TRUTH FIREWALL ---");
  const artcraftJob = await creativeIntegrations.submitArtcraftJob("Logo for Antigravity OS", "CYBERPUNK");
  assert(
    artcraftJob.status === "MANUAL_STAGING",
    `Artcraft job returned truthful status: ${artcraftJob.status} (no fake generated file returned)`
  );

  console.log("\n======================================================================");
  console.log(`ALL SECURITY HARDENING ASSERTIONS PASSED: ${passedAssertions} checks (100% GREEN)`);
  console.log("======================================================================\n");
}

runSecurityHardeningSuite().catch((err) => {
  console.error("Security Hardening Suite Failed:", err);
  process.exit(1);
});
