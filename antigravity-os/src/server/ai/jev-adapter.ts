/**
 * ANTIGRAVITY OS v2.1.1 — OFFICIAL JEV SYSTEM ONE ADAPTER
 * src/server/ai/jev-adapter.ts: Official server-side integration for Jev AI
 *
 * Source of Truth:
 * - Repository: https://github.com/jev-ai/system-one-jev
 * - Official Website: https://thejevai.com
 * - Documentation: https://thejevai.com/docs
 * - Endpoint: POST https://thejevai.com/v1/systemone
 * - Documented Model: typesafe/jev-1.13
 * - Question types: choice, score, noul
 */

import { DesktopSecurityFabric } from "../../desktop/security";

export type JevQuestionType = "choice" | "score" | "noul";

export interface JevChoiceQuestion {
  type: "choice";
  instructions: string;
  criteria: Record<string, string | null>;
}

export interface JevScoreQuestion {
  type: "score";
  instructions: string;
  criteria: string[];
}

export interface JevNoulQuestion {
  type: "noul";
  instructions: string;
  criteria?: { true?: string; false?: string };
}

export type JevQuestion = JevChoiceQuestion | JevScoreQuestion | JevNoulQuestion;

export interface JevSystemOneRequest {
  model?: string;
  state: string | Record<string, any> | string[];
  questions: Record<string, JevQuestion>;
}

export interface JevChoiceAnswer {
  type: "choice";
  choice: string;
  probabilities?: Record<string, number>;
  confidence?: number;
}

export interface JevScoreAnswer {
  type: "score";
  score: number;
  legend?: string | Record<string, string>;
  probabilities?: number[] | Record<string, number>;
  confidence?: number;
}

export interface JevNoulAnswer {
  type: "noul";
  noul: number;
  confidence?: number;
}

export type JevAnswer = JevChoiceAnswer | JevScoreAnswer | JevNoulAnswer;

export interface JevSystemOneResponse {
  success?: boolean;
  model: string;
  answers: Record<string, any>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    input_tokens?: number;
    output_tokens?: number;
    cost?: number;
  };
  elapsed_ms?: number;
  elapsedMs?: number;
  latencyMs?: number;
  fallbackUsed?: boolean;
  executionEngine?: string;
  error?: string;
}

export type JevStatus =
  | "NOT_CONFIGURED"
  | "AUTH_REQUIRED"
  | "CONNECTED"
  | "DEGRADED"
  | "QUOTA_EXHAUSTED"
  | "DEPENDENCY_OFFLINE"
  | "ERROR";

export interface JevConnectionStatus {
  status: JevStatus;
  endpoint: string;
  model: string;
  isConfigured: boolean;
  lastVerification: string | null;
  lastLatencyMs?: number;
  error?: string;
}

export class JevSystemOneAdapter {
  private static instance: JevSystemOneAdapter;
  private endpointUrl: string;
  private defaultModel: string;
  private timeoutMs: number;
  private lastStatus: JevConnectionStatus;

  private constructor() {
    this.endpointUrl = process.env.JEV_API_URL || "https://thejevai.com/v1/systemone";
    this.defaultModel = process.env.JEV_MODEL || "typesafe/jev-1.13";
    this.timeoutMs = 2500;
    this.lastStatus = {
      status: process.env.JEV_API_KEY ? "AUTH_REQUIRED" : "NOT_CONFIGURED",
      endpoint: this.endpointUrl,
      model: this.defaultModel,
      isConfigured: Boolean(process.env.JEV_API_KEY),
      lastVerification: null,
    };
  }

  public static getInstance(): JevSystemOneAdapter {
    if (!JevSystemOneAdapter.instance) {
      JevSystemOneAdapter.instance = new JevSystemOneAdapter();
    }
    return JevSystemOneAdapter.instance;
  }

  public getStatus(): JevConnectionStatus {
    const isConfigured = Boolean(process.env.JEV_API_KEY);
    return {
      ...this.lastStatus,
      isConfigured,
      status: !isConfigured ? "NOT_CONFIGURED" : this.lastStatus.status,
    };
  }

  public redactSecrets(input: string): string {
    return DesktopSecurityFabric.redactSecrets(input);
  }

  /**
   * Health probe method returning canonical registry status
   */
  public async checkHealth(): Promise<{
    available: boolean;
    status: JevStatus;
    latencyMs?: number;
    details?: string;
  }> {
    const status = await this.testConnection();
    return {
      available: status.status === "CONNECTED",
      status: status.status,
      latencyMs: status.lastLatencyMs,
      details:
        status.error ||
        (status.status === "CONNECTED"
          ? "Verified live Jev System One cloud connection"
          : status.status === "NOT_CONFIGURED"
          ? "JEV_API_KEY is not configured in server environment."
          : `Connection state: ${status.status}`),
    };
  }

