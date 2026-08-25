import { ExecutionMode, ProviderHealthState } from "./types";

export interface ProviderCapabilityDescriptor {
  providerId: string;
  name: string;
  category: "IMAGE" | "AUDIO" | "VIDEO" | "3D" | "LLM" | "DESIGN";
  models: string[];
  supportedFormats: string[];
  executionMode: ExecutionMode;
  healthState: ProviderHealthState;
  requiresAuth: boolean;
  isConfigured: boolean;
  estimatedCostPerUnitUsd: number;
  circuitBreaker: {
    failureCount: number;
    cooldownUntil: number;
    isOpen: boolean;
  };
}

export class MultimodalProviderRegistry {
  private static instance: MultimodalProviderRegistry;
  private providers: Map<string, ProviderCapabilityDescriptor> = new Map();

  private constructor() {
    this.registerBuiltInProviders();
  }

  public static getInstance(): MultimodalProviderRegistry {
    if (!MultimodalProviderRegistry.instance) {
      MultimodalProviderRegistry.instance = new MultimodalProviderRegistry();
    }
    return MultimodalProviderRegistry.instance;
  }

  private registerBuiltInProviders() {
    // 1. Native Image Generation Engine (Local / Built-in)
    this.registerProvider({
      providerId: "antigravity-native-image",
      name: "Antigravity Native SVG/Canvas/AI Image Synthesizer",
      category: "IMAGE",
      models: ["vector-canvas-v2", "svg-highres-v1", "ui-mockup-generator"],
      supportedFormats: ["png", "svg", "webp", "jpg"],
      executionMode: "LOCAL",
      healthState: "HEALTHY",
      requiresAuth: false,
      isConfigured: true,
      estimatedCostPerUnitUsd: 0.0,
      circuitBreaker: { failureCount: 0, cooldownUntil: 0, isOpen: false },
    });

    // 2. Cloud AI Image Providers (e.g. OpenAI DALL-E, Stability, Replicate)
    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
    this.registerProvider({
      providerId: "openai-image",
      name: "OpenAI DALL-E 3 Image Engine",
      category: "IMAGE",
      models: ["dall-e-3", "dall-e-2"],
      supportedFormats: ["png", "webp"],
      executionMode: hasOpenAI ? "LIVE" : "CONFIG_REQUIRED",
      healthState: hasOpenAI ? "HEALTHY" : "UNKNOWN",
      requiresAuth: true,
      isConfigured: hasOpenAI,
      estimatedCostPerUnitUsd: 0.04,
      circuitBreaker: { failureCount: 0, cooldownUntil: 0, isOpen: false },
    });

    // 3. Audio - Edge TTS & Web Audio Synthesis (Local & Free)
    this.registerProvider({
      providerId: "antigravity-edge-audio",
      name: "Antigravity High-Fidelity Edge Audio & Neural Synthesizer",
      category: "AUDIO",
      models: ["neural-edge-v1", "web-speech-spatial", "sfx-wavetable-synth"],
      supportedFormats: ["mp3", "wav", "ogg"],
      executionMode: "LOCAL",
      healthState: "HEALTHY",
      requiresAuth: false,
      isConfigured: true,
      estimatedCostPerUnitUsd: 0.0,
      circuitBreaker: { failureCount: 0, cooldownUntil: 0, isOpen: false },
    });

    // 4. Cloud TTS (ElevenLabs)
    const hasElevenLabs = Boolean(process.env.ELEVENLABS_API_KEY);
    this.registerProvider({
      providerId: "elevenlabs-audio",
      name: "ElevenLabs Neural Audio Engine",
      category: "AUDIO",
      models: ["eleven_multilingual_v2", "eleven_turbo_v2"],
      supportedFormats: ["mp3", "wav"],
      executionMode: hasElevenLabs ? "LIVE" : "AUTH_REQUIRED",
      healthState: hasElevenLabs ? "HEALTHY" : "UNKNOWN",
      requiresAuth: true,
      isConfigured: hasElevenLabs,
      estimatedCostPerUnitUsd: 0.015,
      circuitBreaker: { failureCount: 0, cooldownUntil: 0, isOpen: false },
    });

    // 5. Video - Remotion & Canvas Programmatic Video Pipeline (Local & Deterministic)
    this.registerProvider({
      providerId: "antigravity-remotion-video",
      name: "Antigravity Remotion Programmatic Video & Walkthrough Pipeline",
      category: "VIDEO",
      models: ["remotion-react-canvas-v4", "webm-mp4-compositor"],
      supportedFormats: ["mp4", "webm"],
      executionMode: "LOCAL",
      healthState: "HEALTHY",
      requiresAuth: false,
      isConfigured: true,
      estimatedCostPerUnitUsd: 0.0,
      circuitBreaker: { failureCount: 0, cooldownUntil: 0, isOpen: false },
    });

    // 6. 3D - Blender & Poly Haven Pipeline
    this.registerProvider({
      providerId: "blender-polyhaven-3d",
      name: "Blender 3D Procedural & Poly Haven CC0 Mesh Pipeline",
      category: "3D",
      models: ["blender-py-render-4x", "polyhaven-hdri-pbr"],
      supportedFormats: ["gltf", "obj", "blend", "png"],
      executionMode: "LOCAL",
      healthState: "HEALTHY",
      requiresAuth: false,
      isConfigured: true,
      estimatedCostPerUnitUsd: 0.0,
      circuitBreaker: { failureCount: 0, cooldownUntil: 0, isOpen: false },
    });

    // 7. Google Stitch Design MCP
    this.registerProvider({
      providerId: "google-stitch-design",
      name: "Google Stitch Semantic Design & UI Generator",
      category: "DESIGN",
      models: ["stitch-design-v1", "stitch-tokens-ast"],
      supportedFormats: ["json", "tsx", "html", "css"],
      executionMode: "LIVE",
      healthState: "HEALTHY",
      requiresAuth: false,
      isConfigured: true,
      estimatedCostPerUnitUsd: 0.0,
      circuitBreaker: { failureCount: 0, cooldownUntil: 0, isOpen: false },
    });

    // 8. Figma Design API / MCP
    const hasFigma = Boolean(process.env.FIGMA_ACCESS_TOKEN);
    this.registerProvider({
      providerId: "figma-mcp",
      name: "Figma REST API & Component Design Token Adapter",
      category: "DESIGN",
      models: ["figma-rest-v1"],
      supportedFormats: ["json", "svg", "png"],
      executionMode: hasFigma ? "LIVE" : "AUTH_REQUIRED",
      healthState: hasFigma ? "HEALTHY" : "UNKNOWN",
      requiresAuth: true,
      isConfigured: hasFigma,
      estimatedCostPerUnitUsd: 0.0,
      circuitBreaker: { failureCount: 0, cooldownUntil: 0, isOpen: false },
    });

    // 9. Puter.js AI txt2img Provider
    this.registerProvider({
      providerId: "puter-image",
      name: "Puter Cloud AI txt2img Engine",
      category: "IMAGE",
      models: ["puter-flux", "puter-default"],
      supportedFormats: ["png", "webp"],
      executionMode: "LIVE",
      healthState: "HEALTHY",
      requiresAuth: false,
      isConfigured: true,
      estimatedCostPerUnitUsd: 0.0,
      circuitBreaker: { failureCount: 0, cooldownUntil: 0, isOpen: false },
    });

    // 10. Local AirLLM Engine (Low-VRAM Layered Large Models)
    this.registerProvider({
      providerId: "airllm",
      name: "AirLLM Local Large-Model Layered Engine",
      category: "LLM",
      models: [
        "Qwen/Qwen3-32B",
        "Qwen/Qwen2.5-32B-Instruct",
        "deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct"
      ],
      supportedFormats: ["text", "json", "code"],
      executionMode: "LOCAL",
      healthState: "HEALTHY",
      requiresAuth: false,
      isConfigured: true,
      estimatedCostPerUnitUsd: 0.0,
      circuitBreaker: { failureCount: 0, cooldownUntil: 0, isOpen: false },
    });
  }

