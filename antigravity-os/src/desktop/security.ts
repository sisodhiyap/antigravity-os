/**
 * ANTIGRAVITY OS V7 — DESKTOP SECURITY FABRIC
 * security.ts: Hardens desktop IPC, sanitizes renderer commands, prevents directory traversal,
 * redacts secrets, validates external URLs, and guarantees sandbox integrity.
 */

import path from "path";

export class DesktopSecurityFabric {
  private static readonly ALLOWED_IPC_CHANNELS = new Set([
    "desktop:get-hardware-health",
    "desktop:get-services",
    "desktop:start-service",
    "desktop:stop-service",
    "desktop:restart-service",
    "desktop:tail-logs",
    "desktop:export-diagnostics",
    "desktop:list-projects",
    "desktop:create-project",
    "desktop:open-project-vault",
    "desktop:emergency-stop",
    "desktop:open-external",
    "desktop:get-app-version",
    "desktop:get-logs-path",
  ]);

  private static readonly SECRET_PATTERNS = [
    /(?:api[_-]?key|secret|token|password|auth|openai[_-]?key)[\s:=]+([a-zA-Z0-9_\-]{10,})/gi,
    /sk-[a-zA-Z0-9_\-]{16,}/g,
    /nvapi-[a-zA-Z0-9_\-]{16,}/g,
    /gsk_[a-zA-Z0-9_\-]{16,}/g,
    /ghp_[a-zA-Z0-9_\-]{16,}/g,
    /vcp_[a-zA-Z0-9_\-]{16,}/g,
    /vck_[a-zA-Z0-9_\-]{16,}/g,
    /nfp_[a-zA-Z0-9_\-]{16,}/g,
    /figd_[a-zA-Z0-9_\-]{16,}/g,
    /Bearer\s+([a-zA-Z0-9\-_.]{16,})/gi,
  ];

  public static isIpcChannelAllowed(channel: string): boolean {
    return DesktopSecurityFabric.ALLOWED_IPC_CHANNELS.has(channel);
  }

  public static isSafeExternalUrl(targetUrl: string): boolean {
    try {
      const parsed = new URL(targetUrl);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  }

  public static getCspString(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "media-src 'self' data: blob: https:",
      "connect-src 'self' http://127.0.0.1:* http://localhost:* ws://127.0.0.1:* ws://localhost:* https://api.openai.com https://api.deepseek.com https://openrouter.ai https://api.groq.com https://integrate.api.nvidia.com https://generativelanguage.googleapis.com",
    ].join("; ");
  }

  public static resolveSafeWorkspacePath(relativePath: string): { safePath: string; isWithinWorkspace: boolean } {
    const workspaceRoot = path.resolve(process.cwd(), "workspaces");
    const resolved = path.resolve(workspaceRoot, relativePath);
    const isWithinWorkspace = resolved.startsWith(workspaceRoot);
    return {
      safePath: isWithinWorkspace ? resolved : workspaceRoot,
      isWithinWorkspace,
    };
  }

  public static redactSecrets(input: string): string {
    if (!input || typeof input !== "string") return "";
    let sanitized = input;
    for (const pattern of DesktopSecurityFabric.SECRET_PATTERNS) {
      sanitized = sanitized.replace(pattern, (match) => {
        return match.slice(0, 6) + "...[REDACTED_SECRET]";
      });
    }
    return sanitized;
  }
}