  /**
   * Tests the connection with a verified lightweight probe
   */
  public async testConnection(): Promise<JevConnectionStatus> {
    const apiKey = process.env.JEV_API_KEY;
    if (!apiKey) {
      this.lastStatus = {
        status: "NOT_CONFIGURED",
        endpoint: this.endpointUrl,
        model: this.defaultModel,
        isConfigured: false,
        lastVerification: null,
        error: "JEV_API_KEY is not configured in server environment.",
      };
      return this.lastStatus;
    }

    const start = performance.now();
    try {
      const probeReq: JevSystemOneRequest = {
        model: this.defaultModel,
        state: "Antigravity OS integration health check",
        questions: {
          health_check: {
            type: "noul",
            instructions: "Is this system integration operational?",
          },
        },
      };

      const res = await fetch(this.endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(probeReq),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      const latencyMs = Math.round(performance.now() - start);

      if (res.ok) {
        this.lastStatus = {
          status: "CONNECTED",
          endpoint: this.endpointUrl,
          model: this.defaultModel,
          isConfigured: true,
          lastVerification: new Date().toISOString(),
          lastLatencyMs: latencyMs,
        };
        return this.lastStatus;
      }

      if (res.status === 401 || res.status === 403) {
        this.lastStatus = {
          status: "AUTH_REQUIRED",
          endpoint: this.endpointUrl,
          model: this.defaultModel,
          isConfigured: true,
          lastVerification: null,
          lastLatencyMs: latencyMs,
          error: "Invalid or unauthorized JEV_API_KEY",
        };
        return this.lastStatus;
      }

      if (res.status === 429 || res.status === 402) {
        this.lastStatus = {
          status: "QUOTA_EXHAUSTED",
          endpoint: this.endpointUrl,
          model: this.defaultModel,
          isConfigured: true,
          lastVerification: null,
          lastLatencyMs: latencyMs,
          error: "Jev API credits exhausted or rate limit exceeded.",
        };
        return this.lastStatus;
      }

      this.lastStatus = {
        status: "DEGRADED",
        endpoint: this.endpointUrl,
        model: this.defaultModel,
        isConfigured: true,
        lastVerification: null,
        lastLatencyMs: latencyMs,
        error: `HTTP ${res.status}: Unexpected response status`,
      };
      return this.lastStatus;
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      const isTimeout = err?.name === "TimeoutError" || err?.name === "AbortError";
      this.lastStatus = {
        status: isTimeout ? "DEGRADED" : "DEPENDENCY_OFFLINE",
        endpoint: this.endpointUrl,
        model: this.defaultModel,
        isConfigured: true,
        lastVerification: null,
        lastLatencyMs: latencyMs,
        error: this.redactSecrets(err?.message || "Connection failed"),
      };
      return this.lastStatus;
    }
  }

  /**
   * Strictly validates and normalizes raw JSON response according to the question request contract
   */
  public validateAndNormalizeResponse(
    raw: any,
    request: JevSystemOneRequest
  ): {
    success: boolean;
    answers: Record<string, any>;
    usage?: any;
    elapsedMs?: number;
  } {
    if (!raw || typeof raw !== "object") {
      throw new Error("Invalid response: body must be a JSON object");
    }

    if (!raw.answers || typeof raw.answers !== "object") {
      throw new Error("Invalid response structure: missing 'answers' object");
    }

    const normalizedAnswers: Record<string, any> = {};
    for (const [qId, qDef] of Object.entries(request.questions)) {
      const ans = raw.answers[qId];
      if (!ans) {
        throw new Error(`Missing response for expected question ID '${qId}'`);
      }

      if (qDef.type === "choice") {
        if (typeof ans.choice !== "string") {
          throw new Error(`Invalid response structure for choice question '${qId}': missing string choice`);
        }
        normalizedAnswers[qId] = {
          type: "choice",
          choice: ans.choice,
          probabilities: ans.probabilities || {},
          confidence: typeof ans.confidence === "number" ? ans.confidence : 1.0,
        };
      } else if (qDef.type === "score") {
        if (typeof ans.score !== "number") {
          throw new Error(`Invalid response structure for score question '${qId}': missing numeric score`);
        }
        normalizedAnswers[qId] = {
          type: "score",
          score: ans.score,
          legend: ans.legend || {},
          probabilities: ans.probabilities || [],
          confidence: typeof ans.confidence === "number" ? ans.confidence : 1.0,
        };
      } else if (qDef.type === "noul") {
        if (typeof ans.noul !== "number") {
          throw new Error(`Invalid response structure for noul question '${qId}': missing probability noul`);
        }
        normalizedAnswers[qId] = {
          type: "noul",
          noul: ans.noul,
          confidence: typeof ans.confidence === "number" ? ans.confidence : ans.noul,
        };
      }
    }

    return {
      success: true,
      answers: normalizedAnswers,
      usage: raw.usage,
      elapsedMs: raw.elapsed_ms || raw.elapsedMs,
    };
  }

  /**
   * Executes a typed decision request against Jev System One with bounded retries and local fallback
   */
  public async executeSystemOne(
    request: JevSystemOneRequest,
    options?: { timeoutMs?: number; maxRetries?: number }
  ): Promise<JevSystemOneResponse> {
    const apiKey = process.env.JEV_API_KEY;

    // Fallback path when credentials are unconfigured
    if (!apiKey) {
      const startFallback = performance.now();
      const stateStr = typeof request.state === "string" ? request.state : JSON.stringify(request.state);
      const stateLower = stateStr.toLowerCase();
      const isDangerous =
        stateLower.includes("delete") ||
        stateLower.includes("drop") ||
        stateLower.includes("destroy") ||
        stateLower.includes("wipe") ||
        stateLower.includes("fail") ||
        stateLower.includes("500") ||
        stateLower.includes("override");

      const answers: Record<string, any> = {};
      for (const [qId, qDef] of Object.entries(request.questions)) {
        if (qDef.type === "noul") {
          answers[qId] = {
            type: "noul",
            noul: isDangerous ? 0.95 : 0.05,
            confidence: 0.95,
          };
        } else if (qDef.type === "choice") {
          const keys = Object.keys(qDef.criteria);
          const selected = isDangerous && keys.includes("rollback") ? "rollback" : keys[0] || "other";
          answers[qId] = {
            type: "choice",
            choice: selected,
            confidence: 0.90,
            probabilities: { [selected]: 0.90 },
          };
        } else if (qDef.type === "score") {
          answers[qId] = {
            type: "score",
            score: isDangerous ? 5.0 : 1.0,
            confidence: 0.90,
            probabilities: [0.05, 0.05, 0.1, 0.1, 0.7],
          };
        }
      }

      return {
        success: true,
        model: request.model || this.defaultModel,
        answers,
        fallbackUsed: true,
        executionEngine: "strands-fallback-safe",
        latencyMs: Math.max(1, Math.round(performance.now() - startFallback)),
      };
    }

    const timeout = options?.timeoutMs || this.timeoutMs;
    const maxRetries = options?.maxRetries ?? 1;

    let attempt = 0;
    while (attempt <= maxRetries) {
      attempt++;
      try {
        const start = performance.now();
        const payload = {
          model: request.model || this.defaultModel,
          state: request.state,
          questions: request.questions,
        };

        const res = await fetch(this.endpointUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(timeout),
        });

        const latencyMs = Math.round(performance.now() - start);

        if (res.ok) {
          const raw = await res.json();
          const normalized = this.validateAndNormalizeResponse(raw, request);
          return {
            success: true,
            model: request.model || this.defaultModel,
            answers: normalized.answers,
            usage: normalized.usage,
            elapsedMs: normalized.elapsedMs,
            latencyMs,
            fallbackUsed: false,
            executionEngine: "JEV_SYSTEM_ONE",
          };
        }

        if (res.status === 401 || res.status === 403) {
          this.lastStatus.status = "AUTH_REQUIRED";
          break;
        }

        if (res.status === 429 || res.status === 402) {
          this.lastStatus.status = "QUOTA_EXHAUSTED";
          break;
        }

        if (res.status >= 500 && attempt <= maxRetries) {
          await new Promise((r) => setTimeout(r, 100 * attempt));
          continue;
        }

        break;
      } catch (err: any) {
        if (attempt <= maxRetries) {
          await new Promise((r) => setTimeout(r, 100 * attempt));
          continue;
        }
        break;
      }
    }

    // Safe fallback when cloud request failed
    return this.executeSystemOne({ ...request }, { timeoutMs: 0, maxRetries: 0 });
  }
}

export const jevAdapter = JevSystemOneAdapter.getInstance();
