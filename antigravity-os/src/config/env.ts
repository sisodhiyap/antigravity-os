import { z } from "zod";

/**
 * Server-only environment schema.
 * Never expose these variables to the browser runtime.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().default("3000"),

  // Database & Supabase
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // AI Provider Keys & Pools
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_API_KEY_POOL: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),
  DEEPSEEK_BASE_URL: z.string().url().default("https://api.deepseek.com"),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_BASE_URL: z.string().url().default("https://openrouter.ai/api/v1"),
  ROUTER9_API_KEY: z.string().optional(),
  ROUTER9_BASE_URL: z.string().url().default("https://api.router9.com/v1"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_API_KEY_POOL: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  OLLAMA_BASE_URL: z.string().url().default("http://127.0.0.1:11434"),

  // External APIs & VCS
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_USERNAME: z.string().optional(),
  VERCEL_TOKEN: z.string().optional(),
  NETLIFY_AUTH_TOKEN: z.string().optional(),
  CLOUDFLARE_API_TOKEN: z.string().optional(),
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  FIGMA_ACCESS_TOKEN: z.string().optional(),
  STABILITY_API_KEY: z.string().optional(),
  STITCH_API_KEY: z.string().optional(),

  // Budgets & Rate Limits
  GLOBAL_TOKEN_BUDGET: z.coerce.number().default(1000000),
  MAX_AGENT_ITERATIONS: z.coerce.number().default(25),
  DEFAULT_TASK_TIMEOUT_MS: z.coerce.number().default(120000),
});

/**
 * Public client-safe environment schema (prefixed with NEXT_PUBLIC_)
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("Antigravity OS"),
  NEXT_PUBLIC_APP_VERSION: z.string().default("4.0.0"),
  NEXT_PUBLIC_API_BASE_URL: z.string().default("/api"),
  NEXT_PUBLIC_TELEMETRY_INTERVAL_MS: z.coerce.number().default(1000),
});

export type ServerConfig = z.infer<typeof serverEnvSchema>;
export type PublicConfig = z.infer<typeof publicEnvSchema>;

class ConfigManager {
  private static instance: ConfigManager;
  public readonly server: ServerConfig;
  public readonly public: PublicConfig;

  private constructor() {
    // Validate Public Environment
    const publicParsed = publicEnvSchema.safeParse({
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      NEXT_PUBLIC_TELEMETRY_INTERVAL_MS: process.env.NEXT_PUBLIC_TELEMETRY_INTERVAL_MS,
    });

    if (!publicParsed.success) {
      console.error("❌ Invalid public environment configuration:", publicParsed.error.format());
      throw new Error("Invalid public environment configuration");
    }
    this.public = publicParsed.data;

    // Validate Server Environment (only in Node.js server context)
    if (typeof window === "undefined") {
      const serverParsed = serverEnvSchema.safeParse(process.env);
      if (!serverParsed.success) {
        console.error("❌ Invalid server environment configuration:", serverParsed.error.format());
        throw new Error("Invalid server environment configuration");
      }
      this.server = serverParsed.data;
    } else {
      // In browser context, dummy safe server config to avoid exposure
      this.server = {} as ServerConfig;
    }
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }
}

export const env = ConfigManager.getInstance();
