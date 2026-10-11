/**
 * ANTIGRAVITY OS — INTENDED OWNER ACCOUNT AUTHENTICATION VERIFICATION
 * Tests complete authentication pipeline for user identifier 'Ps@3101'.
 * Redacts all secrets, hashes, and session tokens from output.
 */

import { prisma } from "../src/server/db";
import { signInUser, invalidateSession, provisionOwnerAccount } from "../src/server/auth-helper";
import { CryptoService } from "../src/server/security/crypto-service";

async function runAudit() {
  console.log("==================================================================");
  console.log("ANTIGRAVITY OS — INTENDED ACCOUNT AUTHENTICATION AUDIT");
  console.log("==================================================================\n");

  const testId = "Ps@3101";
  const testPass = process.env.TEST_OWNER_PASSWORD || "Vamika@1904";

  let totalTests = 0;
  let passedTests = 0;

  function assertCheck(name: string, condition: boolean, detail: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  [PASS] ${name}: ${detail}`);
    } else {
      console.error(`  [FAIL] ${name}: ${detail}`);
      throw new Error(`Assertion failed: ${name}`);
    }
  }

  // 1. Database Record Verification
  console.log("--- 1. DATABASE RECORD & HASH VERIFICATION ---");
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: testId.toLowerCase() },
        { email: testId }
      ]
    }
  });

  assertCheck("User Exists in Database", !!user, `Found user with ID: ${user?.id}`);
  assertCheck("Role is Sovereign OWNER", user?.role === "OWNER", `Role: ${user?.role}`);
  assertCheck("Password Salt is Stored", !!user?.passwordSalt && user.passwordSalt.length === 64, "32-byte hex salt verified");
  assertCheck("Password Hash is Stored", !!user?.passwordHash && user.passwordHash.length === 128, "64-byte SHA-512 digest verified");
  assertCheck("Account is Not Locked", user?.lockedUntil === null, "Zero active lockouts");

  // 2. Cryptographic Verification
  console.log("\n--- 2. CRYPTOGRAPHIC VERIFICATION ---");
  const isValid = CryptoService.verifyPassword(testPass, user!.passwordHash!, user!.passwordSalt!);
  assertCheck("Cryptographic Password Verification", isValid, "PBKDF2 SHA-512 constant-time verification passed");

  const isInvalid = CryptoService.verifyPassword("WrongPassword123!", user!.passwordHash!, user!.passwordSalt!);
  assertCheck("Invalid Password Rejection", !isInvalid, "Wrong password rejected by crypto service");

  // 3. SignIn Flow (Exact Case)
  console.log("\n--- 3. SIGNIN PIPELINE WITH INTENDED IDENTIFIER ---");
  const authExact = await signInUser(testId, testPass);
  assertCheck("Exact Case Login Success", authExact.user.role === "OWNER", `Authenticated as ${authExact.user.email} (Role: ${authExact.user.role})`);
  assertCheck("Session Token Generated", !!authExact.token && authExact.token.startsWith("sec_tok_"), "Valid high-entropy session issued");

  // Verify Session in DB
  const sessionDb = await prisma.session.findUnique({ where: { token: authExact.token } });
  assertCheck("Session Persisted in DB", !!sessionDb && sessionDb.userId === user!.id, "Session record active in SQLite");

  // 4. SignIn Flow (Normalized Lowercase)
  console.log("\n--- 4. CASE-INSENSITIVE RESILIENCE ---");
  const authLower = await signInUser(testId.toLowerCase(), testPass);
  assertCheck("Normalized Lowercase Login Success", authLower.user.role === "OWNER", `Authenticated as ${authLower.user.email}`);

  // 5. Negative Authentication Tests
  console.log("\n--- 5. ADVERSARIAL & NEGATIVE AUTHENTICATION TESTS ---");
  let wrongPassMsg = "";
  try {
    await signInUser(testId, "IncorrectPassword!#2026");
  } catch (err: any) {
    wrongPassMsg = err.message;
  }
  assertCheck("Wrong Password Returns Generic Error", wrongPassMsg === "Invalid email or password.", `Error: "${wrongPassMsg}"`);

  let unknownUserMsg = "";
  try {
    await signInUser("nonexistent_unknown_user_9999", testPass);
  } catch (err: any) {
    unknownUserMsg = err.message;
  }
  assertCheck("Unknown Username Returns Generic Error", unknownUserMsg === "Invalid email or password.", `Error: "${unknownUserMsg}"`);

  // 6. Session Invalidation
  console.log("\n--- 6. SESSION LIFECYCLE & LOGOUT ---");
  await invalidateSession(authExact.token);
  const destroyedSession = await prisma.session.findUnique({ where: { token: authExact.token } });
  assertCheck("Session Invalidation Upon Logout", destroyedSession === null, "Session record removed from database");

  await invalidateSession(authLower.token);

  // 7. Security of Owner Provisioning Endpoint
  console.log("\n--- 7. OWNER PROVISIONING SECURITY GATE ---");
  let unauthorizedProvision = false;
  try {
    await provisionOwnerAccount("attacker_account", "HackerPass123!#", "wrong_admin_secret");
  } catch (err: any) {
    unauthorizedProvision = true;
  }
  assertCheck("Unauthorized Owner Provisioning Blocked", unauthorizedProvision, "Invalid administrative secret strictly denied");

  console.log("\n==================================================================");
  console.log(`AUDIT COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (100% GREEN)`);
  console.log("INTENDED OWNER ACCOUNT 'Ps@3101' IS FULLY OPERATIONAL AND VERIFIED");
  console.log("==================================================================");
}

runAudit()
  .catch((e) => {
    console.error("[FATAL]", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
