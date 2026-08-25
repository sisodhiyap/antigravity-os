import { LifecycleManager } from "./lifecycle";
import { ServiceRegistry } from "./serviceRegistry";
import { PluginLoader } from "./pluginLoader";
import { PermissionManager } from "./permissionManager";
import { ProcessSupervisor } from "./processSupervisor";
import { EventBus } from "./eventBus";
import { KernelTelemetrySnapshot, ServiceDefinition } from "./types";
import { TelemetryService } from "@/services/TelemetryService";

export class AntigravityKernel {
  private static instance: AntigravityKernel;
  public readonly version = "4.0.0";
  public readonly kernelId = "AGY-KERNEL-CORE-400";
  private isBooted = false;

  private constructor() {
    this.registerCoreServices();
    this.registerBuiltinPlugins();
  }

  public static getInstance(): AntigravityKernel {
    if (!AntigravityKernel.instance) {
      AntigravityKernel.instance = new AntigravityKernel();
    }
    return AntigravityKernel.instance;
  }

  // Accessors for subsystems
  public get lifecycle(): LifecycleManager {
    return LifecycleManager.getInstance();
  }

  public get services(): ServiceRegistry {
    return ServiceRegistry.getInstance();
  }

  public get plugins(): PluginLoader {
    return PluginLoader.getInstance();
  }

  public get permissions(): PermissionManager {
    return PermissionManager.getInstance();
  }

  public get supervisor(): ProcessSupervisor {
    return ProcessSupervisor.getInstance();
  }

  public get events(): EventBus {
    return EventBus.getInstance();
  }

  /**
   * Boot and initialize the entire Antigravity Platform Kernel
   */
  public async boot(): Promise<void> {
    if (this.isBooted) return;

    await this.lifecycle.boot();
    await this.events.emit("kernel:booting", "AntigravityKernel", {
      version: this.version,
      kernelId: this.kernelId,
    });

    // Start all core registered services in topological dependency order
    await this.services.startAll();

    // Load all enabled plugins
    await this.plugins.loadAll(this);

    // Start process supervisor
    this.supervisor.start(3000);

    await this.lifecycle.markReady();
    this.isBooted = true;

    await this.events.emit("kernel:ready", "AntigravityKernel", {
      status: "OPERATIONAL",
      uptime: 0,
    });
  }

  /**
   * Graceful shutdown of the platform kernel
   */
  public async shutdown(reason = "Operator requested kernel shutdown"): Promise<void> {
    this.supervisor.stop();
    await this.services.stopAll();
    await this.lifecycle.shutdown(reason);
    this.isBooted = false;
  }

  /**
   * Register default core platform services
   */
  private registerCoreServices(): void {
    // 1. Hardware & System Telemetry Service
    const telemetryServiceDef: ServiceDefinition = {
      name: "hardware-telemetry-service",
      version: "4.0.0",
      description: "Aggregates real-time CPU, GPU (nvidia-smi), RAM, Disk, and Network metrics",
      dependencies: [],
      requiredPermissions: ["READ", "EXECUTE"],
      autoStart: true,
      restartOnFailure: true,
      start: async () => {
        // Warm up systeminformation cache
        await TelemetryService.getCpuMetrics();
      },
      stop: async () => {},
      healthCheck: async () => {
        try {
          const cpu = await TelemetryService.getCpuMetrics();
          return { healthy: cpu.usagePercent >= 0, details: { cpu: cpu.model } };
        } catch (err: any) {
          return { healthy: false, details: { error: err.message } };
        }
      },
    };

    // 2. Ollama Inference Service
    const ollamaServiceDef: ServiceDefinition = {
      name: "ollama-inference-service",
      version: "4.0.0",
      description: "Local GPU-accelerated LLM router managing Qwen2.5-Coder and DeepSeek-R1",
      dependencies: ["hardware-telemetry-service"],
      requiredPermissions: ["READ", "EXECUTE", "MCP_INVOKE"],
      autoStart: true,
      restartOnFailure: true,
      start: async () => {
        await TelemetryService.getOllamaMetrics();
      },
      stop: async () => {},
      healthCheck: async () => {
        const ollama = await TelemetryService.getOllamaMetrics();
        return {
          healthy: ollama.serverStatus === "online",
          details: { activeModel: ollama.activeModel, totalModels: ollama.totalModels },
        };
      },
    };

    // 3. MCP Bridge Service
    const mcpBridgeDef: ServiceDefinition = {
      name: "mcp-bridge-service",
      version: "4.0.0",
      description: "Model Context Protocol bridge for Stitch, Blender, GitHub, Playwright, Puppeteer, Prisma",
      dependencies: ["hardware-telemetry-service"],
      requiredPermissions: ["READ", "EXECUTE", "MCP_INVOKE"],
      autoStart: true,
      restartOnFailure: true,
      start: async () => {},
      stop: async () => {},
      healthCheck: async () => {
        const mcp = TelemetryService.getMcpMetrics();
        return { healthy: mcp.length >= 6, details: { serversCount: mcp.length } };
      },
    };

    // 4. Swarm Orchestration Service
    const swarmServiceDef: ServiceDefinition = {
      name: "swarm-orchestrator-service",
      version: "4.0.0",
      description: "10-role autonomous engineering swarm scheduler and mission dispatcher",
      dependencies: ["ollama-inference-service", "mcp-bridge-service"],
      requiredPermissions: ["READ", "WRITE", "EXECUTE", "ADMIN"],
      autoStart: true,
      restartOnFailure: true,
      start: async () => {},
      stop: async () => {},
      healthCheck: async () => {
        const agents = TelemetryService.getSwarmAgents();
        return { healthy: agents.length === 10, details: { agentsOnline: agents.length } };
      },
    };

    // 5. Creative & Media Engine Service
    const creativeServiceDef: ServiceDefinition = {
      name: "creative-media-service",
      version: "4.0.0",
      description: "Remotion video timeline and Stable Diffusion image queue dispatcher",
      dependencies: ["hardware-telemetry-service"],
      requiredPermissions: ["READ", "WRITE", "EXECUTE"],
      autoStart: true,
      restartOnFailure: true,
      start: async () => {},
      stop: async () => {},
      healthCheck: async () => {
        return { healthy: true, details: { queueState: "idle" } };
      },
    };

    this.services.register(telemetryServiceDef);
    this.services.register(ollamaServiceDef);
    this.services.register(mcpBridgeDef);
    this.services.register(swarmServiceDef);
    this.services.register(creativeServiceDef);
  }