  public registerProvider(descriptor: ProviderCapabilityDescriptor) {
    this.providers.set(descriptor.providerId, descriptor);
  }

  public getProvider(providerId: string): ProviderCapabilityDescriptor | undefined {
    return this.providers.get(providerId);
  }

  public listProviders(category?: string): ProviderCapabilityDescriptor[] {
    let list = Array.from(this.providers.values());
    if (category) {
      list = list.filter((p) => p.category === category);
    }
    return list;
  }

  public recordSuccess(providerId: string) {
    const p = this.providers.get(providerId);
    if (p) {
      p.circuitBreaker.failureCount = 0;
      p.circuitBreaker.isOpen = false;
      p.healthState = "HEALTHY";
    }
  }

  public recordFailure(providerId: string) {
    const p = this.providers.get(providerId);
    if (p) {
      p.circuitBreaker.failureCount += 1;
      if (p.circuitBreaker.failureCount >= 3) {
        p.circuitBreaker.isOpen = true;
        p.circuitBreaker.cooldownUntil = Date.now() + 30000;
        p.healthState = "DEGRADED";
      }
    }
  }

  public isAvailable(providerId: string): boolean {
    const p = this.providers.get(providerId);
    if (!p) return false;
    if (p.circuitBreaker.isOpen) {
      if (Date.now() > p.circuitBreaker.cooldownUntil) {
        p.circuitBreaker.isOpen = false;
        p.circuitBreaker.failureCount = 0;
        return true;
      }
      return false;
    }
    return p.executionMode === "LIVE" || p.executionMode === "LOCAL" || p.executionMode === "SIMULATION";
  }
}

export const providerRegistry = MultimodalProviderRegistry.getInstance();
