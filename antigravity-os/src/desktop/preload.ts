/**
 * ANTIGRAVITY OS V7 — HARDENED DESKTOP PRELOAD SCRIPT
 * preload.ts: Exposes secure, allowlisted APIs to the renderer via contextBridge.
 * Strict context isolation with zero raw Node.js or secret leaks to JavaScript.
 */

import { contextBridge, ipcRenderer } from "electron";

export interface AntigravityDesktopAPI {
  getHardwareHealth: () => Promise<any>;
  getServices: () => Promise<any>;
  startService: (serviceId: string) => Promise<any>;
  stopService: (serviceId: string) => Promise<any>;
  restartService: (serviceId: string) => Promise<any>;
  tailLogs: (serviceId: string, lines?: number) => Promise<string[]>;
  exportDiagnostics: () => Promise<any>;
  listProjects: () => Promise<string[]>;
  emergencyStop: () => Promise<any>;
  openExternal: (url: string) => Promise<{ success: boolean }>;
  getAppVersion: () => Promise<string>;
  getLogsPath: () => Promise<string>;
}

const desktopAPI: AntigravityDesktopAPI = {
  getHardwareHealth: () => ipcRenderer.invoke("desktop:get-hardware-health"),
  getServices: () => ipcRenderer.invoke("desktop:get-services"),
  startService: (serviceId: string) => ipcRenderer.invoke("desktop:start-service", serviceId),
  stopService: (serviceId: string) => ipcRenderer.invoke("desktop:stop-service", serviceId),
  restartService: (serviceId: string) => ipcRenderer.invoke("desktop:restart-service", serviceId),
  tailLogs: (serviceId: string, lines?: number) => ipcRenderer.invoke("desktop:tail-logs", serviceId, lines),
  exportDiagnostics: () => ipcRenderer.invoke("desktop:export-diagnostics"),
  listProjects: () => ipcRenderer.invoke("desktop:list-projects"),
  emergencyStop: () => ipcRenderer.invoke("desktop:emergency-stop"),
  openExternal: (url: string) => ipcRenderer.invoke("desktop:open-external", url),
  getAppVersion: () => ipcRenderer.invoke("desktop:get-app-version"),
  getLogsPath: () => ipcRenderer.invoke("desktop:get-logs-path"),
};

// Expose safe, isolated API to the renderer process
try {
  contextBridge.exposeInMainWorld("antigravityDesktop", desktopAPI);
} catch (err) {
  // Fallback for direct browser testing or unbridged environments
  if (typeof window !== "undefined") {
    (window as any).antigravityDesktop = desktopAPI;
  }
}
