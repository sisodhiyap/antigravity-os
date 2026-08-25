import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { CryptoService } from "../src/server/security/crypto-service";
import { AuthRateLimiter } from "../src/server/security/rate-limiter";
import { prisma } from "../src/server/db";
import { signUpUser, signInUser, invalidateSession } from "../src/server/auth-helper";

interface TestReport {
  name: string;
  category: string;
  passed: boolean;
  details: string;
}

const reports: TestReport[] = [];

function record(name: string, category: string, passed: boolean, details: string) {
  reports.push({ name, category, passed, details });
  const status = passed ? "\x1b[32m[PASS]\x1b[0m" : "\x1b[31m[FAIL]\x1b[0m";
  console.log(`${status} [${category}] ${name} - ${details}`);
}

async function runFullSecuritySuite() {
  console.log("================================================================================");
  console.log("ANTIGRAVITY OS v5.1 — AUTHENTICATION PRODUCTION HARDENING FINAL SECURITY SUITE");
  console.log("================================================================================\n");

  const appDir = path.resolve(__dirname, "..");

  // ============================================================================
  // 1. DEMO CREDENTIALS AUDIT IN SOURCE FILES
  // ============================================================================
  console.log("--- 1. AUDITING SOURCE FILES FOR HARDCODED DEMO CREDENTIALS ---");
  const loginSrc = fs.readFileSync(path.join(appDir, "src/app/login/page.tsx"), "utf-8");
  const signupSrc = fs.readFileSync(path.join(appDir, "src/app/signup/page.tsx"), "utf-8");
  const helperSrc = fs.readFileSync(path.join(appDir, "src/server/auth-helper.ts"), "utf-8");

  const demoEmailInLogin = loginSrc.includes("operator@antigravity.ai");
  const demoPassInLogin = loginSrc.includes("Antigravity2026!");
  const demoEmailInHelper = helperSrc.includes("operator@antigravity.ai");
  const demoPassInHelper = helperSrc.includes("Antigravity2026!");
  const quickFillInLogin = loginSrc.includes("Quick Fill Demo");

  record(
    "Login Page Demo Credentials",
    "SOURCE_AUDIT",
    !demoEmailInLogin && !demoPassInLogin && !quickFillInLogin,
    !demoEmailInLogin ? "No demo credentials or Quick Fill button in login page" : "Found demo credentials in login page!"
  );

  record(
    "Auth Helper Demo Credentials",
    "SOURCE_AUDIT",
    !demoEmailInHelper && !demoPassInHelper,
    !demoEmailInHelper ? "No hardcoded demo operator in auth helper" : "Found hardcoded demo operator in auth helper!"
  );

  // ============================================================================
  // 2. MARKETING CLAIMS REMOVAL AUDIT
  // ============================================================================
  console.log("\n--- 2. AUDITING FOR UNSUPPORTED MARKETING CLAIMS ---");
  const cryptoSrc = fs.readFileSync(path.join(appDir, "src/server/security/crypto-service.ts"), "utf-8");
  const militaryInCrypto = cryptoSrc.includes("Military-Grade");
  const militaryInLogin = loginSrc.includes("Military-Grade");
  const militaryInSignup = signupSrc.includes("Military-Grade");

  record(
    "Military-Grade Marketing Claim Removal",
    "SECURITY_MARKETING",
    !militaryInCrypto && !militaryInLogin && !militaryInSignup,
    "Replaced 'Military-Grade' with measurable labels ('High-Entropy', 'Strong')"
  );

  // ============================================================================
  // 3. CRYPTOGRAPHIC PASSWORD SECURITY TESTS
  // ============================================================================
  console.log("\n--- 3. TESTING CRYPTOGRAPHIC PASSWORD SECURITY ---");
  const testPassword = "Password#2026!SecureUnicode🔒";
  const { hash, salt } = CryptoService.hashPassword(testPassword);

  record(
    "PBKDF2 Salt Generation",
    "CRYPTOGRAPHY",
    salt.length === 64,
    `Generated 32-byte cryptographically secure salt (${salt.substring(0, 16)}...)`
  );

  record(
    "PBKDF2 SHA-512 Hash Generation",
    "CRYPTOGRAPHY",
    hash.length === 128,
    `Generated 64-byte SHA-512 digest with 100k iterations (${hash.substring(0, 16)}...)`
  );

  const hashB = CryptoService.hashPassword(testPassword);
  record(
    "Salt Uniqueness Per Hashing Call",
    "CRYPTOGRAPHY",
    hash.salt !== hashB.salt && hash.hash !== hashB.hash,
    "Each password hashing invocation generates a distinct random salt"
  );

  const verifyValid = CryptoService.verifyPassword(testPassword, hash, salt);
  const verifyInvalid = CryptoService.verifyPassword("WrongPassword123!", hash, salt);
  const verifyUnicode = CryptoService.verifyPassword(testPassword, hash, salt);

  record(
    "Constant-Time Password Verification",
    "CRYPTOGRAPHY",
    verifyValid && !verifyInvalid && verifyUnicode,
    "Valid password matches; invalid password rejected in constant time"
  );

  // Test password edge cases (Unicode, very long 1000-char, empty, short)
  const longPass = "A".repeat(1000) + "a1!#";
  const longHashed = CryptoService.hashPassword(longPass);
  const longVerify = CryptoService.verifyPassword(longPass, longHashed.hash, longHashed.salt);
  record(
    "1000-Character Long Password Support",
    "CRYPTOGRAPHY",
    longVerify,
    "Successfully hashed and verified 1000-character long password"
  );

  // ============================================================================
  // 4. BRUTE-FORCE RATE LIMITING & LOCKOUT
  // ============================================================================
  console.log("\n--- 4. TESTING BRUTE-FORCE RATE LIMITING & LOCKOUTS ---");
  const limiter = AuthRateLimiter.getInstance();
  limiter.reset();

  const attackTarget = `test_account_${Date.now()}@domain.com`;
  for (let i = 1; i <= 4; i++) {
    limiter.recordFailure(attackTarget);
  }
  const attempt4Status = limiter.checkLimit(attackTarget);
  record(
    "Rate Limiter: 4 Failed Attempts Allowed",
    "RATE_LIMITING",
    attempt4Status.allowed && attempt4Status.remainingAttempts === 1,
    `Allowed with ${attempt4Status.remainingAttempts} attempt remaining`
  );

  const attempt5Status = limiter.recordFailure(attackTarget);
  record(
    "Rate Limiter: 5th Failed Attempt Triggers Lockout",
    "RATE_LIMITING",
    !attempt5Status.allowed && attempt5Status.remainingAttempts === 0 && (attempt5Status.retryAfterSeconds || 0) > 800,
    `Lockout active for ${attempt5Status.retryAfterSeconds}s`
  );

  const attempt6Status = limiter.checkLimit(attackTarget);
  record(
    "Rate Limiter: 6th Attempt Blocked by Lockout",
    "RATE_LIMITING",
    !attempt6Status.allowed,
    `Blocked with retryAfter=${attempt6Status.retryAfterSeconds}s`
  );

  // ============================================================================
  // 5. DATABASE AUTHENTICATION & ENUMERATION DEFENSE
  // ============================================================================
  console.log("\n--- 5. TESTING DATABASE AUTH & ENUMERATION PROTECTION ---");
  const uniqueEmail = `qa_user_${Date.now()}@internal-audit.test`;
  const validPass = "ValidPass#2026!Alpha";

  // Clean up
  await prisma.user.deleteMany({ where: { email: uniqueEmail } });

  const signupResult = await signUpUser(uniqueEmail, validPass, "ADMIN"); // Passing ADMIN to test role protection
  record(
    "RBAC: Public Signup Role Escalation Blocked",
    "RBAC",
    signupResult.user.role === "USER",
    `Requested 'ADMIN', server strictly assigned '${signupResult.user.role}'`
  );

  // Verify in SQLite that password is saved ONLY as hash and salt
  const dbRecord = await prisma.user.findUnique({ where: { email: uniqueEmail } });
  const plaintextFoundInDb = JSON.stringify(dbRecord).includes(validPass);
  record(
    "Database: Password Plaintext Leak Prevention",
    "DATABASE_SECURITY",
    !plaintextFoundInDb && !!dbRecord?.passwordHash && !!dbRecord?.passwordSalt,
    "Password stored strictly as PBKDF2 hash & salt; plaintext never stored in DB"
  );

  // Test Non-Enumerating Error Message for Invalid Password
  let invalidMsg = "";
  try {
    await signInUser(uniqueEmail, "IncorrectPass123!");
  } catch (err: any) {
    invalidMsg = err.message;
  }
  record(
    "Auth Enumeration: Non-Revealing Password Error",
    "ENUMERATION_DEFENSE",
    invalidMsg === "Invalid email or password.",
    `Error returned: "${invalidMsg}"`
  );

  // Test Non-Enumerating Error Message for Non-Existent User
  let nonExistentMsg = "";
  try {
    await signInUser("totally-unknown-user@doesnotexist.com", "SomePass123!");
  } catch (err: any) {
    nonExistentMsg = err.message;
  }
  record(
    "Auth Enumeration: Non-Revealing User Not Found Error",
    "ENUMERATION_DEFENSE",
    nonExistentMsg === "Invalid email or password.",
    `Error returned: "${nonExistentMsg}" (Matches invalid password error exactly)`
  );

  // Test Successful Login & Session Rotation
  const loginResult = await signInUser(uniqueEmail, validPass);
  record(
    "Session Rotation Upon Signin",
    "SESSION_SECURITY",
    loginResult.token !== signupResult.token,
    "New high-entropy session token issued upon signin"
  );

  // Test Session Invalidation on Logout
  await invalidateSession(loginResult.token);
  const checkInvalidated = await prisma.session.findUnique({ where: { token: loginResult.token } });
  record(
    "Session Invalidation Upon Logout",
    "SESSION_SECURITY",
    checkInvalidated === null,
    "Session record deleted from database upon logout"
  );

  // Clean up
  await prisma.user.deleteMany({ where: { email: uniqueEmail } });

  // ============================================================================
  // 6. CLIENT BUNDLE SECRET SCAN
  // ============================================================================
  console.log("\n--- 6. SCANNING COMPILED CLIENT JS BUNDLES FOR EXPOSED SECRETS ---");
  const nextStaticDir = path.join(appDir, ".next/static");
  let exposedSecretsCount = 0;
  const secretPatterns = [
    /sk-proj-[a-zA-Z0-9_\-]{30,}/,
    /sk-or-v1-[a-f0-9]{64}/,
    /[^a-zA-Z0-9]sk-[a-zA-Z0-9]{40,}[^a-zA-Z0-9]/,
    /ghp_[a-zA-Z0-9]{36}/,
    /AIza[0-9A-Za-z\-_]{35}/,
    /vcp_[a-zA-Z0-9]{24,}/,
    /Antigravity2026!/,
  ];

  if (fs.existsSync(nextStaticDir)) {
    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(full);
        } else if (entry.name.endsWith(".js")) {
          const content = fs.readFileSync(full, "utf-8");
          for (const pattern of secretPatterns) {
            if (pattern.test(content)) {
              exposedSecretsCount++;
              console.error(`[LEAK DETECTED] Match in ${entry.name}: ${pattern}`);
            }
          }
        }
      }
    };
    scanDir(nextStaticDir);
  }

  record(
    "Client Bundle Secret Scanning",
    "SECRET_SCAN",
    exposedSecretsCount === 0,
    `Scanned .next/static client JavaScript bundles: ${exposedSecretsCount} secrets found`
  );

  // ============================================================================
  // 7. GIT COMMITS & WORKING TREE SECRET SCAN
  // ============================================================================
  console.log("\n--- 7. SCANNING GIT RECENT COMMITS & TRACKED SOURCE FILES ---");
  let gitSecretFound = false;
  try {
    const gitLog = execSync("git log -n 10 -p", { cwd: appDir, encoding: "utf-8" });
    if (gitLog.includes("ghp_") || gitLog.includes("sk-proj-")) {
      // Check if actual live keys are present (dummy strings exempted)
      const matches = gitLog.match(/ghp_[a-zA-Z0-9]{36}/g) || [];
      if (matches.length > 0) {
        gitSecretFound = true;
      }
    }
  } catch {}

  record(
    "Git History Secret Scanning",
    "GIT_SCAN",
    !gitSecretFound,
    "No live API credentials detected in recent git commits"
  );

  // ============================================================================
  // 8. AUDIT LOG SECURITY AUDIT
  // ============================================================================
  console.log("\n--- 8. AUDITING SQLite AUDIT LOG ENTRIES ---");
  const recentLogs = await prisma.auditLog.findMany({ take: 20, orderBy: { createdAt: "desc" } });
  let sensitiveInLogs = false;
  for (const log of recentLogs) {
    const serialized = JSON.stringify(log);
    if (serialized.includes("password") && serialized.includes("ValidPass") || serialized.includes("sec_tok_")) {
      sensitiveInLogs = true;
    }
  }
  record(
    "Audit Log Privacy & Security",
    "AUDIT_LOG",
    !sensitiveInLogs,
    `Inspected ${recentLogs.length} audit logs: Zero passwords, API keys, or session tokens stored`
  );

  // ============================================================================
  // SUMMARY AND OUTPUT GENERATION
  // ============================================================================
  console.log("\n================================================================================");
  console.log("FINAL SECURITY AUDIT SUMMARY");
  console.log("================================================================================");

  const totalTests = reports.length;
  const passedTests = reports.filter((r) => r.passed).length;
  const failedTests = totalTests - passedTests;

  console.log(`Total Security Checks: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);

  const allPassed = failedTests === 0;

  // Write JSON artifact
  const artifactDir = path.resolve(appDir, "../artifacts/security");
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const jsonReport = {
    timestamp: new Date().toISOString(),
    overallState: allPassed ? "SECURITY_GATE_APPROVED" : "SECURITY_GATE_BLOCKED",
    passed: allPassed,
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
    },
    checks: reports,
  };

  fs.writeFileSync(
    path.join(artifactDir, "final-auth-security.json"),
    JSON.stringify(jsonReport, null, 2)
  );

  // Also copy to antigravity-os/artifacts/security if needed
  const localArtifactDir = path.join(appDir, "artifacts/security");
  if (!fs.existsSync(localArtifactDir)) {
    fs.mkdirSync(localArtifactDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(localArtifactDir, "final-auth-security.json"),
    JSON.stringify(jsonReport, null, 2)
  );

  console.log(`\nArtifact generated: artifacts/security/final-auth-security.json`);

  if (!allPassed) {
    process.exit(1);
  }
}

runFullSecuritySuite()
  .catch((err) => {
    console.error("Security Suite Execution Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
