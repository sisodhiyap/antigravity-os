/**
 * ANTIGRAVITY OS v5.3 — PERFORMANCE HARNESS
 * PerformanceHarness: Benchmarks real latency, throughput, memory, and telemetry
 */

import http from "http";

export interface PerformanceTelemetry {
  timestamp: string;
  sampleCount: number;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  p95LatencyMs: number;
  memoryRssMb: number;
  heapUsedMb: number;
  status: "PASS" | "WARN" | "FAIL";
}

export class PerformanceHarness {
  public static async benchmarkEndpoint(urlStr: string, requests: number = 20): Promise<PerformanceTelemetry> {
    const latencies: number[] = [];

    for (let i = 0; i < requests; i++) {
      const t0 = Date.now();
      await new Promise<void>((resolve) => {
        const req = http.get(urlStr, (res) => {
          res.on("data", () => {});
          res.on("end", () => {
            latencies.push(Date.now() - t0);
            resolve();
          });
        });
        req.on("error", () => {
          latencies.push(Date.now() - t0);
          resolve();
        });
      });
    }

    latencies.sort((a, b) => a - b);
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const p95Index = Math.floor(latencies.length * 0.95);
    const mem = process.memoryUsage();

    return {
      timestamp: new Date().toISOString(),
      sampleCount: requests,
      avgLatencyMs: Number(avg.toFixed(2)),
      minLatencyMs: latencies[0] || 0,
      maxLatencyMs: latencies[latencies.length - 1] || 0,
      p95LatencyMs: latencies[p95Index] || latencies[latencies.length - 1] || 0,
      memoryRssMb: Number((mem.rss / (1024 * 1024)).toFixed(2)),
      heapUsedMb: Number((mem.heapUsed / (1024 * 1024)).toFixed(2)),
      status: avg < 50 ? "PASS" : "WARN"
    };
  }
}
