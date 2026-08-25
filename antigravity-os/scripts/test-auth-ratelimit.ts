import { AuthRateLimiter } from "../src/server/security/rate-limiter";

async function runRateLimitTests() {
  console.log("==================================================");
  console.log("1. AUTH RATE LIMITER: 5-TRIAL SLIDING WINDOW & LOCKOUT");
  console.log("==================================================");

  const limiter = AuthRateLimiter.getInstance();
  limiter.reset();

  const testKey = "attacker@hostile-domain.net";

  // Initial check
  const initial = limiter.checkLimit(testKey);
  console.log(`[PASS] Initial state: allowed=${initial.allowed}, remaining=${initial.remainingAttempts}`);
  if (!initial.allowed || initial.remainingAttempts !== 5) {
    throw new Error("Initial rate limit state incorrect!");
  }

  // 4 failed attempts
  for (let i = 1; i <= 4; i++) {
    const status = limiter.recordFailure(testKey);
    console.log(`[PASS] Failed attempt #${i} -> allowed=${status.allowed}, remaining=${status.remainingAttempts}`);
    if (!status.allowed || status.remainingAttempts !== 5 - i) {
      throw new Error(`Attempt #${i} state mismatch!`);
    }
  }

  // 5th failed attempt -> MUST LOCKOUT
  const lockedStatus = limiter.recordFailure(testKey);
  console.log(
    `[PASS] Failed attempt #5 (THRESHOLD REACHED) -> allowed=${lockedStatus.allowed}, remaining=${lockedStatus.remainingAttempts}, lockedUntil=${lockedStatus.lockedUntil?.toISOString()}, retryAfterSeconds=${lockedStatus.retryAfterSeconds}s`
  );

  if (lockedStatus.allowed !== false || lockedStatus.remainingAttempts !== 0 || !lockedStatus.lockedUntil) {
    throw new Error("Lockout failed to trigger on 5th attempt!");
  }

  // 6th attempt while locked out
  const blockedCheck = limiter.checkLimit(testKey);
  console.log(`[PASS] Post-lockout check -> allowed=${blockedCheck.allowed}, retryAfter=${blockedCheck.retryAfterSeconds}s`);
  if (blockedCheck.allowed) {
    throw new Error("Subsequent attempt was not blocked!");
  }

  // Test success reset on another account
  const validKey = "operator@valid-domain.com";
  limiter.recordFailure(validKey);
  limiter.recordFailure(validKey);
  limiter.recordSuccess(validKey);

  const afterSuccess = limiter.checkLimit(validKey);
  console.log(`[PASS] Post-success reset -> allowed=${afterSuccess.allowed}, remaining=${afterSuccess.remainingAttempts}`);
  if (afterSuccess.remainingAttempts !== 5) {
    throw new Error("Success did not clear failure counter!");
  }

  console.log("\n[SUCCESS] ALL RATE LIMITING & LOCKOUT TESTS PASSED 100%!");
}

runRateLimitTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
