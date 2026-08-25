"use client";

import { useQuery } from "@tanstack/react-query";
import { SystemTelemetryState } from "@/types/telemetry";
import { useSystemStore } from "@/stores/useSystemStore";
import { useEffect } from "react";

async function fetchLiveTelemetry(): Promise<SystemTelemetryState> {
  const res = await fetch("/api/telemetry", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch live telemetry: ${res.statusText}`);
  }
  return res.json();
}

export function useLiveTelemetry() {
  const { isLive, refreshIntervalMs, setTelemetry } = useSystemStore();

  const query = useQuery({
    queryKey: ["system-telemetry"],
    queryFn: fetchLiveTelemetry,
    refetchInterval: isLive ? refreshIntervalMs : false,
    refetchOnWindowFocus: true,
    staleTime: 500,
  });

  useEffect(() => {
    if (query.data) {
      setTelemetry(query.data);
    }
  }, [query.data, setTelemetry]);

  return query;
}
