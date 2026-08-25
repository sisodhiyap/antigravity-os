import { LifecycleState } from "./types";
import { EventBus } from "./eventBus";

export type LifecycleHook = () => Promise<void> | void;

export class LifecycleManager {
  private static instance: LifecycleManager;
  private state: LifecycleState = "UNINITIALIZED";
  private bootTimestamp: Date = new Date();
  private preBootHooks: LifecycleHook[] = [];
  private postBootHooks: LifecycleHook[] = [];
  private preShutdownHooks: LifecycleHook[] = [];
  private postShutdownHooks: LifecycleHook[] = [];

  private constructor() {}

  public static getInstance(): LifecycleManager {
    if (!LifecycleManager.instance) {
      LifecycleManager.instance = new LifecycleManager();
    }
    return LifecycleManager.instance;
  }

  public getState(): LifecycleState {
    return this.state;
  }

  public getUptimeSeconds(): number {
    return Math.floor((Date.now() - this.bootTimestamp.getTime()) / 1000);
  }

  public getBootTimestamp(): string {
    return this.bootTimestamp.toISOString();
  }

  public registerHook(
    stage: "preBoot" | "postBoot" | "preShutdown" | "postShutdown",
    hook: LifecycleHook
  ): void {
    switch (stage) {
      case "preBoot":
        this.preBootHooks.push(hook);
        break;
      case "postBoot":
        this.postBootHooks.push(hook);
        break;
      case "preShutdown":
        this.preShutdownHooks.push(hook);
        break;
      case "postShutdown":
        this.postShutdownHooks.push(hook);
        break;
    }
  }

  public async transitionTo(newState: LifecycleState, reason?: string): Promise<void> {
    const previousState = this.state;
    this.state = newState;

    await EventBus.getInstance().emit("kernel:lifecycle:transition", "LifecycleManager", {
      from: previousState,
      to: newState,
      reason: reason || "Standard operational transition",
      timestamp: new Date().toISOString(),
    });
  }

  public async boot(): Promise<void> {
    if (this.state !== "UNINITIALIZED" && this.state !== "TERMINATED") {
      return;
    }

    this.bootTimestamp = new Date();
    await this.transitionTo("BOOTING", "Kernel boot sequence initiated");

    // Execute pre-boot hooks
    for (const hook of this.preBootHooks) {
      try {
        await hook();
      } catch (err) {
        console.error("[LifecycleManager] Error in pre-boot hook:", err);
      }
    }

    await this.transitionTo("INITIALIZING", "Initializing subsystems & service registry");
  }

  public async markReady(): Promise<void> {
    await this.transitionTo("READY", "All critical core services initialized");
    await this.transitionTo("RUNNING", "Kernel entering active event & workload loop");

    // Execute post-boot hooks
    for (const hook of this.postBootHooks) {
      try {
        await hook();
      } catch (err) {
        console.error("[LifecycleManager] Error in post-boot hook:", err);
      }
    }
  }

  public async shutdown(reason = "Normal system shutdown"): Promise<void> {
    await this.transitionTo("SHUTTING_DOWN", reason);

    for (const hook of this.preShutdownHooks) {
      try {
        await hook();
      } catch (err) {
        console.error("[LifecycleManager] Error in pre-shutdown hook:", err);
      }
    }

    await this.transitionTo("TERMINATED", "Kernel terminated cleanly");

    for (const hook of this.postShutdownHooks) {
      try {
        await hook();
      } catch (err) {
        console.error("[LifecycleManager] Error in post-shutdown hook:", err);
      }
    }
  }
}
