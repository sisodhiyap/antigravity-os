/**
 * ANTIGRAVITY OS v7.0 — COMFYUI GENERATIVE MEDIA FABRIC
 * ComfyUIClient.ts: Authoritative HTTP client communicating safely with local/remote ComfyUI REST API
 */

export interface ComfyUIPromptResponse {
  prompt_id: string;
  number: number;
  node_errors?: Record<string, unknown>;
}

export interface ComfyUISystemStats {
  system?: {
    os?: string;
    python_version?: string;
    embedded_python?: boolean;
  };
  devices?: Array<{
    name: string;
    type: string;
    index?: number;
    vram_total?: number;
    vram_free?: number;
    torch_vram_total?: number;
    torch_vram_free?: number;
  }>;
}

export class ComfyUIClient {
  private readonly baseUrl: string;
  private readonly clientId: string;

  constructor(baseUrl: string = "http://127.0.0.1:8188", clientId?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.clientId = clientId || `ag_client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getClientId(): string {
    return this.clientId;
  }

  /**
   * Probes /system_stats with a bounded timeout
   */
  public async checkHealth(timeoutMs = 1500): Promise<{ isOnline: boolean; systemStats?: Record<string, unknown> }> {
    try {
      const res = await fetch(`${this.baseUrl}/system_stats`, {
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.ok) {
        const data = await res.json();
        return { isOnline: true, systemStats: data };
      }
      return { isOnline: false };
    } catch {
      return { isOnline: false };
    }
  }

  /**
   * Enqueues a prompt graph to the ComfyUI pipeline
   */
  public async queuePrompt(
    promptGraph: Record<string, unknown>,
    overrideClientId?: string
  ): Promise<ComfyUIPromptResponse> {
    const payload = {
      prompt: promptGraph,
      client_id: overrideClientId || this.clientId,
    };

    const res = await fetch(`${this.baseUrl}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`COMFYUI_QUEUE_ERROR (${res.status}): ${errText || res.statusText}`);
    }

    return (await res.json()) as ComfyUIPromptResponse;
  }

  /**
   * Fetches output history for a given prompt ID or all recent history
   */
  public async getHistory(promptId?: string, timeoutMs = 4000): Promise<Record<string, unknown>> {
    const url = promptId ? `${this.baseUrl}/history/${promptId}` : `${this.baseUrl}/history`;
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) {
      throw new Error(`COMFYUI_HISTORY_ERROR: HTTP ${res.status}`);
    }
    return (await res.json()) as Record<string, unknown>;
  }

  /**
   * Fetches the current execution queue status
   */
  public async getQueue(timeoutMs = 3000): Promise<{ queue_running: unknown[]; queue_pending: unknown[] }> {
    const res = await fetch(`${this.baseUrl}/queue`, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) {
      throw new Error(`COMFYUI_QUEUE_STATUS_ERROR: HTTP ${res.status}`);
    }
    return (await res.json()) as { queue_running: unknown[]; queue_pending: unknown[] };
  }

  /**
   * Fetches available node classes and input schemas
   */
  public async getObjectInfo(nodeClass?: string, timeoutMs = 5000): Promise<Record<string, unknown>> {
    const url = nodeClass ? `${this.baseUrl}/object_info/${nodeClass}` : `${this.baseUrl}/object_info`;
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) {
      throw new Error(`COMFYUI_OBJECT_INFO_ERROR: HTTP ${res.status}`);
    }
    return (await res.json()) as Record<string, unknown>;
  }

  /**
   * Retrieves generated image / media bytes directly from ComfyUI
   */
  public async viewOutput(filename: string, subfolder = "", type = "output"): Promise<ArrayBuffer> {
    const params = new URLSearchParams({ filename, subfolder, type });
    const res = await fetch(`${this.baseUrl}/view?${params.toString()}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      throw new Error(`COMFYUI_VIEW_OUTPUT_ERROR: HTTP ${res.status} for ${filename}`);
    }
    return await res.arrayBuffer();
  }

  /**
   * Interrupts currently executing job
   */
  public async interrupt(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/interrupt`, {
        method: "POST",
        signal: AbortSignal.timeout(2000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
