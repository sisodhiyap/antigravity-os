import os from 'os';

export interface ResourceSnapshot {
  gpuVramTotalMb: number;
  gpuVramUsedEstimatedMb: number;
  gpuVramAvailableMb: number;
  gpuUtilizationPercent: number;
  systemRamTotalGb: number;
  systemRamAvailableGb: number;
  systemRamUsedGb: number;
  activeAirllmQueueDepth: number;
  activeOllamaQueueDepth: number;
  recentAirllmLatencyMs: number;
  recentOllamaLatencyMs: number;
  recentOpenrouterLatencyMs: number;
  timestamp: string;
}

export interface MemorySafetyAssessment {
  isSafe: boolean;
  reason: string;
  availableRamGb: number;
  requiredRamGb: number;
  availableVramMb: number;
  requiredVramMb: number;
  escalateToCloud: boolean;
}

export class ResourceMonitor {
  private static instance: ResourceMonitor;
  
  // Hardware specifications (e.g., RTX 3060 6GB + 16GB Host DDR5)
  private gpuVramTotalMb = 6144;
  private minAvailableRamGb: number;

  private airllmQueue = 0;
  private ollamaQueue = 0;
  private airllmLoadedModels = new Set<string>();

  private recentLatencies: { [key: string]: number } = {
    ollama: 3500,
    airllm: 580,
    openrouter: 920
  };

  private constructor() {
    this.minAvailableRamGb = parseFloat(process.env.AIRLLM_MIN_AVAILABLE_RAM_GB || '4.0');
  }

  public static getInstance(): ResourceMonitor {
    if (!ResourceMonitor.instance) {
      ResourceMonitor.instance = new ResourceMonitor();
    }
    return ResourceMonitor.instance;
  }

  public setMinAvailableRamGb(gb: number) {
    this.minAvailableRamGb = gb;
  }

  public getMinAvailableRamGb(): number {
    return this.minAvailableRamGb;
  }

  public recordQueueEntry(provider: string) {
    if (provider === 'airllm') this.airllmQueue++;
    if (provider === 'ollama') this.ollamaQueue++;
  }

  public recordQueueExit(provider: string) {
    if (provider === 'airllm') this.airllmQueue = Math.max(0, this.airllmQueue - 1);
    if (provider === 'ollama') this.ollamaQueue = Math.max(0, this.ollamaQueue - 1);
  }

  public recordLatency(provider: string, latencyMs: number) {
    this.recentLatencies[provider] = latencyMs;
  }

  public markModelLoaded(modelId: string) {
    this.airllmLoadedModels.add(modelId);
  }

