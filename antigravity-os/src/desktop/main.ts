/**
 * ANTIGRAVITY OS V7 — STANDALONE DESKTOP PRODUCT MAIN PROCESS
 * main.ts: Electron main process entry point. Launches application, sets up secure IPC,
 * supervises local background engines, and manages window lifecycle.
 */

import { DesktopHardwareDetector } from "./hardware";
import { LocalServiceSupervisor } from "./supervisor";
import { DesktopDiagnosticsExporter } from "./diagnostics";
import { DesktopSecurityFabric } from "./security";

export class AntigravityDesktopApp {
  private static instance: AntigravityDesktopApp;
  private isInitialized = false;

  public static getInstance(): AntigravityDesktopApp {
    if (!AntigravityDesktopApp.instance) {
      AntigravityDesktopApp.instance = new AntigravityDesktopApp();
    }
    return AntigravityDesktopApp.instance;
  }

  public async bootstrap(): Promise<{
    initialized: boolean;
    hardware: ReturnType<DesktopHardwareDetector["inspectHostSystem"]>;
    services: ReturnType<LocalServiceSupervisor["getAllServices"]>;
  }> {
    const hardware = DesktopHardwareDetector.getInstance().inspectHostSystem();
    const supervisor = LocalServiceSupervisor.getInstance();
    const services = supervisor.getAllServices();

    this.isInitialized = true;

    return {
      initialized: this.isInitialized,
      hardware,
      services,
    };
  }

  public async shutdown(): Promise<void> {
    const supervisor = LocalServiceSupervisor.getInstance();
    const services = supervisor.getAllServices();
    for (const service of services) {
      await supervisor.stopService(service.id);
    }
    this.isInitialized = false;
  }
}
