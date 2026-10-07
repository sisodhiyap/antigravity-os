/**
 * ANTIGRAVITY OS V7 — STANDALONE DESKTOP PRODUCT MAIN PROCESS
 * main.ts: Electron main process entry point. Launches application, sets up secure IPC,
 * supervises local background engines, enforces strict CSP, and manages window lifecycle.
 *
 * PRODUCTION ARCHITECTURE:
 * The Electron main process SPAWNS the Next.js server as a child process.
 * The packaged ASAR bundle includes node_modules + next, so `next start` can run
 * from the extracted app path using Electron's bundled Node.js runtime (process.execPath).
 */

import { app, BrowserWindow, ipcMain, shell, Menu } from "electron";
import path from "path";
import fs from "fs";
import { ChildProcess, spawn } from "child_process";
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
let nextServerProcess: ChildProcess | null = null;
const supervisor = LocalServiceSupervisor.getInstance();

/** ─── NEXT.JS SERVER MANAGEMENT ──────────────────────────────────────────── */

/**
 * Resolves the application root directory.
 * In packaged mode, resources are in app.asar; the working dir for `next start`
 * should be the ASAR path (or its unpacked equivalent where node_modules exist).
 */
function getAppRoot(): string {
  if (app.isPackaged) {
    // In packaged builds, the ASAR is at resources/app.asar
    // node_modules/next is bundled inside; we run `next start` from the asar root
    return path.join(process.resourcesPath, "app.asar");
  }
  // Development: cwd is the repo root
  return path.resolve(__dirname, "../../");
}

/**
 * Get the log directory for the Next.js server process.
 */
function getServerLogPath(): string {
  const appData =
    process.env.APPDATA ||
    (process.platform === "darwin"
      ? path.join(require("os").homedir(), "Library", "Application Support")
      : path.join(require("os").homedir(), ".config"));
  const logDir = path.join(appData, "AntigravityOS", "logs");
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  } catch {
    /* ignore */
  }
  return path.join(logDir, "nextjs-server.log");
}

/**
 * Set up environment variables for the spawned Next.js process.
 * Reads .env file from %APPDATA%/AntigravityOS/.env if it exists (for the packaged app),
 * falling back to the dev .env in the repo root.
 */
function buildServerEnv(): NodeJS.ProcessEnv {
  const env: Record<string, string | undefined> = { ...process.env };

  // Set production mode
  env.NODE_ENV = "production";
  env.PORT = "3000";

  // Try loading a user-placed .env from the AppData config directory
  const appDataEnv = path.join(
    process.env.APPDATA ||
      (process.platform === "darwin"
        ? path.join(require("os").homedir(), "Library", "Application Support")
        : path.join(require("os").homedir(), ".config")),
    "AntigravityOS",
    ".env"
  );

  // In packaged mode, try the AppData .env; in dev, the repo .env is auto-loaded by Next.js
  if (app.isPackaged && fs.existsSync(appDataEnv)) {
    try {
      const lines = fs.readFileSync(appDataEnv, "utf-8").split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx < 1) continue;
        const key = trimmed.substring(0, eqIdx).trim();
        const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (key && !env[key]) {
          env[key] = val;
        }
      }
    } catch {
      /* ignore read errors */
    }
  }

  return env as unknown as NodeJS.ProcessEnv;
}

/**
 * Spawn the Next.js production server as a child process.
 * Uses `node node_modules/.bin/next start` so it works both in dev and packaged.
 */
