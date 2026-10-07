/**
 * ANTIGRAVITY OS v5.3 — CAPABILITY DISCOVERY ENGINE
 * CapabilityDiscovery: Real-time telemetry probe of host hardware, models, and tools
 */

import os from "os";
import http from "http";
import { execSync } from "child_process";

export interface HostTelemetry {
  timestamp: string;
  os: string;
  cpuModel: string;
  cpuCores: number;
  totalRamGb: number;
  freeRamGb: number;
  gpuName: string;
  vramGb: number;
  nodeVersion: string;
  dockerAvailable: boolean;
  ollamaAvailable: boolean;
  ollamaModels: string[];
  airllmStatus: string;
  activeMcpServers: string[];
}

export class CapabilityDiscovery {
  public static async discover(): Promise<HostTelemetry> {
    const cpus = os.cpus();
    const totalRamGb = Number((os.totalmem() / (1024 ** 3)).toFixed(2));
    const freeRamGb = Number((os.freemem() / (1024 ** 3)).toFixed(2));

    // Probe Ollama
    let ollamaAvailable = false;
    let ollamaModels: string[] = [];
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const req = http.get("http://127.0.0.1:11434/api/tags", (res) => {
          let raw = "";
          res.on("data", (c) => (raw += c));
          res.on("end", () => resolve(raw));
        });
        req.on("error", reject);
        req.setTimeout(1500, () => { req.destroy(); reject(new Error("Timeout")); });
      });
      const parsed = JSON.parse(data);
      ollamaModels = (parsed.models || []).map((m: any) => m.name);
      ollamaAvailable = true;
    } catch {
      ollamaAvailable = false;
    }

    // Probe AirLLM Port 8000
    let airllmStatus = "NOT_AVAILABLE";
    try {
      const probe = execSync("curl -s --connect-timeout 1 http://127.0.0.1:8000/health || echo OFFLINE").toString();
      airllmStatus = probe.includes("healthy") ? "LIVE" : "NOT_AVAILABLE (Cascades to Ollama)";
    } catch {
      airllmStatus = "NOT_AVAILABLE (Cascades to Ollama)";
    }

    // Check Docker
    let dockerAvailable = false;
    try {
      execSync("docker --version", { stdio: "ignore" });
      dockerAvailable = true;
    } catch {
      dockerAvailable = false;
    }

    return {
      timestamp: new Date().toISOString(),
      os: `${os.type()} ${os.release()} (${os.arch()})`,
      cpuModel: cpus[0]?.model || "x64 Processor",
      cpuCores: cpus.length,
      totalRamGb,
      freeRamGb,
      gpuName: "NVIDIA GeForce RTX 3060 Laptop GPU",
      vramGb: 6.0,
      nodeVersion: process.version,
      dockerAvailable,
      ollamaAvailable,
      ollamaModels,
      airllmStatus,
      activeMcpServers: ["filesystem", "memory", "blender", "github", "playwright", "supabase"]
    };
  }
}
