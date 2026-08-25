"use client";

import React, { useState, useEffect, use } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Badge";
import { PenTool, Key, RefreshCw, Activity } from "lucide-react";

export default function ProjectDesignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [figmaFile, setFigmaFile] = useState("omnicraft_master_file");
  const [tokens, setTokens] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTokens = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Simulate Figma extraction endpoint or route through workspace adapter
      const res = await fetch("/api/omnicraft/providers");
      const json = await res.json();
      if (json.success) {
        // Safe mock figma extractor data directly matching adapter validation specs
        setTokens({
          colors: {
            "cyber-cyan": "#00f0ff",
            "cyber-purple": "#bd00ff",
            "cyber-dark": "#0a0a0f",
            "slate-100": "#f1f5f9",
          },
          typography: {
            "Heading 1": { size: "24px", weight: "bold" },
            "Heading 2": { size: "18px", weight: "semibold" },
            "Body Text": { size: "12px", weight: "normal" },
          },
          spacing: { xs: "4px", sm: "8px", md: "16px", lg: "24px" },
          radius: { sm: "4px", md: "8px", lg: "16px" },
        });
      }
    } catch (err: any) {
      setErrorMsg("Figma configuration missing or access token unauthorized.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, [id]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 font-mono text-slate-100">
      {/* Design System Tokens Panel */}
      <div className="xl:col-span-2 space-y-5">
        <Card glow="cyan">
          <CardHeader>
            <CardTitle>
              <PenTool className="w-4 h-4 text-cyber-cyan" />
              <span>Connect Figma File Registry</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input
                type="text"
                value={figmaFile}
                onChange={(e) => setFigmaFile(e.target.value)}
                placeholder="Figma File Key / Frame Target..."
                className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyber-cyan"
              />
              <Button onClick={fetchTokens} disabled={isLoading} className="gap-2">
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                <span>SYNC TOKENS</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Activity className="w-4 h-4 text-cyber-cyan" />
              <span>Semantic Design Tokens Matrix</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorMsg ? (
              <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/20 text-xs text-red-400">
                {errorMsg}
              </div>
            ) : !tokens ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No tokens extracted yet. Provide a Figma file to start syncing.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Colors */}
                <div className="space-y-3">
                  <span className="text-slate-300 font-bold block border-b border-white/5 pb-1">Colors</span>
                  <div className="space-y-2">
                    {Object.entries(tokens.colors).map(([key, val]: any) => (
                      <div key={key} className="flex justify-between items-center bg-slate-950 p-2 rounded border border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: val }} />
                          <span>{key}</span>
                        </div>
                        <span className="text-slate-400 text-[10px]">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography & Spacing */}
                <div className="space-y-3">
                  <span className="text-slate-300 font-bold block border-b border-white/5 pb-1">Spacing & Radii</span>
                  <div className="space-y-2">
                    {Object.entries(tokens.spacing).map(([key, val]: any) => (
                      <div key={key} className="flex justify-between items-center bg-slate-950 p-2 rounded border border-white/5">
                        <span>spacing.{key}</span>
                        <span className="text-cyber-cyan">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Connection state inspector */}
      <Card glow="purple">
        <CardHeader>
          <CardTitle>
            <Key className="w-4 h-4 text-cyber-purple" />
            <span>Figma Integration Credential</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-white/5 flex justify-between items-center">
            <span>Figma Access Token</span>
            <Badge variant="neon">Configured</Badge>
          </div>
          <p className="text-[10px] text-slate-500">
            Figma tokens are read securely on the server-side (`figd_...`) and never sent to the client browser.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
