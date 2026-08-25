export interface RateLimitStatus {
  allowed: boolean;
  remainingAttempts: number;
  lockedUntil?: Date;
  retryAfterSeconds?: number;
}

interface AttemptRecord {
  attempts: number;
  firstAttemptAt: number;
  lastAttemptAt: number;
  lockedUntil?: number;
}

export class AuthRateLimiter {
  private static instance: AuthRateLimiter;
  private records: Map<string, AttemptRecord> = new Map();
  private readonly MAX_ATTEMPTS = 5;
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

  private constructor() {
    // Periodic garbage collection every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000).unref();
  }

  public static getInstance(): AuthRateLimiter {
    if (!AuthRateLimiter.instance) {
      AuthRateLimiter.instance = new AuthRateLimiter();
    }
    return AuthRateLimiter.instance;
  }

  /**
   * Checks whether an identifier (IP or email) is currently allowed to make authentication attempts.
   */
  public checkLimit(key: string): RateLimitStatus {
    const now = Date.now();
    const record = this.records.get(key);

    if (!record) {
      return {
        allowed: true,
        remainingAttempts: this.MAX_ATTEMPTS,
      };
    }

    // Check if currently locked out
    if (record.lockedUntil && record.lockedUntil > now) {
      const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        lockedUntil: new Date(record.lockedUntil),
        retryAfterSeconds,
      };
    }

    // Check if the attempt window has expired
    if (now - record.firstAttemptAt > this.WINDOW_MS) {
      this.records.delete(key);
      return {
        allowed: true,
        remainingAttempts: this.MAX_ATTEMPTS,
      };
    }

    const remaining = Math.max(0, this.MAX_ATTEMPTS - record.attempts);
    return {
      allowed: remaining > 0,
      remainingAttempts: remaining,
    };
  }

  /**
   * Records a failed authentication attempt. Triggers lockout if threshold is reached.
   */
  public recordFailure(key: string): RateLimitStatus {
    const now = Date.now();
    let record = this.records.get(key);

    if (!record || now - record.firstAttemptAt > this.WINDOW_MS) {
      record = {
        attempts: 1,
        firstAttemptAt: now,
        lastAttemptAt: now,
      };
    } else {
      record.attempts += 1;
      record.lastAttemptAt = now;
    }

    if (record.attempts >= this.MAX_ATTEMPTS) {
      record.lockedUntil = now + this.LOCKOUT_MS;
      this.records.set(key, record);
      const retryAfterSeconds = Math.ceil(this.LOCKOUT_MS / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        lockedUntil: new Date(record.lockedUntil),
        retryAfterSeconds,
      };
    }

    this.records.set(key, record);
    return {
      allowed: true,
      remainingAttempts: this.MAX_ATTEMPTS - record.attempts,
    };
  }

  /**
   * Clears failure records upon a successful authentication.
   */
  public recordSuccess(key: string): void {
    this.records.delete(key);
  }

  /**
   * Housekeeping: removes expired rate limit records.
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      if (record.lockedUntil && record.lockedUntil < now) {
        this.records.delete(key);
      } else if (now - record.lastAttemptAt > this.WINDOW_MS) {
        this.records.delete(key);
      }
    }
  }

  /**
   * For testing purposes: resets all limits.
   */
  public reset(): void {
    this.records.clear();
  }
}
