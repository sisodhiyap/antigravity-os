/**
 * ANTIGRAVITY OS V7 — HARDENED DESKTOP PRELOAD SCRIPT
 * preload.ts: Exposes secure, allowlisted APIs to the renderer via contextBridge.
 * Strict context isolation with zero raw Node.js or secret leaks to JavaScript.
 */

export interface AntigravityDesktopAPI {
  getHardwareHealth: () => Promise<any>;
  getServices: () => Promise<any>;
  startService: (serviceId: string) => Promise<any>;
  stopService: (serviceId: string) => Promise<any>;
  restartService: (serviceId: string) => Promise<any>;
  tailLogs: (serviceId: string, lines?: number) => Promise<string[]>;
  exportDiagnostics: () => Promise<any>;
  listProjects: () => Promise<any>;
  emergencyStop: () => Promise<any>;
}

// In Electron runtime, contextBridge will expose this object
export function initializeDesktopBridge(): AntigravityDesktopAPI {
  return {
    getHardwareHealth: async () => {
      const { DesktopHardwareDetector } = await import("./hardware");
      return DesktopHardwareDetector.getInstance().inspectHostSystem();
    },
    getServices: async () => {
      const { LocalServiceSupervisor } = await import("./supervisor");
      return LocalServiceSupervisor.getInstance().getAllServices();
    },
    startService: async (serviceId: string) => {
      const { LocalServiceSupervisor } = await import("./supervisor");
      return LocalServiceSupervisor.getInstance().startService(serviceId as any);
    },
    stopService: async (serviceId: string) => {
      const { LocalServiceSupervisor } = await import("./supervisor");
      return LocalServiceSupervisor.getInstance().stopService(serviceId as any);
    },
    restartService: async (serviceId: string) => {
      const { LocalServiceSupervisor } = await import("./supervisor");
      return LocalServiceSupervisor.getInstance().restartService(serviceId as any);
    },
    tailLogs: async (serviceId: string, lines?: number) => {
      const { LocalServiceSupervisor } = await import("./supervisor");
      return LocalServiceSupervisor.getInstance().tailLogs(serviceId as any, lines);
    },
    exportDiagnostics: async () => {
      const { DesktopDiagnosticsExporter } = await import("./diagnostics");
      return DesktopDiagnosticsExporter.generateReport();
    },
    listProjects: async () => {
      const fs = await import("fs");
      const path = await import("path");
      const workspaceDir = path.resolve(process.cwd(), "workspaces");
      if (!fs.existsSync(workspaceDir)) return [];
      return fs.readdirSync(workspaceDir);
    },
    emergencyStop: async () => {
      const { LocalServiceSupervisor } = await import("./supervisor");
      const supervisor = LocalServiceSupervisor.getInstance();
      const services = supervisor.getAllServices();
      for (const s of services) {
        if (s.id !== "v7_runtime") {
          await supervisor.stopService(s.id);
        }
      }
      return { success: true, message: "Emergency Stop triggered: Non-essential services halted safely." };
    },
  };
}
