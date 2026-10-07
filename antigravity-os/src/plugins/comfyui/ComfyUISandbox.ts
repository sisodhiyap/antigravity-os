/**
 * ANTIGRAVITY OS v7.0 — COMFYUI GENERATIVE MEDIA FABRIC
 * ComfyUISandbox.ts: Project-Scoped Sandbox Isolation for Media Pipelines
 */

import fs from "fs";
import path from "path";

export interface MediaSandboxEnv {
  sandboxId: string;
  sandboxDir: string;
  outputDir: string;
  tempDir: string;
}

export class ComfyUISandbox {
  private static readonly activeSandboxes: Map<string, MediaSandboxEnv> = new Map();

  public static createSandbox(projectId: string = "media_session"): MediaSandboxEnv {
    const sandboxId = `sbx_media_${projectId}_${Date.now()}`;
    const sandboxDir = path.resolve(__dirname, "..", "..", "..", "artifacts", "comfyui", "sandboxes", sandboxId);
    const outputDir = path.join(sandboxDir, "outputs");
    const tempDir = path.join(sandboxDir, "temp");

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const env: MediaSandboxEnv = {
      sandboxId,
      sandboxDir,
      outputDir,
      tempDir
    };

    this.activeSandboxes.set(sandboxId, env);
    return env;
  }

  public static validatePathInSandbox(filePath: string, sandbox: MediaSandboxEnv): boolean {
    const resolved = path.resolve(filePath);
    return resolved.startsWith(sandbox.sandboxDir);
  }

  public static teardownSandbox(sandboxId: string): boolean {
    return this.activeSandboxes.delete(sandboxId);
  }
}