  /**
   * Register default plugins
   */
  private registerBuiltinPlugins(): void {
    this.plugins.registerPlugin({
      manifest: {
        id: "playwright-qa-plugin",
        name: "Playwright Automated QA & Accessibility Auditor",
        version: "4.0.0",
        description: "Headless browser test execution, visual regression screenshots, and WCAG AA verification",
        author: "Antigravity Swarm",
        entryPoint: "builtin:playwright",
        permissions: ["READ", "EXECUTE", "MCP_INVOKE"],
        dependencies: ["mcp-bridge-service"],
        enabled: true,
      },
      initialize: async () => {},
      shutdown: async () => {},
    });

    this.plugins.registerPlugin({
      manifest: {
        id: "figma-design-sync-plugin",
        name: "Figma REST Token & Design System Synchronizer",
        version: "4.0.0",
        description: "Extracts Figma layout frames, design tokens, and components directly to Tailwind/React",
        author: "Antigravity Swarm",
        entryPoint: "builtin:figma",
        permissions: ["READ", "WRITE"],
        dependencies: ["swarm-orchestrator-service"],
        enabled: true,
      },
      initialize: async () => {},
      shutdown: async () => {},
    });

    this.plugins.registerPlugin({
      manifest: {
        id: "financial-market-feed-plugin",
        name: "Alpha Vantage & Finnhub Financial Intelligence Feed",
        version: "4.0.0",
        description: "Real-time stock ticker streaming, technical indicators, and SEC filings synthesis",
        author: "Antigravity Swarm",
        entryPoint: "builtin:finance",
        permissions: ["READ"],
        dependencies: [],
        enabled: true,
      },
      initialize: async () => {},
      shutdown: async () => {},
    });
  }

  /**
   * Get an aggregated telemetry snapshot of the kernel
   */
  public getSnapshot(): KernelTelemetrySnapshot {
    const allServices = this.services.getAllServices();
    const allPlugins = this.plugins.getAllPlugins();
    const eventStats = this.events.getStats();
    const supervisorStats = this.supervisor.getStats();

    return {
      kernelId: this.kernelId,
      version: this.version,
      state: this.lifecycle.getState(),
      uptimeSeconds: this.lifecycle.getUptimeSeconds(),
      bootTimestamp: this.lifecycle.getBootTimestamp(),
      services: {
        total: allServices.length,
        healthy: allServices.filter((s) => s.status === "HEALTHY").length,
        degraded: allServices.filter((s) => s.status === "DEGRADED").length,
        stopped: allServices.filter((s) => s.status === "STOPPED" || s.status === "REGISTERED").length,
        failed: allServices.filter((s) => s.status === "FAILED").length,
      },
      plugins: {
        total: allPlugins.length,
        enabled: allPlugins.filter((p) => p.enabled).length,
      },
      events: {
        totalBroadcasted: eventStats.totalBroadcasted,
        activeSubscribers: eventStats.activeSubscribers,
      },
      supervisor: {
        activeMonitors: supervisorStats.activeMonitors,
        totalRestarts: supervisorStats.totalRestarts,
      },
    };
  }
}
