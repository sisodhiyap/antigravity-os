/**
 * Antigravity OS v5.2 — Deployment Configuration
 *
 * Modes:
 *   LOCAL  — Default. Runs on localhost:3000. No Docker required.
 *   DOCKER — Containerized. All services in Docker network.
 *   CLOUD  — Disabled by default. Requires explicit opt-in.
 */

type DeploymentMode = "LOCAL" | "DOCKER" | "CLOUD";

export const DEPLOYMENT_MODE: DeploymentMode =
  (process.env.DEPLOYMENT_MODE as DeploymentMode) ?? "LOCAL";

export const IS_LOCAL  = DEPLOYMENT_MODE === "LOCAL";
export const IS_DOCKER = DEPLOYMENT_MODE === "DOCKER";
export const IS_CLOUD  = DEPLOYMENT_MODE === "CLOUD";

/** Public cloud deployment is disabled by default */
export const CLOUD_DEPLOYMENT_ENABLED = IS_CLOUD;

/** Service URLs — internal or host depending on mode */
export const OLLAMA_URL =
  process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";

export const AIRLLM_URL =
  process.env.AIRLLM_BASE_URL ?? "http://127.0.0.1:8000";

export const AI_ROUTER_URL =
  process.env.AI_ROUTER_BASE_URL ?? "http://127.0.0.1:8080";

/** Application URL */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
