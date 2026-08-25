import { CryptoService } from "../src/server/security/crypto-service";

async function runCryptoTests() {
  console.log("==================================================");
  console.log("1. CRYPTO SERVICE: PASSWORD HASHING & SALTING");
  console.log("==================================================");

  const password = "SuperSecretSecurePass123!@#";
  const { hash, salt } = CryptoService.hashPassword(password);

  console.log(`[PASS] Generated Salt (32 bytes hex): ${salt}`);
  console.log(`[PASS] Generated PBKDF2 Hash (64 bytes hex): ${hash}`);

  if (salt.length !== 64 || hash.length !== 128) {
    throw new Error("Invalid salt or hash length!");
  }

  // Salt uniqueness test
  const hash2 = CryptoService.hashPassword(password);
  if (hash2.salt === salt || hash2.hash === hash) {
    throw new Error("Salts must be unique per hashing call!");
  }
  console.log("[PASS] Salt uniqueness verified across separate calls.");

  console.log("\n==================================================");
  console.log("2. CRYPTO SERVICE: TIMING-SAFE VERIFICATION");
  console.log("==================================================");

  const isValid = CryptoService.verifyPassword(password, hash, salt);
  console.log(`[PASS] Correct password verification: ${isValid}`);
  if (!isValid) throw new Error("Verification failed for correct password!");

  const isInvalid = CryptoService.verifyPassword("WrongPassword123!", hash, salt);
  console.log(`[PASS] Incorrect password rejected: ${!isInvalid}`);
  if (isInvalid) throw new Error("Incorrect password incorrectly verified!");

  console.log("\n==================================================");
  console.log("3. CRYPTO SERVICE: PASSWORD STRENGTH EVALUATION");
  console.log("==================================================");

  const testCases = [
    { pwd: "weak", expectedValid: false, minScore: 0 },
    { pwd: "password123", expectedValid: false, minScore: 1 },
    { pwd: "Password123", expectedValid: false, minScore: 2 },
    { pwd: "SecurePassword123!", expectedValid: true, minScore: 3 },
    { pwd: "UltraMegaSecure#2026!Antigravity", expectedValid: true, minScore: 4 },
  ];

  for (const tc of testCases) {
    const result = CryptoService.validatePasswordStrength(tc.pwd);
    console.log(
      `Password: "${tc.pwd.padEnd(35)}" -> Valid: ${result.valid} | Score: ${result.score} (${result.label}) | Issues: ${result.issues.length}`
    );
    if (result.valid !== tc.expectedValid) {
      throw new Error(`Strength validation mismatch for "${tc.pwd}"`);
    }
  }

  console.log("\n[SUCCESS] ALL CRYPTOGRAPHIC TESTS PASSED 100%!");
}

runCryptoTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
