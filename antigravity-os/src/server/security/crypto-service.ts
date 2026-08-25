import crypto from "crypto";

export interface PasswordStrengthResult {
  valid: boolean;
  score: number; // 0 to 4
  label: "Critical" | "Weak" | "Fair" | "Strong" | "High-Entropy";
  issues: string[];
}

export class CryptoService {
  private static readonly ITERATIONS = 100000;
  private static readonly KEYLEN = 64;
  private static readonly DIGEST = "sha512";

  /**
   * Hashes a plaintext password using PBKDF2 with SHA-512 and a unique 32-byte salt.
   */
  public static hashPassword(password: string): { hash: string; salt: string } {
    if (!password || typeof password !== "string") {
      throw new Error("Password must be a non-empty string");
    }

    const salt = crypto.randomBytes(32).toString("hex");
    const hash = crypto
      .pbkdf2Sync(password, salt, this.ITERATIONS, this.KEYLEN, this.DIGEST)
      .toString("hex");

    return { hash, salt };
  }

  /**
   * Verifies a candidate password against a stored PBKDF2 hash and salt in constant time.
   */
  public static verifyPassword(
    password: string,
    storedHash: string,
    storedSalt: string
  ): boolean {
    if (!password || !storedHash || !storedSalt) {
      return false;
    }

    try {
      const candidateHash = crypto
        .pbkdf2Sync(password, storedSalt, this.ITERATIONS, this.KEYLEN, this.DIGEST)
        .toString("hex");

      const storedBuffer = Buffer.from(storedHash, "hex");
      const candidateBuffer = Buffer.from(candidateHash, "hex");

      if (storedBuffer.length !== candidateBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(storedBuffer, candidateBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Evaluates password complexity and strength against enterprise standards.
   */
  public static validatePasswordStrength(password: string): PasswordStrengthResult {
    const issues: string[] = [];
    let score = 0;

    if (!password || password.length < 8) {
      issues.push("Password must be at least 8 characters long");
    } else {
      score += 1;
      if (password.length >= 12) score += 1;
    }

    if (!/[a-z]/.test(password)) {
      issues.push("Password must contain at least one lowercase letter");
    }

    if (!/[A-Z]/.test(password)) {
      issues.push("Password must contain at least one uppercase letter");
    }

    if (!/[0-9]/.test(password)) {
      issues.push("Password must contain at least one digit");
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
      issues.push("Password must contain at least one special symbol");
    }

    // Additional score for character diversity
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) score += 1;

    // Normalize score to 0..4
    const finalScore = Math.min(4, Math.max(0, score));

    const labels: Array<"Critical" | "Weak" | "Fair" | "Strong" | "High-Entropy"> = [
      "Critical",
      "Weak",
      "Fair",
      "Strong",
      "High-Entropy",
    ];

    return {
      valid: issues.length === 0 && password.length >= 8,
      score: finalScore,
      label: labels[finalScore] || "Weak",
      issues,
    };
  }

  /**
   * Generates a cryptographically secure random session token.
   */
  public static generateSessionToken(): string {
    return `sec_tok_${crypto.randomBytes(32).toString("hex")}`;
  }
}
