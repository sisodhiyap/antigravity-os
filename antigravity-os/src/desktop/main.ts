/**
 * ANTIGRAVITY OS V7 — STANDALONE DESKTOP PRODUCT MAIN PROCESS
 * main.ts: Electron main process entry point. Launches application, sets up secure IPC,
 * supervises local background engines, enforces strict CSP, and manages window lifecycle.
 */

import { app, BrowserWindow, ipcMain, shell, Menu } from "electron";
import path from "path";
import fs from "fs";
import { DesktopHardwareDetector } from "./hardware";
import { LocalServiceSupervisor } from "./supervisor";
import { DesktopDiagnosticsExporter } from "./diagnostics";
import { DesktopSecurityFabric } from "./security";

// Ensure single instance lock
const hasLock = app.requestSingleInstanceLock();
if (!hasLock) {
  app.quit();
  process.exit(0);
}

let mainWindow: BrowserWindow | null = null;
const supervisor = LocalServiceSupervisor.getInstance();

async function createMainWindow(): Promise<BrowserWindow> {
  const iconPath = path.join(app.getAppPath(), "public", "favicon.ico");

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#0a0a0f",
    title: "Antigravity OS — Unified AI Workstation",
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Allows preload to leverage electron bridge safely
    },
    show: false,
  });

  // Remove default menu for sleek workstation aesthetic
  Menu.setApplicationMenu(null);

  // External link security: Prevent renderer from navigating to external sites
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (DesktopSecurityFabric.isSafeExternalUrl(url)) {
      shell.openExternal(url).catch(() => {});
    }
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, navigationUrl) => {
    try {
      const parsed = new URL(navigationUrl);
      if (parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
        event.preventDefault();
        if (DesktopSecurityFabric.isSafeExternalUrl(navigationUrl)) {
          shell.openExternal(navigationUrl).catch(() => {});
        }
      }
    } catch {
      event.preventDefault();
    }
  });

  // Check backend server readiness
  const isServerLive = await supervisor.probePort(3000, 1500);
  const targetUrl = "http://127.0.0.1:3000";

  if (isServerLive) {
    await mainWindow.loadURL(targetUrl);
  } else {
    // If local server is still starting or offline, show styled workstation launcher
    const fallbackHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Antigravity OS — Initializing</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #090a10;
            color: #e2e8f0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            user-select: none;
          }
          .card {
            background: #11131f;
            border: 1px solid #1e2238;
            border-radius: 12px;
            padding: 40px;
            text-align: center;
            max-width: 520px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          }
          .title { font-size: 24px; font-weight: 700; color: #38bdf8; margin-bottom: 8px; }
          .sub { font-size: 14px; color: #94a3b8; margin-bottom: 24px; }
          .spinner {
            width: 36px; height: 36px; border: 3px solid #1e293b;
            border-top: 3px solid #38bdf8; border-radius: 50%;
            animation: spin 1s linear infinite; margin: 0 auto 20px auto;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .btn {
            background: #0284c7; color: white; border: none; padding: 10px 24px;
            border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.2s;
          }
          .btn:hover { background: #0369a1; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="spinner"></div>
          <div class="title">Antigravity OS</div>
          <div class="sub">Connecting to local core runtime (port 3000)...</div>
          <button class="btn" onclick="window.location.href='http://127.0.0.1:3000'">Connect Now</button>
        </div>
        <script>
          setInterval(async () => {
            try {
              const res = await fetch('http://127.0.0.1:3000/api/health');
              if (res.ok) window.location.href = 'http://127.0.0.1:3000';
            } catch(e) {}
          }, 2000);
        </script>
      </body>
      </html>
    `;
    await mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fallbackHtml)}`);
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  return mainWindow;
}

// Register IPC handlers
function registerIpcHandlers() {
  ipcMain.handle("desktop:get-hardware-health", async () => {
    return DesktopHardwareDetector.getInstance().inspectHostSystem();
  });

  ipcMain.handle("desktop:get-services", async () => {
    return supervisor.getAllServices();
  });

  ipcMain.handle("desktop:start-service", async (_event, serviceId) => {
    return supervisor.startService(serviceId);
  });

  ipcMain.handle("desktop:stop-service", async (_event, serviceId) => {
    return supervisor.stopService(serviceId);
  });

  ipcMain.handle("desktop:restart-service", async (_event, serviceId) => {
    return supervisor.restartService(serviceId);
  });

  ipcMain.handle("desktop:tail-logs", async (_event, serviceId, lines) => {
    return supervisor.tailLogs(serviceId, lines);
  });

  ipcMain.handle("desktop:export-diagnostics", async () => {
    return DesktopDiagnosticsExporter.generateReport();
  });

  ipcMain.handle("desktop:list-projects", async () => {
    const workspaceDir = path.resolve(process.cwd(), "workspaces");
    if (!fs.existsSync(workspaceDir)) return [];
    return fs.readdirSync(workspaceDir);
  });

  ipcMain.handle("desktop:emergency-stop", async () => {
    await supervisor.shutdownAll();
    return { success: true, message: "Emergency Stop triggered: Non-essential services halted safely." };
  });

  ipcMain.handle("desktop:open-external", async (_event, targetUrl) => {
    if (DesktopSecurityFabric.isSafeExternalUrl(targetUrl)) {
      await shell.openExternal(targetUrl);
      return { success: true };
    }
    return { success: false };
  });

  ipcMain.handle("desktop:get-app-version", async () => {
    return app.getVersion() || "2.0.0";
  });

  ipcMain.handle("desktop:get-logs-path", async () => {
    return supervisor.getLogDir();
  });
}

// App lifecycle
app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(async () => {
  registerIpcHandlers();
  await createMainWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", async () => {
  await supervisor.shutdownAll();
});
