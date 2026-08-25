import { create } from "zustand";
import { TerminalLog } from "@/types/telemetry";

interface TerminalStore {
  logs: TerminalLog[];
  history: string[];
  historyIndex: number;
  addLog: (log: Omit<TerminalLog, "id" | "timestamp">) => void;
  clearLogs: () => void;
  executeCommand: (cmd: string) => void;
}

const initialLogs: TerminalLog[] = [
  {
    id: "log-1",
    timestamp: "17:00:01",
    level: "info",
    sender: "SYSTEM",
    message: "Antigravity OS v2.0 Kernel initialized on Windows 11 (WSL2 / CUDA enabled)",
  },
  {
    id: "log-2",
    timestamp: "17:00:02",
    level: "success",
    sender: "OLLAMA",
    message: "Loaded Qwen 2.5 Coder 7B (Q4_K_M) on NVIDIA RTX 3060 [VRAM: 3.85 GB / 6.0 GB]",
  },
  {
    id: "log-3",
    timestamp: "17:00:04",
    level: "info",
    sender: "SWARM",
    message: "7-Role Autonomous Swarm roster synchronized. 10 specialized agent workers online.",
  },
  {
    id: "log-4",
    timestamp: "17:00:05",
    level: "success",
    sender: "MCP",
    message: "6 Model Context Protocol servers connected (Stitch, Blender, GitHub, Playwright, Puppeteer, Prisma).",
  },
  {
    id: "log-5",
    timestamp: "17:00:06",
    level: "info",
    sender: "ROUTER",
    message: "OmniRoute local coding gateway listening on http://127.0.0.1:8080 (PREFER_LOCAL=true).",
  },
];

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  logs: initialLogs,
  history: [],
  historyIndex: -1,

  addLog: (log) => {
    const newLog: TerminalLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    set((state) => ({ logs: [...state.logs.slice(-100), newLog] }));
  },

  clearLogs: () => set({ logs: [] }),

  executeCommand: (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const { addLog } = get();
    addLog({ level: "command", sender: "USER", message: `$ ${trimmed}` });
    set((state) => ({
      history: [...state.history, trimmed],
      historyIndex: -1,
    }));

    const lower = trimmed.toLowerCase();

    if (lower === "help") {
      addLog({
        level: "info",
        sender: "SYSTEM",
        message: "Available commands: status, swarm, mcp, gpu, cpu, ollama, docker, clear, test, deploy, reboot",
      });
    } else if (lower === "status") {
      addLog({
        level: "success",
        sender: "STATUS",
        message: "SYSTEM NOMINAL: Ryzen 9 @ 4.6GHz | RTX 3060 6GB (68% VRAM) | 10 Agents Active | MCP 6/6 Online",
      });
    } else if (lower === "clear") {
      get().clearLogs();
    } else if (lower === "swarm") {
      addLog({
        level: "info",
        sender: "SWARM",
        message: "Active: Builder (92%), UX Designer (88%), Video Producer (46%), QA (75%), Architect (64%)",
      });
    } else if (lower === "gpu") {
      addLog({
        level: "info",
        sender: "GPU",
        message: "RTX 3060 (6144 MB) | Used: 4210 MB (68.5%) | Temp: 61°C | Fan: 55% | CUDA/Tensor Active",
      });
    } else if (lower === "mcp") {
      addLog({
        level: "success",
        sender: "MCP",
        message: "prisma-mcp-server (3 tools), StitchMCP (15), blender (25), playwright (25), puppeteer (7), github (26)",
      });
    } else if (lower === "test") {
      addLog({
        level: "warn",
        sender: "QA",
        message: "Running automated Playwright E2E and TypeScript strict checks...",
      });
      setTimeout(() => {
        addLog({
          level: "success",
          sender: "QA",
          message: "✓ All 24 unit & browser assertion tests passed (0 failures, 0 warnings)",
        });
      }, 800);
    } else {
      addLog({
        level: "warn",
        sender: "SHELL",
        message: `Command executed in background subagent context: "${trimmed}". Type "help" for built-in shortcuts.`,
      });
    }
  },
}));
