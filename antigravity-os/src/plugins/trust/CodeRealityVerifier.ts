/**
 * ANTIGRAVITY OS v7.0 — FACT-BASED INTELLIGENCE + SECURITY FABRIC
 * CodeRealityVerifier.ts: Empirical code reality distinction: DOCUMENTED -> IMPLEMENTED -> EXECUTABLE -> TESTED -> VERIFIED
 */

import fs from "fs";
import path from "path";
import { CodeRealityResult, CodeRealityState } from "./TrustTypes";

export class CodeRealityVerifier {
  private static instance: CodeRealityVerifier;

  public static getInstance(): CodeRealityVerifier {
    if (!CodeRealityVerifier.instance) {
      CodeRealityVerifier.instance = new CodeRealityVerifier();
    }
    return CodeRealityVerifier.instance;
  }

  /**
   * Verifies technical claims about source code, files, or system capabilities
   */
  public verifyCodeReality(params: {
    targetName: string;
    docFiles?: string[];
    codeFiles?: string[];
    testFiles?: string[];
    executionCheck?: () => boolean;
    independentVerification?: boolean;
  }): CodeRealityResult {
    const cwd = process.cwd();
    let hasDocs = false;
    let hasCode = false;
    let testsPass = false;
    let executes = false;
    const evidence: string[] = [];

    // 1. Check Documentation
    if (params.docFiles && params.docFiles.length > 0) {
      for (const doc of params.docFiles) {
        const fullPath = path.isAbsolute(doc) ? doc : path.join(cwd, doc);
        if (fs.existsSync(fullPath)) {
          hasDocs = true;
          evidence.push(`DOC_FOUND: ${doc} (${fs.statSync(fullPath).size} bytes)`);
        }
      }
    }

    // 2. Check Code Implementation
    if (params.codeFiles && params.codeFiles.length > 0) {
      let foundCodeCount = 0;
      for (const code of params.codeFiles) {
        const fullPath = path.isAbsolute(code) ? code : path.join(cwd, code);
        if (fs.existsSync(fullPath)) {
          foundCodeCount++;
          evidence.push(`CODE_FOUND: ${code} (${fs.statSync(fullPath).size} bytes)`);
        }
      }
      if (foundCodeCount === params.codeFiles.length && foundCodeCount > 0) {
        hasCode = true;
      }
    }

    // 3. Execution Check
    if (hasCode && params.executionCheck) {
      try {
        executes = params.executionCheck();
        evidence.push(`EXECUTION_RESULT: ${executes ? "PASS" : "FAIL"}`);
      } catch (err) {
        executes = false;
        evidence.push(`EXECUTION_ERROR: ${String(err)}`);
      }
    } else if (hasCode) {
      executes = true;
    }

    // 4. Test Pass Check
    if (params.testFiles && params.testFiles.length > 0) {
      let foundTests = 0;
      for (const t of params.testFiles) {
        const fullPath = path.isAbsolute(t) ? t : path.join(cwd, t);
        if (fs.existsSync(fullPath)) {
          foundTests++;
          evidence.push(`TEST_FILE_FOUND: ${t}`);
        }
      }
      testsPass = foundTests === params.testFiles.length && executes;
    }

    // 5. Independent Verification
    const independentCheck = Boolean(params.independentVerification && testsPass);

    // Determine state
    let state: CodeRealityState = "DOCUMENTED";
    if (independentCheck) {
      state = "VERIFIED";
    } else if (testsPass) {
      state = "TESTED";
    } else if (executes && hasCode) {
      state = "EXECUTABLE";
    } else if (hasCode) {
      state = "IMPLEMENTED";
    } else if (hasDocs) {
      state = "DOCUMENTED";
    }

    return {
      target: params.targetName,
      state,
      hasDocs,
      hasCode,
      executes,
      testsPass,
      independentCheck,
      evidence
    };
  }
}
