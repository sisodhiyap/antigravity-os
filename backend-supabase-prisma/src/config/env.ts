import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL").optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  PORT: z.coerce.number().default(4000),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function getEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.warn("⚠️ Warning: Environment validation warnings:", result.error.format());
    // Return with defaults / raw process.env fallback for development resilience
    return {
      NODE_ENV: (process.env.NODE_ENV as any) || "development",
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/antigravity",
      DIRECT_URL: process.env.DIRECT_URL,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      JWT_SECRET: process.env.JWT_SECRET,
      PORT: parseInt(process.env.PORT || "4000", 10),
    };
  }
  return result.data;
}

export const env = getEnv();