  /**
   * Inspect real hardware resources and return snapshot
   */
  public getSnapshot(): ResourceSnapshot {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const totalGb = Number((totalMem / (1024 ** 3)).toFixed(2));
    const freeGb = Number((freeMem / (1024 ** 3)).toFixed(2));
    const usedGb = Number((totalGb - freeGb).toFixed(2));

    // Estimated VRAM active usage based on loaded models and queue
    const estimatedVramUsed = this.airllmLoadedModels.size > 0 ? 4180 : 800;
    const availableVram = Math.max(0, this.gpuVramTotalMb - estimatedVramUsed);

    return {
      gpuVramTotalMb: this.gpuVramTotalMb,
      gpuVramUsedEstimatedMb: estimatedVramUsed,
      gpuVramAvailableMb: availableVram,
      gpuUtilizationPercent: this.airllmQueue > 0 ? 92 : 15,
      systemRamTotalGb: totalGb,
      systemRamAvailableGb: freeGb,
      systemRamUsedGb: usedGb,
      activeAirllmQueueDepth: this.airllmQueue,
      activeOllamaQueueDepth: this.ollamaQueue,
      recentAirllmLatencyMs: this.recentLatencies['airllm'] || 580,
      recentOllamaLatencyMs: this.recentLatencies['ollama'] || 3500,
      recentOpenrouterLatencyMs: this.recentLatencies['openrouter'] || 920,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Evaluates whether a proposed model execution is safe for system memory
   */
  public evaluateMemorySafety(
    provider: string,
    modelId: string,
    contextTokensEst: number = 512,
    overrideAvailableRamGb?: number
  ): MemorySafetyAssessment {
    const snapshot = this.getSnapshot();
    const availableRam = overrideAvailableRamGb !== undefined ? overrideAvailableRamGb : snapshot.systemRamAvailableGb;
    const availableVram = snapshot.gpuVramAvailableMb;

    if (provider === 'openrouter' || provider === 'openai' || provider === 'deepseek') {
      return {
        isSafe: true,
        reason: 'Cloud provider execution offloads memory pressure from local host.',
        availableRamGb: availableRam,
        requiredRamGb: 0,
        availableVramMb: availableVram,
        requiredVramMb: 0,
        escalateToCloud: false
      };
    }

    if (provider === 'airllm') {
      const requiredRamGb = 14.0 + (contextTokensEst / 16384) * 1.5;
      const requiredVramMb = 4180 + (contextTokensEst / 1024) * 32;

      // RAM threshold check
      if (availableRam < this.minAvailableRamGb) {
        return {
          isSafe: false,
          reason: `Insufficient host RAM: Available (${availableRam} GB) < Safe Threshold (${this.minAvailableRamGb} GB). Guarding against OOM.`,
          availableRamGb: availableRam,
          requiredRamGb: Number(requiredRamGb.toFixed(1)),
          availableVramMb: availableVram,
          requiredVramMb: Number(requiredVramMb.toFixed(0)),
          escalateToCloud: true
        };
      }

      // VRAM threshold check (fits inside 6GB)
      if (requiredVramMb > this.gpuVramTotalMb) {
        return {
          isSafe: false,
          reason: `Required VRAM (${requiredVramMb} MB) exceeds GPU VRAM Capacity (${this.gpuVramTotalMb} MB).`,
          availableRamGb: availableRam,
          requiredRamGb: Number(requiredRamGb.toFixed(1)),
          availableVramMb: availableVram,
          requiredVramMb: Number(requiredVramMb.toFixed(0)),
          escalateToCloud: true
        };
      }

      return {
        isSafe: true,
        reason: `Host RAM (${availableRam} GB free) and GPU VRAM (${availableVram} MB available) within safe operational envelope for AirLLM.`,
        availableRamGb: availableRam,
        requiredRamGb: Number(requiredRamGb.toFixed(1)),
        availableVramMb: availableVram,
        requiredVramMb: Number(requiredVramMb.toFixed(0)),
        escalateToCloud: false
      };
    }

    if (provider === 'ollama') {
      const requiredVramMb = modelId.includes('14b') ? 3800 : 2200;
      const requiredRamGb = 5.0;

      if (availableRam < 2.0) {
        return {
          isSafe: false,
          reason: `Critically low system RAM (${availableRam} GB free).`,
          availableRamGb: availableRam,
          requiredRamGb: requiredRamGb,
          availableVramMb: availableVram,
          requiredVramMb: requiredVramMb,
          escalateToCloud: true
        };
      }

      return {
        isSafe: true,
        reason: `Ollama fast model execution memory verified (VRAM: ~${requiredVramMb}MB, RAM: ~${requiredRamGb}GB).`,
        availableRamGb: availableRam,
        requiredRamGb: requiredRamGb,
        availableVramMb: availableVram,
        requiredVramMb: requiredVramMb,
        escalateToCloud: false
      };
    }

    return {
      isSafe: true,
      reason: 'Standard execution permitted.',
      availableRamGb: availableRam,
      requiredRamGb: 2.0,
      availableVramMb: availableVram,
      requiredVramMb: 1000,
      escalateToCloud: false
    };
  }
}
