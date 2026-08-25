/**
 * ANTIGRAVITY PRODUCTION SECRET REDACTOR & CREDENTIAL GOVERNOR
 *
 * Scans and redacts API keys, JWTs, Bearer tokens, private keys, database connection strings,
 * and deployment tokens from logs, error messages, JSON artifacts, and terminal outputs.
 */

const SECRET_PATTERNS: { name: string; regex: RegExp; replacement: string }[] = [
  {
    name: "OpenAI API Key",
    regex: /sk-proj-[a-zA-Z0-9_\-]{40,}/g,
    replacement: "[REDACTED_OPENAI_KEY]",
  },
  {
    name: "Generic Bearer Token",
    regex: /Bearer\s+[a-zA-Z0-9_\-\.]{20,}/gi,
    replacement: "Bearer [REDACTED_TOKEN]",
  },
  {
    name: "DeepSeek API Key",
    regex: /sk-[a-f0-9]{32}/gi,
    replacement: "[REDACTED_DEEPSEEK_KEY]",
  },
  {
    name: "OpenRouter API Key",
    regex: /sk-or-v1-[a-f0-9]{64}/gi,
    replacement: "[REDACTED_OPENROUTER_KEY]",
  },
  {
    name: "GitHub Token",
    regex: /ghp_[a-zA-Z0-9]{36}/g,
    replacement: "[REDACTED_GITHUB_TOKEN]",
  },
  {
    name: "Vercel / Deployment Token",
    regex: /vcp_[a-zA-Z0-9]{36,}/gi,
    replacement: "[REDACTED_VERCEL_TOKEN]",
  },
  {
    name: "Netlify Token",
    regex: /nfp_[a-zA-Z0-9]{40,}/gi,
    replacement: "[REDACTED_NETLIFY_TOKEN]",
  },
  {
    name: "PostgreSQL / DB URL Password",
    regex: /postgresql:\/\/[^:]+:([^@]+)@/gi,
    replacement: "postgresql://user:[REDACTED_PASSWORD]@",
  },
  {
    name: "Generic Secret Assignment",
    regex: /(api[_-]?key|secret|password|token|private[_-]?key)\s*[:=]\s*["']([^"']{8,})["']/gi,
    replacement: '$1: "[REDACTED_SECRET]"',
  },
];

export class SecretRedactor {
  private static instance: SecretRedactor;

  private constructor() {}

  public static getInstance(): SecretRedactor {
    if (!SecretRedactor.instance) {
      SecretRedactor.instance = new SecretRedactor();
    }
    return SecretRedactor.instance;
  }

  /**
   * Redacts all known secret patterns from string content
   */
  public redactString(input: string): string {
    if (!input || typeof input !== "string") return input;
    let sanitized = input;
    for (const pattern of SECRET_PATTERNS) {
      sanitized = sanitized.replace(pattern.regex, pattern.replacement);
    }
    return sanitized;
  }

  /**
   * Recursively redacts secrets in objects/arrays before serialization or storage
   */
  public redactObject<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === "string") {
      return this.redactString(obj) as unknown as T;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.redactObject(item)) as unknown as T;
    }

    if (typeof obj === "object") {
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes("password") ||
          lowerKey.includes("secret") ||
          lowerKey.includes("token") ||
          lowerKey.includes("apikey") ||
          lowerKey.includes("api_key")
        ) {
          result[key] = typeof value === "string" ? "[REDACTED]" : this.redactObject(value);
        } else {
          result[key] = this.redactObject(value);
        }
      }
      return result as T;
    }

    return obj;
  }

  /**
   * Inspects a string and returns true if an unredacted secret is found
   */
  public containsSecret(input: string): { found: boolean; patternName?: string } {
    if (!input || typeof input !== "string") return { found: false };
    for (const pattern of SECRET_PATTERNS) {
      pattern.regex.lastIndex = 0;
      if (pattern.regex.test(input)) {
        return { found: true, patternName: pattern.name };
      }
    }
    return { found: false };
  }
}

export const secretRedactor = SecretRedactor.getInstance();
