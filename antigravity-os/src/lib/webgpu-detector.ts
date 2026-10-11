/**
 * ANTIGRAVITY OS v2.1 — WEBGPU & OFFLINE INTELLIGENCE SENSING
 * webgpu-detector.ts: Probes client-side WebGPU acceleration capabilities.
 * Determines whether client can run in-browser Transformers.js / ONNX Runtime
 * models or must cascade to CPU/WASM or local Ollama/Strands inference.
 */

export interface WebGpuCapabilityReport {
  isWebGpuSupported: boolean;
  executionMode: "WEBGPU_HARDWARE" | "WASM_CPU_FALLBACK" | "SERVER_DELEGATE";
  adapterInfo?: {
    vendor?: string;
    architecture?: string;
    device?: string;
    description?: string;
  };
  maxBufferSizeMb?: number;
  maxComputeWorkgroupSizeX?: number;
  fallbackReason?: string;
}

export class WebGpuDetector {
  private static instance: WebGpuDetector;

  private constructor() {}

  public static getInstance(): WebGpuDetector {
    if (!WebGpuDetector.instance) {
      WebGpuDetector.instance = new WebGpuDetector();
    }
    return WebGpuDetector.instance;
  }

  public async detectWebGpu(): Promise<WebGpuCapabilityReport> {
    if (typeof window === "undefined" || !("navigator" in window)) {
      return {
        isWebGpuSupported: false,
        executionMode: "SERVER_DELEGATE",
        fallbackReason: "Server-side Node.js environment; WebGPU browser API not applicable",
      };
    }

    const nav = window.navigator as any;
    if (!nav.gpu) {
      return {
        isWebGpuSupported: false,
        executionMode: "WASM_CPU_FALLBACK",
        fallbackReason: "navigator.gpu is undefined in current browser context (WASM CPU fallback active)",
      };
    }

    try {
      const adapter = await nav.gpu.requestAdapter();
      if (!adapter) {
        return {
          isWebGpuSupported: false,
          executionMode: "WASM_CPU_FALLBACK",
          fallbackReason: "No compatible WebGPU hardware adapter returned by system",
        };
      }

      const info = (await adapter.requestAdapterInfo?.()) || {};
      const maxBufferSizeMb = adapter.limits?.maxBufferSize
        ? Math.round(adapter.limits.maxBufferSize / (1024 * 1024))
        : 256;

      return {
        isWebGpuSupported: true,
        executionMode: "WEBGPU_HARDWARE",
        adapterInfo: {
          vendor: info.vendor || "Hardware GPU",
          architecture: info.architecture,
          device: info.device,
          description: info.description,
        },
        maxBufferSizeMb,
        maxComputeWorkgroupSizeX: adapter.limits?.maxComputeWorkgroupSizeX || 256,
      };
    } catch (err: any) {
      return {
        isWebGpuSupported: false,
        executionMode: "WASM_CPU_FALLBACK",
        fallbackReason: `WebGPU initialization failed: ${err.message || "Unknown error"}`,
      };
    }
  }
}

export const webGpuDetector = WebGpuDetector.getInstance();
