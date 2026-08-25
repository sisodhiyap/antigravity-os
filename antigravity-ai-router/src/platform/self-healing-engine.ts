import { execSync } from 'child_process';

export interface DiagnosticsResult {
  success: boolean;
  command: string;
  output: string;
  errorLog?: string;
  detectedIssues: string[];
  recommendedFix?: string;
}

export class SelfHealingEngine {
  /**
   * Parse error tracebacks from stdout/stderr to isolate root cause
   */
  public parseTraceback(errorText: string): { issues: string[]; recommendedFix: string } {
    const issues: string[] = [];
    let recommendedFix = 'Inspect stack trace and correct invalid symbols or missing parameters.';

    if (!errorText || !errorText.trim()) {
      return { issues: ['Unknown execution error'], recommendedFix };
    }

    if (errorText.includes('Cannot find module') || errorText.includes('ERR_MODULE_NOT_FOUND')) {
      issues.push('Missing dependency or invalid module import path');
      recommendedFix = 'Verify import path relative extensions (.js) and check npm package installation.';
    }

    if (errorText.includes('SyntaxError') || errorText.includes('Unexpected token')) {
      issues.push('Syntax error in source file');
      recommendedFix = 'Fix unclosed brackets, missing trailing commas, or invalid TypeScript syntax.';
    }

    if (errorText.includes('TypeError') || errorText.includes('is not a function')) {
      issues.push('Type error or uninitialized variable call');
      recommendedFix = 'Verify object signature, method existence, and non-null initialization.';
    }

    if (errorText.includes('UnauthorizedAccess') || errorText.includes('ExecutionPolicy')) {
      issues.push('PowerShell script execution policy restriction');
      recommendedFix = 'Execute command using powershell -ExecutionPolicy Bypass.';
    }

    if (issues.length === 0) {
      issues.push('Command failed with non-zero exit code');
    }

    return { issues, recommendedFix };
  }

  /**
   * Run a test/build command and automatically capture failures for diagnosis
   */
  public runDiagnosticCommand(command: string, cwd: string = process.cwd()): DiagnosticsResult {
    try {
      const output = execSync(command, { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
      return {
        success: true,
        command,
        output: output.trim(),
        detectedIssues: []
      };
    } catch (err: any) {
      const errorText = (err.stdout || '') + '\n' + (err.stderr || '') + '\n' + (err.message || '');
      const { issues, recommendedFix } = this.parseTraceback(errorText);

      return {
        success: false,
        command,
        output: err.stdout || '',
        errorLog: errorText.trim(),
        detectedIssues: issues,
        recommendedFix
      };
    }
  }

  /**
   * Execute self-healing repair loop with automatic retry
   */
  public async executeRepairLoop(
    command: string,
    repairHandler: (diagnosis: DiagnosticsResult) => Promise<boolean>,
    maxAttempts: number = 3
  ): Promise<DiagnosticsResult> {
    let attempt = 1;
    let result = this.runDiagnosticCommand(command);

    while (!result.success && attempt < maxAttempts) {
      console.log(`⚠️ Diagnostic failure on attempt ${attempt}/${maxAttempts}. Invoking repair handler...`);
      const repaired = await repairHandler(result);
      if (!repaired) {
        break;
      }
      attempt++;
      result = this.runDiagnosticCommand(command);
    }

    return result;
  }
}
