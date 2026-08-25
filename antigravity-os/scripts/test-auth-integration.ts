import { prisma } from "../src/server/db";
import { signUpUser, signInUser, invalidateSession } from "../src/server/auth-helper";
import { CryptoService } from "../src/server/security/crypto-service";

async function runAuthIntegrationTests() {
  console.log("==================================================");
  console.log("1. AUTH INTEGRATION: SIGNUP WITH PASSWORD HASHING");
  console.log("==================================================");

  const testEmail = `operator_${Date.now()}@antigravity-swarm.internal`;
  const testPassword = "CyberSecurityPass2026!#";

  // Clean up any test user if exists
  await prisma.user.deleteMany({ where: { email: testEmail } });

  const signupResult = await signUpUser(testEmail, testPassword, "ENGINEER");
  console.log(`[PASS] User created with ID: ${signupResult.user.id}`);
  console.log(`[PASS] Assigned Role: ${signupResult.user.role}`);
  console.log(`[PASS] Session Token: ${signupResult.token.substring(0, 20)}...`);

  // Verify in SQLite database that password was hashed with salt
  const dbUser = await prisma.user.findUnique({ where: { email: testEmail } });
  if (!dbUser || !dbUser.passwordHash || !dbUser.passwordSalt) {
    throw new Error("Password was NOT stored as a cryptographic hash in SQLite database!");
  }
  console.log(`[PASS] Verified in SQLite: passwordHash is set (${dbUser.passwordHash.substring(0, 16)}...)`);
  console.log(`[PASS] Verified in SQLite: passwordSalt is set (${dbUser.passwordSalt.substring(0, 16)}...)`);

  console.log("\n==================================================");
  console.log("2. AUTH INTEGRATION: SIGNIN WITH INCORRECT PASSWORD");
  console.log("==================================================");

  let failedCaught = false;
  try {
    await signInUser(testEmail, "WrongPassword123!");
  } catch (err: any) {
    failedCaught = true;
    console.log(`[PASS] Expected failure caught: "${err.message}"`);
  }

  if (!failedCaught) {
    throw new Error("SignIn allowed invalid password!");
  }

  console.log("\n==================================================");
  console.log("3. AUTH INTEGRATION: SIGNIN WITH CORRECT PASSWORD");
  console.log("==================================================");

  const signinResult = await signInUser(testEmail, testPassword);
  console.log(`[PASS] Authenticated User: ${signinResult.user.email}`);
  console.log(`[PASS] Valid Session Token: ${signinResult.token.substring(0, 20)}...`);
  console.log(`[PASS] Session Expires: ${signinResult.expiresAt.toISOString()}`);

  console.log("\n==================================================");
  console.log("4. AUTH INTEGRATION: SESSION INVALIDATION & LOGOUT");
  console.log("==================================================");

  await invalidateSession(signinResult.token);
  const sessionCheck = await prisma.session.findUnique({ where: { token: signinResult.token } });
  console.log(`[PASS] Session destroyed in DB: ${sessionCheck === null}`);
  if (sessionCheck !== null) {
    throw new Error("Session was not invalidated upon logout!");
  }

  // Clean up test user
  await prisma.user.deleteMany({ where: { email: testEmail } });

  console.log("\n[SUCCESS] ALL AUTH & SECURITY INTEGRATION TESTS PASSED 100%!");
}

runAuthIntegrationTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
