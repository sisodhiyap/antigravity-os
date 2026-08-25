import { ServiceRegistry } from "./serviceRegistry";
import { EventBus } from "./eventBus";

export class ProcessSupervisor {
  private static instance: ProcessSupervisor;
  private timer: NodeJS.Timeout | null = null;
  private isSupervising = false;
  private totalRestarts = 0;
  private failureCounts: Map<string, number> = new Map();
  private maxAllowedFailures = 5;

  private constructor() {}

  public static getInstance(): ProcessSupervisor {
    if (!ProcessSupervisor.instance) {
      ProcessSupervisor.instance = new ProcessSupervisor();
    }
    return ProcessSupervisor.instance;
  }

  /**
   * Start the continuous supervisor health loop
   */
  public start(intervalMs = 3000): void {
    if (this.isSupervising) return;
    this.isSupervising = true;

    this.timer = setInterval(async () => {
      await this.runSupervisorCycle();
    }, intervalMs);

    EventBus.getInstance().emit("supervisor:started", "ProcessSupervisor", { intervalMs });
  }

  /**
   * Stop the supervisor loop
   */
  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isSupervising = false;
    EventBus.getInstance().emit("supervisor:stopped", "ProcessSupervisor", {});
  }

  /**
   * Single health and restart cycle
   */
  private async runSupervisorCycle(): Promise<void> {
    const registry = ServiceRegistry.getInstance();
    const services = registry.getAllServices();

    for (const service of services) {
      const def = service.definition;

      // If service is marked healthy, execute health check if defined
      if (service.status === "HEALTHY" && def.healthCheck) {
        try {
          const res = await def.healthCheck();
          if (!res.healthy && def.restartOnFailure) {
            await this.handleServiceFailure(def.name, res.details?.error || "Health check failed");
          }
        } catch (err: any) {
          if (def.restartOnFailure) {
            await this.handleServiceFailure(def.name, err.message);
          }
        }
      }

      // If a service has failed and is configured to restart
      if (service.status === "FAILED" && def.restartOnFailure) {
        await this.handleServiceFailure(def.name, service.error || "Service in FAILED state");
      }
    }
  }

  private async handleServiceFailure(serviceName: string, reason: string): Promise<void> {
    const currentFailures = (this.failureCounts.get(serviceName) || 0) + 1;
    this.failureCounts.set(serviceName, currentFailures);

    const registry = ServiceRegistry.getInstance();
    const service = registry.getService(serviceName);
    const maxRestarts = service?.definition.maxRestarts || this.maxAllowedFailures;

    if (currentFailures <= maxRestarts) {
      this.totalRestarts++;
      console.warn(
        `[ProcessSupervisor] Recovering service '${serviceName}' (Attempt ${currentFailures}/${maxRestarts}) - Reason: ${reason}`
      );

      EventBus.getInstance().emit("supervisor:recovering", "ProcessSupervisor", {
        serviceName,
        attempt: currentFailures,
        maxRestarts,
        reason,
      });

      try {
        await registry.restartService(serviceName);
      } catch (restartErr) {
        console.error(`[ProcessSupervisor] Failed to restart service '${serviceName}':`, restartErr);
      }
    } else {
      console.error(
        `[ProcessSupervisor] CRITICAL: Service '${serviceName}' exceeded maximum restart threshold (${maxRestarts}). Halting restarts.`
      );

      EventBus.getInstance().emit("supervisor:threshold_exceeded", "ProcessSupervisor", {
        serviceName,
        maxRestarts,
        reason,
      });
    }
  }

  public getStats() {
    return {
      isSupervising: this.isSupervising,
      activeMonitors: ServiceRegistry.getInstance().getAllServices().length,
      totalRestarts: this.totalRestarts,
      failures: Object.fromEntries(this.failureCounts),
    };
  }
}
