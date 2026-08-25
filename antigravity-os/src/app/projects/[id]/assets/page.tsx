"use client";

import React, { useState, useEffect, use } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { Database, FileAudio, Play, Download, RefreshCw, Box } from "lucide-react";

export default function ProjectAssetsLibraryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      // Filter by projectId - only fetch this project's assets
      const res = await fetch(`/api/omnicraft/assets?projectId=${encodeURIComponent(id)}`);
      const json = await res.json();
      if (json.success) {
        setAssets(json.data);
      }
    } catch (_) {}
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [id]);

  const modeColor = (mode: string) => {
    if (mode === "LIVE") return "cyan";
    if (mode === "LOCAL" || mode === "FALLBACK") return "neon";
    return "purple";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyber-cyan" />
          <span className="font-bold text-xs">Asset Library — {assets.length} items</span>
        </div>
        <button
          onClick={fetchAssets}
          className="text-slate-400 hover:text-cyber-cyan transition"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-16 text-slate-500 text-xs font-mono animate-pulse">
            Loading assets from database...
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-16 text-slate-500 space-y-2 font-mono">
            <Database className="w-10 h-10 mx-auto text-slate-700" />
            <p className="text-xs">No media assets generated yet.</p>
            <p className="text-[10px] text-slate-600">Generated images, audio narrations, video manifests, or 3D models will appear here once created in the Media Synth tab.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 font-mono text-xs">
            {assets.map((asset) => (
              <div key={asset.assetId} className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <Badge variant="cyan">{asset.type}</Badge>
                  <Badge variant={modeColor(asset.executionMode) as any}>{asset.executionMode}</Badge>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold">SHA-256 Provenance</span>
                  <span className="text-[9px] text-slate-300 block bg-slate-900 p-1.5 rounded border border-white/5 truncate font-mono">
                    {asset.hashSha256}
                  </span>
                </div>

                {asset.type === "IMAGE" && (
                  <div className="border border-white/10 rounded-lg overflow-hidden h-40 bg-slate-900 flex items-center justify-center">
                    <img src={asset.path} alt={asset.altText || "Generated image"} className="max-h-full object-contain" />
                  </div>
                )}

                {asset.type === "AUDIO" && (
                  <div className="border border-white/10 rounded-lg p-3 bg-slate-900 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-cyber-cyan">
                      <FileAudio className="w-4 h-4" />
                      <span>Playback Narration (WAV)</span>
                    </div>
                    <audio src={asset.path} controls className="w-full h-8" />
                  </div>
                )}

                {asset.type === "VIDEO" && (
                  <div className="border border-white/10 rounded-lg p-3 bg-slate-900 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-cyber-cyan">
                      <Play className="w-4 h-4" />
                      <span>Video Composition Manifest (LOCAL)</span>
                    </div>
                    <p className="text-[9px] text-slate-500">
                      This is a scene composition JSON manifest. Cloud video rendering requires a Remotion render server.
                    </p>
                    <a href={asset.path} download className="text-[10px] text-cyber-cyan hover:underline flex items-center gap-1">
                      <Download className="w-3 h-3" /> Download Manifest
                    </a>
                  </div>
                )}

                {asset.type === "MODEL_3D" && (
                  <div className="border border-white/10 rounded-lg p-3 bg-slate-900 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-cyber-cyan">
                      <Box className="w-4 h-4" />
                      <span>GLTF 2.0 Mesh (LOCAL procedural)</span>
                    </div>
                    <p className="text-[9px] text-slate-500">
                      Procedurally-generated GLTF JSON mesh. Cloud 3D rendering (Blender/PolyHaven) requires GPU compute.
                    </p>
                    <a href={asset.path} download className="text-[10px] text-cyber-cyan hover:underline flex items-center gap-1">
                      <Download className="w-3 h-3" /> Download GLTF
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-500 border-t border-white/5 pt-2">
                  <div>
                    <span>Format: </span>
                    <span className="text-slate-300">{asset.format || asset.mimeType}</span>
                  </div>
                  <div className="text-right">
                    <span>Size: </span>
                    <span className="text-slate-300">{asset.sizeBytes ? (asset.sizeBytes / 1024).toFixed(1) + " KB" : "—"}</span>
                  </div>
                </div>
                <div className="text-[9px] text-slate-600 truncate">
                  ID: {asset.assetId}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

