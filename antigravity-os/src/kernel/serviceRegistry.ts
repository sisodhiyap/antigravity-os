import { ServiceDefinition, ServiceRuntimeInfo, ServiceStatus } from "./types";
import { PermissionManager } from "./permissionManager";
import { EventBus } from "./eventBus";

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, ServiceRuntimeInfo> = new Map();

  private constructor() {}

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  /**
   * Register a service in the registry
   */
  public register(definition: ServiceDefinition): void {
    if (this.services.has(definition.name)) {
      console.warn(`[ServiceRegistry] Service '${definition.name}' is already registered. Updating definition.`);
    }

    // Grant default permissions required by service
    PermissionManager.getInstance().grant(
      definition.name,
      "SERVICE",
      definition.requiredPermissions,
      "SERVICE_REGISTRATION"
    );

    this.services.set(definition.name, {
      definition,
      status: "REGISTERED",
      restartCount: 0,
    });

    EventBus.getInstance().emit("service:registered", "ServiceRegistry", {
      name: definition.name,
      version: definition.version,
      dependencies: definition.dependencies,
    });
  }

  public getService(name: string): ServiceRuntimeInfo | undefined {
    return this.services.get(name);
  }

  public getAllServices(): ServiceRuntimeInfo[] {
    return Array.from(this.services.values());
  }

  /**
   * Compute topological sort for dependency-ordered startup sequence
   */
  public getStartupOrder(): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (name: string) => {
      if (visited.has(name)) return;
      if (visiting.has(name)) {
        throw new Error(`[ServiceRegistry] Circular dependency detected involving service '${name}'`);
      }

      visiting.add(name);
      const service = this.services.get(name);
      if (service) {
        for (const dep of service.definition.dependencies) {
          if (!this.services.has(dep)) {
            console.warn(`[ServiceRegistry] Service '${name}' depends on unregistered service '${dep}'`);
          } else {
            visit(dep);
          }
        }
      }

      visiting.delete(name);
      visited.add(name);
      order.push(name);
    };

    for (const name of this.services.keys()) {
      if (!visited.has(name)) {
        visit(name);
      }
    }

    return order;
  }

  /**
   * Start a specific service with permission checks
   */
  public async startService(name: string): Promise<void> {
    const serviceInfo = this.services.get(name);
    if (!serviceInfo) {
      throw new Error(`[ServiceRegistry] Service '${name}' not found.`);
    }

    if (serviceInfo.status === "HEALTHY") {
      return;
    }

    // Verify dependencies are started
    for (const dep of serviceInfo.definition.dependencies) {
      const depInfo = this.services.get(dep);
      if (!depInfo || depInfo.status !== "HEALTHY") {
        await this.startService(dep);
      }
    }

    serviceInfo.status = "STARTING";
    await EventBus.getInstance().emit("service:starting", "ServiceRegistry", { name });

    try {
      await serviceInfo.definition.start();
      serviceInfo.status = "HEALTHY";
      serviceInfo.startedAt = new Date();
      serviceInfo.error = undefined;

      await EventBus.getInstance().emit("service:started", "ServiceRegistry", { name });
    } catch (err: any) {
      serviceInfo.status = "FAILED";
      serviceInfo.error = err.message || String(err);
      await EventBus.getInstance().emit("service:failed", "ServiceRegistry", {
        name,
        error: serviceInfo.error,
      });
      throw err;
    }
  }

  /**
   * Stop a service
   */
  public async stopService(name: string): Promise<void> {
    const serviceInfo = this.services.get(name);
    if (!serviceInfo || serviceInfo.status === "STOPPED") return;

    serviceInfo.status = "STOPPING";
    await EventBus.getInstance().emit("service:stopping", "ServiceRegistry", { name });

    try {
      await serviceInfo.definition.stop();
      serviceInfo.status = "STOPPED";
      serviceInfo.stoppedAt = new Date();
      await EventBus.getInstance().emit("service:stopped", "ServiceRegistry", { name });
    } catch (err: any) {
      serviceInfo.status = "FAILED";
      serviceInfo.error = err.message || String(err);
      throw err;
    }
  }

  /**
   * Restart a service
   */
  public async restartService(name: string): Promise<void> {
    const serviceInfo = this.services.get(name);
    if (!serviceInfo) return;

    serviceInfo.restartCount++;
    await this.stopService(name);
    await this.startService(name);
    await EventBus.getInstance().emit("service:restarted", "ServiceRegistry", {
      name,
      restartCount: serviceInfo.restartCount,
    });
  }

  /**
   * Start all auto-start services in dependency order
   */
  public async startAll(): Promise<void> {
    const order = this.getStartupOrder();
    for (const name of order) {
      const service = this.services.get(name);
      if (service && service.definition.autoStart) {
        try {
          await this.startService(name);
        } catch (err) {
          console.error(`[ServiceRegistry] Failed auto-starting service '${name}':`, err);
        }
      }
    }
  }

  /**
   * Stop all services in reverse dependency order
   */
  public async stopAll(): Promise<void> {
    const order = [...this.getStartupOrder()].reverse();
    for (const name of order) {
      try {
        await this.stopService(name);
      } catch (err) {
        console.error(`[ServiceRegistry] Error stopping service '${name}':`, err);
      }
    }
  }

  /**
   * Run health checks for all registered services
   */
  public async checkHealthAll(): Promise<Record<string, { healthy: boolean; details?: any }>> {
    const results: Record<string, { healthy: boolean; details?: any }> = {};

    for (const [name, service] of this.services) {
      if (service.status === "HEALTHY" && service.definition.healthCheck) {
        try {
          const res = await service.definition.healthCheck();
          service.lastHealthCheck = new Date();
          service.healthDetails = res.details;
          if (!res.healthy) {
            service.status = "DEGRADED";
          }
          results[name] = res;
        } catch (err: any) {
          service.status = "DEGRADED";
          service.error = err.message;
          results[name] = { healthy: false, details: { error: err.message } };
        }
      } else {
        results[name] = { healthy: service.status === "HEALTHY" };
      }
    }

    return results;
  }
}
