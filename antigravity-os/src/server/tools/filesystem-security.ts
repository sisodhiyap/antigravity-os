import path from "path";
import fs from "fs";

export interface PathValidationResult {
  allowed: boolean;
  normalizedPath: string;
  reason?: string;
  isSecretFile?: boolean;
}

export class HardenedFilesystemSecurity {
  private static instance: HardenedFilesystemSecurity;
  private workspaceRoot: string;

  private constructor() {
    this.workspaceRoot = path.resolve(process.cwd());
  }

  public static getInstance(): HardenedFilesystemSecurity {
    if (!HardenedFilesystemSecurity.instance) {
      HardenedFilesystemSecurity.instance = new HardenedFilesystemSecurity();
    }
    return HardenedFilesystemSecurity.instance;
  }

  /**
   * Validates whether a file path is safely contained within workspace boundaries
   */
  public validatePath(targetPath: string, customRoot?: string): PathValidationResult {
    const root = path.resolve(customRoot || this.workspaceRoot);
    const resolvedTarget = path.resolve(root, targetPath);

    // 1. Check for secret files (.env, credentials, private keys, .git)
    const basename = path.basename(resolvedTarget).toLowerCase();
    const isSecret =
      basename.startsWith(".env") ||
      basename.includes("id_rsa") ||
      basename.includes("credentials.json") ||
      basename.endsWith(".pem") ||
      resolvedTarget.includes(path.sep + ".git") ||
      basename === ".git";

    // 2. Traversal verification: target must start with workspace root
    const relative = path.relative(root, resolvedTarget);
    const isInsideWorkspace =
      !relative.startsWith("..") && !path.isAbsolute(relative) && resolvedTarget.startsWith(root);

    if (!isInsideWorkspace) {
      return {
        allowed: false,
        normalizedPath: resolvedTarget,
        reason: "PATH_TRAVERSAL_DETECTED: Target path is outside designated workspace root",
        isSecretFile: isSecret,
      };
    }

    if (isSecret) {
      return {
        allowed: false,
        normalizedPath: resolvedTarget,
        reason: "SECRET_ACCESS_FORBIDDEN: Direct access to security credentials is restricted",
        isSecretFile: true,
      };
    }

    return {
      allowed: true,
      normalizedPath: resolvedTarget,
      isSecretFile: false,
    };
  }

  /**
   * Safely reads a file with security checks applied
   */
  public safeReadFile(targetPath: string): { success: boolean; data?: string; error?: string } {
    const check = this.validatePath(targetPath);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    try {
      if (!fs.existsSync(check.normalizedPath)) {
        return { success: false, error: "FILE_NOT_FOUND" };
      }
      const data = fs.readFileSync(check.normalizedPath, "utf-8");
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

export const filesystemSecurity = HardenedFilesystemSecurity.getInstance();
