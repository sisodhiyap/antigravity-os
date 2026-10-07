/**
 * ANTIGRAVITY OS v6.0 — INTEGRATION FABRIC
 * IntegrationFabric: Manages typed integrations for APIs, OAuth, Payments, Storage, Email, AI, Search, and Analytics
 */

export type IntegrationCategory =
  | "REST_API"
  | "OAUTH_AUTH"
  | "PAYMENTS_BILLING"
  | "OBJECT_STORAGE"
  | "EMAIL_NOTIFICATIONS"
  | "AI_ROUTING"
  | "FULL_TEXT_SEARCH"
  | "USAGE_ANALYTICS";

export interface IntegrationBinding {
  integrationId: string;
  category: IntegrationCategory;
  provider: string;
  endpoint: string;
  isSandboxed: boolean;
  status: "ACTIVE" | "MOCKED_FOR_TEST" | "CONFIGURED";
}

export class IntegrationFabric {
  private readonly bindings: Map<string, IntegrationBinding> = new Map();

  public registerDefaultIntegrations(): void {
    const defaultIntegrations: IntegrationBinding[] = [
      { integrationId: "int_rest", category: "REST_API", provider: "Internal SQLite REST Router", endpoint: "/api/v1", isSandboxed: true, status: "ACTIVE" },
      { integrationId: "int_oauth", category: "OAUTH_AUTH", provider: "Local PBKDF2/JWT Provider", endpoint: "/api/auth", isSandboxed: true, status: "ACTIVE" },
      { integrationId: "int_pay", category: "PAYMENTS_BILLING", provider: "Stripe Webhook Handler (Local Sandbox)", endpoint: "/api/billing/webhook", isSandboxed: true, status: "ACTIVE" },
      { integrationId: "int_storage", category: "OBJECT_STORAGE", provider: "Local Asset Bucket / Multi-part Upload", endpoint: "/api/storage", isSandboxed: true, status: "ACTIVE" },
      { integrationId: "int_email", category: "EMAIL_NOTIFICATIONS", provider: "Transactional Mail Queue (Local SQLite Queue)", endpoint: "/api/notifications", isSandboxed: true, status: "ACTIVE" },
      { integrationId: "int_ai", category: "AI_ROUTING", provider: "Local GPU Ollama (qwen2.5-coder:7b)", endpoint: "http://127.0.0.1:11434", isSandboxed: true, status: "ACTIVE" },
      { integrationId: "int_search", category: "FULL_TEXT_SEARCH", provider: "SQLite FTS5 / BM25 In-Memory Index", endpoint: "/api/search", isSandboxed: true, status: "ACTIVE" },
      { integrationId: "int_analytics", category: "USAGE_ANALYTICS", provider: "Privacy-Preserving Local Telemetry DB", endpoint: "/api/analytics", isSandboxed: true, status: "ACTIVE" }
    ];

    defaultIntegrations.forEach((int) => this.bindings.set(int.integrationId, int));
  }

  public getAllIntegrations(): IntegrationBinding[] {
    return Array.from(this.bindings.values());
  }
}
