"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw, Download, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";

export type NetworkState = "ONLINE" | "OFFLINE" | "DEGRADED" | "LOCAL-ONLY";

interface PwaContextType {
  networkState: NetworkState;
  isInstallable: boolean;
  promptInstall: () => Promise<void>;
  updateAvailable: boolean;
  applyUpdate: () => void;
}

const PwaContext = createContext<PwaContextType>({
  networkState: "ONLINE",
  isInstallable: false,
  promptInstall: async () => {},
  updateAvailable: false,
  applyUpdate: () => {},
});

export const usePwa = () => useContext(PwaContext);

export const PwaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [networkState, setNetworkState] = useState<NetworkState>("ONLINE");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // 1. Service Worker Registration
    if (typeof window !== "undefined" && "serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                  setWaitingWorker(newWorker);
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    }

    // 2. Network State Listeners
    const handleOnline = () => {
      // Test if cloud / external is actually reachable
      fetch("/api/capabilities", { method: "HEAD" })
        .then(() => setNetworkState("ONLINE"))
        .catch(() => setNetworkState("LOCAL-ONLY"));
    };

    const handleOffline = () => {
      setNetworkState("OFFLINE");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setNetworkState("OFFLINE");
    }

    // 3. Install Prompt Listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const applyUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
    window.location.reload();
  };

  return (
    <PwaContext.Provider
      value={{
        networkState,
        isInstallable,
        promptInstall,
        updateAvailable,
        applyUpdate,
      }}
    >
      {/* Offline / Degraded Network Status Banner */}
      {networkState !== "ONLINE" && (
        <div
          className={clsx(
            "fixed top-0 left-0 right-0 z-50 px-3 py-1.5 text-[11px] font-mono flex items-center justify-between transition-all",
            networkState === "OFFLINE"
              ? "bg-[var(--ag-error-bg)] text-[var(--ag-error)] border-b border-[var(--ag-error)]/30"
              : "bg-[var(--ag-warning-bg)] text-[var(--ag-warning)] border-b border-[var(--ag-warning)]/30"
          )}
          role="status"
        >
          <div className="flex items-center gap-2">
            {networkState === "OFFLINE" ? (
              <WifiOff className="w-3.5 h-3.5 animate-pulse" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            <span>
              MODE: <strong>{networkState}</strong> — Local workspace active. Cloud actions queued.
            </span>
          </div>
          <span className="text-[9px] opacity-75">V7 Local Engine</span>
        </div>
      )}

      {/* New Version Update Banner */}
      {updateAvailable && (
        <div className="fixed bottom-20 lg:bottom-4 right-4 z-50 max-w-sm p-3 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-gold)]/40 shadow-2xl flex items-center gap-3">
          <RefreshCw className="w-4 h-4 text-[var(--ag-gold)] animate-spin" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-[var(--ag-text)]">Update Available</p>
            <p className="text-[10px] text-[var(--ag-muted)]">A new V7 release is ready.</p>
          </div>
          <button
            onClick={applyUpdate}
            className="px-2.5 py-1 rounded-lg bg-[var(--ag-gold)] text-black font-bold text-xs hover:bg-[var(--ag-gold-bright)] transition-colors min-h-[36px]"
          >
            Reload
          </button>
        </div>
      )}

      {children}
    </PwaContext.Provider>
  );
};
