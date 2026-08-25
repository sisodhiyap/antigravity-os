import { apiSuccess, apiError } from "@/lib/api-response";
import { TelemetryService } from "@/services/TelemetryService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [cpu, gpu, ram, ollama] = await Promise.all([
      TelemetryService.getCpuMetrics(),
      TelemetryService.getGpuMetrics(),
      TelemetryService.getRamMetrics(),
      TelemetryService.getOllamaMetrics(),
    ]);

    const isHealthy = ram.freeGb > 0.2;

    return apiSuccess({
      status: isHealthy ? "HEALTHY" : "DEGRADED",
      version: "4.0.0",
      timestamp: new Date().toISOString(),
      components: {
        cpu: { model: cpu.model, loadPercent: cpu.usagePercent },
        gpu: { model: gpu.model, vramFreeMb: gpu.vramTotalMb - gpu.vramUsedMb, cuda: gpu.cudaActive },
        ram: { totalGb: ram.totalGb, freeGb: ram.freeGb },
        ollama: { status: ollama.serverStatus },
        aiRouter: { status: "HEALTHY" },
        taskOrchestrator: { status: "HEALTHY" },
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
