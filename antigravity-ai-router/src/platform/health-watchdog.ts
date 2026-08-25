import http from 'http';

export interface EndpointStatus {
  name: string;
  url: string;
  healthy: boolean;
  statusCode?: number;
  responseTimeMs?: number;
  error?: string;
}

export interface SystemHealthReport {
  timestamp: string;
  overallHealthy: boolean;
  endpoints: EndpointStatus[];
  activeServicesCount: number;
}

export class HealthWatchdog {
  private endpoints: { name: string; url: string }[] = [
    { name: 'Antigravity Router API', url: 'http://127.0.0.1:8080/v1/models' },
    { name: 'Dashboard Endpoint', url: 'http://127.0.0.1:8080/dashboard' },
    { name: 'Telemetry Stats', url: 'http://127.0.0.1:8080/api/stats' },
    { name: 'Ollama Local Engine', url: 'http://127.0.0.1:11434/api/tags' },
    { name: 'AirLLM Local Engine', url: 'http://127.0.0.1:8000/health' },
    { name: 'Local Media Factory', url: 'http://127.0.0.1:7860/health' }
  ];

  /**
   * Probe an HTTP endpoint and return health status
   */
  public probeEndpoint(url: string, timeoutMs: number = 2000): Promise<{ healthy: boolean; statusCode?: number; responseTimeMs: number; error?: string }> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      try {
        const req = http.get(url, { timeout: timeoutMs }, (res) => {
          const responseTimeMs = Date.now() - startTime;
          const healthy = res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 400;
          resolve({ healthy, statusCode: res.statusCode, responseTimeMs });
        });

        req.on('error', (err) => {
          resolve({ healthy: false, responseTimeMs: Date.now() - startTime, error: err.message });
        });

        req.on('timeout', () => {
          req.destroy();
          resolve({ healthy: false, responseTimeMs: Date.now() - startTime, error: 'Connection timed out' });
        });
      } catch (err: any) {
        resolve({ healthy: false, responseTimeMs: Date.now() - startTime, error: err.message });
      }
    });
  }

  /**
   * Run system-wide health watchdog audit across registered services
   */
  public async runHealthCheck(): Promise<SystemHealthReport> {
    const endpointStatuses: EndpointStatus[] = [];
    let healthyCount = 0;

    for (const ep of this.endpoints) {
      const probe = await this.probeEndpoint(ep.url);
      if (probe.healthy) {
        healthyCount++;
      }

      endpointStatuses.push({
        name: ep.name,
        url: ep.url,
        healthy: probe.healthy,
        statusCode: probe.statusCode,
        responseTimeMs: probe.responseTimeMs,
        error: probe.error
      });
    }

    return {
      timestamp: new Date().toISOString(),
      overallHealthy: healthyCount > 0, // At least primary services responding
      endpoints: endpointStatuses,
      activeServicesCount: healthyCount
    };
  }
}
