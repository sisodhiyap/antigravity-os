/**
 * ANTIGRAVITY OS — SECURE HUGGING FACE TOKEN RESOLVER
 * Resolves the token from process.env.HF_TOKEN or dynamically from Desktop/antikeys.
 * NEVER exposes the raw token to the client bundle or client-facing responses.
 */

import fs from "fs";
import path from "path";
import os from "os";

let cachedToken: string | null = null;

export function getHuggingFaceToken(): string | null {
  if (cachedToken) {
    return cachedToken;
  }

  // 1. Check process.env
  if (process.env.HF_TOKEN && process.env.HF_TOKEN.trim().startsWith("hf_")) {
    cachedToken = process.env.HF_TOKEN.trim();
    return cachedToken;
  }

  // 2. Discover dynamically from Windows Desktop/antikeys or Desktop/antikeys.txt
  try {
    const homeDir = os.homedir();
    const candidatePaths = [
      path.join(homeDir, "Desktop", "antikeys.txt"),
      path.join(homeDir, "Desktop", "antikeys", "hf_token.txt"),
      path.join(homeDir, "Desktop", "antikeys", "token.txt"),
      path.join(homeDir, "OneDrive", "Desktop", "antikeys.txt"),
      path.join(homeDir, "OneDrive", "Desktop", "antikeys", "token.txt"),
    ];

    for (const cand of candidatePaths) {
      if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
        const text = fs.readFileSync(cand, "utf-8");
        const match = text.match(/hf_[A-Za-z0-9_]{20,}/);
        if (match) {
          cachedToken = match[0].trim();
          process.env.HF_TOKEN = cachedToken;
          return cachedToken;
        }
      }
    }
  } catch {
    // Silent fail; do not leak filesystem paths or errors
  }

  return null;
}

export function isHuggingFaceConfigured(): boolean {
  return Boolean(getHuggingFaceToken());
}

/**
 * Returns safe metadata for diagnostics without revealing the token value.
 */
export async function getHuggingFaceStatus(): Promise<{
  configured: boolean;
  authenticated: boolean;
  username: string | null;
  accountType: string | null;
  error?: string;
}> {
  const token = getHuggingFaceToken();
  if (!token) {
    return {
      configured: false,
      authenticated: false,
      username: null,
      accountType: null,
      error: "No HF_TOKEN found in environment or Desktop/antikeys",
    };
  }

  try {
    // Windows certificate interceptor fallback
    const originalReject = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const res = await fetch("https://huggingface.co/api/whoami-v2", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalReject;

    if (!res.ok) {
      return {
        configured: true,
        authenticated: false,
        username: null,
        accountType: null,
        error: `Hugging Face API returned HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    return {
      configured: true,
      authenticated: true,
      username: data.name || data.fullname || "Authenticated User",
      accountType: data.type || "user",
    };
  } catch (err: any) {
    return {
      configured: true,
      authenticated: false,
      username: null,
      accountType: null,
      error: err?.message || "Connection timeout to huggingface.co",
    };
  }
}
