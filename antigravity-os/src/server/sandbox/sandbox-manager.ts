import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { ToolExecutionError } from "@/lib/errors";

const execAsync = promisify(exec);

export interface SandboxEnvironment {
  sandboxId: string;
  workspaceId: string;
  projectId: string;
  taskId: string;
  rootPath: string;
  createdAt: string;
}

export interface SandboxExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
}

export class SandboxManager {
  private static instance: SandboxManager;
  private sandboxes: Map<string, SandboxEnvironment> = new Map();
  private baseStoragePath: string;

  private constructor() {
    this.baseStoragePath = path.resolve(process.cwd(), "workspaces");
    if (!fs.existsSync(this.baseStoragePath)) {
      try {
        fs.mkdirSync(this.baseStoragePath, { recursive: true });
      } catch (_) {}
    }
  }

  public static getInstance(): SandboxManager {
    if (!SandboxManager.instance) {
      SandboxManager.instance = new SandboxManager();
    }
    return SandboxManager.instance;
  }

  public provisionSandbox(workspaceId: string, projectId: string, taskId: string): SandboxEnvironment {
    const sandboxId = `sb_${workspaceId}_${projectId}_${taskId}`.replace(/[^a-zA-Z0-9_]/g, "_");
    const rootPath = path.join(this.baseStoragePath, workspaceId, projectId, taskId);

    if (!fs.existsSync(rootPath)) {
      fs.mkdirSync(rootPath, { recursive: true });
    }

    const env: SandboxEnvironment = {
      sandboxId,
      workspaceId,
      projectId,
      taskId,
      rootPath,
      createdAt: new Date().toISOString(),
    };

    this.sandboxes.set(sandboxId, env);
    return env;
  }

  /**
   * Safely writes a file within the sandbox, strictly detecting and rejecting path traversal escapes
   */
  public writeFile(sandboxId: string, relativeFilePath: string, content: string): string {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) throw new ToolExecutionError("sandbox", `Sandbox '${sandboxId}' not found`);

    if (relativeFilePath.includes("..")) {
      throw new ToolExecutionError("sandbox", "Security violation: Path traversal escape attempt detected");
    }

    const targetPath = path.resolve(sandbox.rootPath, relativeFilePath);

    // Verify boundary containment
    if (!targetPath.startsWith(sandbox.rootPath)) {
      throw new ToolExecutionError("sandbox", "Security violation: Path traversal escape attempt detected");
    }

    const parentDir = path.dirname(targetPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(targetPath, content, "utf-8");
    return targetPath;
  }

  public async executeCommand(
    sandboxId: string,
    command: string,
    timeoutMs = 30000
  ): Promise<SandboxExecResult> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) throw new ToolExecutionError("sandbox", `Sandbox '${sandboxId}' not found`);

    const lowerCmd = command.toLowerCase();
    if (
      lowerCmd.includes("rm -rf /") ||
      lowerCmd.includes("format c:") ||
      lowerCmd.includes("shutdown") ||
      lowerCmd.includes(":(){ :|:& };:")
    ) {
      throw new ToolExecutionError("sandbox", "Security violation: Destructive host command rejected");
    }

    const start = performance.now();
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: sandbox.rootPath,
        timeout: timeoutMs,
        maxBuffer: 10 * 1024 * 1024,
      });

      return {
        stdout: stdout || "",
        stderr: stderr || "",
        exitCode: 0,
        durationMs: Math.round(performance.now() - start),
      };
    } catch (err: any) {
      return {
        stdout: err.stdout || "",
        stderr: err.stderr || err.message || "Command execution error",
        exitCode: err.code || 1,
        durationMs: Math.round(performance.now() - start),
      };
    }
  }

  public getSandbox(sandboxId: string): SandboxEnvironment | undefined {
    return this.sandboxes.get(sandboxId);
  }
}

export const sandboxManager = SandboxManager.getInstance();
