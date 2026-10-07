import crypto from "crypto";
import { db, User } from "../db/database";
import { CONFIG } from "../config";

export interface SessionData {
  userId: string;
  email: string;
  role: User["role"];
  name: string;
  issuedAt: number;
  expiresAt: number;
}

export class AuthService {
  private static ITERATIONS = 100000;
  private static KEY_LEN = 64;
  private static DIGEST = "sha512";

  public static hashPassword(password: string): { hash: string; salt: string } {
    const salt = crypto.randomBytes(32).toString("hex");
    const hash = crypto
      .pbkdf2Sync(password, salt, AuthService.ITERATIONS, AuthService.KEY_LEN, AuthService.DIGEST)
      .toString("hex");
    return { hash, salt };
  }

  public static verifyPassword(password: string, hash: string, salt: string): boolean {
    const computedHash = crypto
      .pbkdf2Sync(password, salt, AuthService.ITERATIONS, AuthService.KEY_LEN, AuthService.DIGEST)
      .toString("hex");
    
    // Constant-time comparison to prevent timing attacks
    const bufA = Buffer.from(computedHash, "hex");
    const bufB = Buffer.from(hash, "hex");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }

  public static createSessionToken(user: User): string {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const payload: SessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      issuedAt: Math.floor(Date.now() / 1000),
      expiresAt: Math.floor(Date.now() / 1000) + CONFIG.SESSION_MAX_AGE_SEC
    };
    const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = crypto
      .createHmac("sha256", CONFIG.SESSION_SECRET)
      .update(`${header}.${payloadEncoded}`)
      .digest("base64url");

    return `${header}.${payloadEncoded}.${signature}`;
  }

  public static verifySessionToken(token: string): SessionData | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const [header, payloadEncoded, signature] = parts;

      const expectedSig = crypto
        .createHmac("sha256", CONFIG.SESSION_SECRET)
        .update(`${header}.${payloadEncoded}`)
        .digest("base64url");

      const bufA = Buffer.from(signature);
      const bufB = Buffer.from(expectedSig);
      if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
        return null;
      }

      const payload: SessionData = JSON.parse(Buffer.from(payloadEncoded, "base64url").toString("utf-8"));
      if (payload.expiresAt < Math.floor(Date.now() / 1000)) {
        return null; // Expired
      }
      return payload;
    } catch {
      return null;
    }
  }
}