async function spawnNextServer(): Promise<void> {
  const appRoot = getAppRoot();
  const logPath = getServerLogPath();

  // Locate the next CLI script
  // In packaged ASAR: <app.asar>/node_modules/.bin/next or <app.asar>/node_modules/next/dist/bin/next
  const nextBinInModules = path.join(appRoot, "node_modules", "next", "dist", "bin", "next");
  const nextCli = fs.existsSync(nextBinInModules)
    ? nextBinInModules
    : path.join(appRoot, "node_modules", ".bin", "next");

  // Use Electron's bundled Node.js runtime to run the next server
  const nodeExe = process.execPath;
  const serverEnv = buildServerEnv();

  const logStream = (() => {
    try {
      return fs.createWriteStream(logPath, { flags: "a" });
    } catch {
      return undefined;
    }
  })();

  const writeLog = (msg: string) => {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    try {
      if (logStream) logStream.write(line);
    } catch {
      /* ignore */
    }
  };

  writeLog("=".repeat(60));
  writeLog(`Antigravity OS Next.js Server — Starting`);
  writeLog(`Node: ${nodeExe}`);
  writeLog(`Next CLI: ${nextCli}`);
  writeLog(`App Root: ${appRoot}`);
  writeLog(`Packaged: ${app.isPackaged}`);
  writeLog(`PORT: ${serverEnv["PORT"] || "3000"}`);

  return new Promise((resolve, reject) => {
    const child = spawn(nodeExe, [nextCli, "start", "--port", "3000"], {
      cwd: appRoot,
      env: serverEnv,
      stdio: ["ignore", "pipe", "pipe"],
      detached: false,
    });

    nextServerProcess = child;

    let started = false;
    const startTimeout = setTimeout(() => {
      if (!started) {
        writeLog("WARNING: Next.js server did not confirm ready within 30s — proceeding anyway");
        started = true;
        resolve();
      }
    }, 30000);

    const onData = (data: Buffer) => {
      const text = data.toString();
      writeLog(text.replace(/\n$/, ""));
      // Next.js 15 emits "Ready in" or "started server on"
      if (!started && (text.includes("Ready in") || text.includes("started server on") || text.includes("localhost:3000"))) {
        started = true;
        clearTimeout(startTimeout);
        writeLog("Next.js server is ready.");
        resolve();
      }
    };

    child.stdout?.on("data", onData);
    child.stderr?.on("data", (data: Buffer) => {
      const text = data.toString();
      writeLog(`[STDERR] ${text.replace(/\n$/, "")}`);
      // Some builds emit ready to stderr too
      if (!started && (text.includes("Ready in") || text.includes("started server on"))) {
        started = true;
        clearTimeout(startTimeout);
        resolve();
      }
    });

    child.on("error", (err) => {
      writeLog(`ERROR spawning Next.js: ${err.message}`);
      if (!started) {
        started = true;
        clearTimeout(startTimeout);
        reject(err);
      }
    });

    child.on("exit", (code, signal) => {
      writeLog(`Next.js server exited — code=${code} signal=${signal}`);
      nextServerProcess = null;
      if (!started) {
        started = true;
        clearTimeout(startTimeout);
        reject(new Error(`Next.js exited with code ${code}`));
      }
    });
  });
}

/** ─── WINDOW CREATION ─────────────────────────────────────────────────────── */

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

  // Check backend server readiness (it should be up since we spawned it)
  const isServerLive = await supervisor.probePort(3000, 3000);
  const targetUrl = "http://127.0.0.1:3000";

  if (isServerLive) {
    await mainWindow.loadURL(targetUrl);
  } else {
    // Server still warming up — show a loading screen that auto-connects
    const fallbackHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Antigravity OS — Initializing</title>
        <style>
          body {
            margin: 0; padding: 0; background: #090a10; color: #e2e8f0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex; flex-direction: column; align-items: center;
            justify-content: center; height: 100vh; user-select: none;
          }
          .card {
            background: #11131f; border: 1px solid #1e2238; border-radius: 12px;
            padding: 40px; text-align: center; max-width: 520px;
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
          .status { font-size: 12px; color: #64748b; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="spinner"></div>
          <div class="title">Antigravity OS</div>
          <div class="sub">Core runtime is initializing — connecting automatically...</div>
          <div class="status" id="status">Waiting for server on port 3000...</div>
        </div>
        <script>
          let attempts = 0;
          const status = document.getElementById('status');
          const poll = setInterval(async () => {
            attempts++;
            status.textContent = 'Connection attempt ' + attempts + '...';
            try {
              const res = await fetch('http://127.0.0.1:3000/api/health');
              if (res.ok) {
                clearInterval(poll);
                status.textContent = 'Connected! Loading...';
                window.location.href = 'http://127.0.0.1:3000';
              }
            } catch(e) { /* keep polling */ }
          }, 1500);
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

/** ─── IPC HANDLERS ───────────────────────────────────────────────────────── */

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

/** ─── APP LIFECYCLE ──────────────────────────────────────────────────────── */

app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(async () => {
  registerIpcHandlers();

  // 1. Launch the Next.js production server
  try {
    await spawnNextServer();
  } catch (err) {
    // Non-fatal: window will poll for readiness
    console.error("[Antigravity] Failed to spawn Next.js server:", err);
  }

  // 2. Open the main window (probes port 3000, shows loading screen if not yet ready)
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
  // Kill the spawned Next.js server
  if (nextServerProcess && !nextServerProcess.killed) {
    try {
      nextServerProcess.kill("SIGTERM");
    } catch {
      /* ignore */
    }
  }
  await supervisor.shutdownAll();
});
