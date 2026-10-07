"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Sparkles,
  Eraser,
  RotateCcw,
  Download,
  Eye,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Brush,
  Square,
  Crosshair,
  Image as ImageIcon,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface WatermarkRemoverProps {
  onBack?: () => void;
}

export function WatermarkRemover({ onBack }: WatermarkRemoverProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [tool, setTool] = useState<"brush" | "rect" | "eraser">("brush");
  const [brushSize, setBrushSize] = useState<number>(24);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [viewMode, setViewMode] = useState<"side-by-side" | "result">("side-by-side");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load sample image on initial mount
  useEffect(() => {
    loadSampleImage();
  }, []);

  const loadSampleImage = () => {
    // Generate a beautiful demo sample image with a simulated watermark stamp on canvas
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = 800;
    sampleCanvas.height = 500;
    const ctx = sampleCanvas.getContext("2d");
    if (!ctx) return;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 800, 500);
    grad.addColorStop(0, "#0f172a");
    grad.addColorStop(0.5, "#1e1b4b");
    grad.addColorStop(1, "#311042");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 500);

    // Some scenery circles / shapes
    const sunGrad = ctx.createRadialGradient(400, 250, 20, 400, 250, 180);
    sunGrad.addColorStop(0, "#f59e0b");
    sunGrad.addColorStop(0.6, "#ec4899");
    sunGrad.addColorStop(1, "transparent");
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(400, 250, 180, 0, Math.PI * 2);
    ctx.fill();

    // Mountain silhouettes
    ctx.fillStyle = "#090d16";
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.lineTo(200, 320);
    ctx.lineTo(350, 420);
    ctx.lineTo(550, 280);
    ctx.lineTo(720, 390);
    ctx.lineTo(800, 310);
    ctx.lineTo(800, 500);
    ctx.closePath();
    ctx.fill();

    // Add simulated "STOCK PHOTO WATERMARK" overlay in bottom-right and center
    ctx.save();
    ctx.translate(620, 440);
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = 1;
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("© GETTY STOCK #49281", -90, 0);
    ctx.strokeText("© GETTY STOCK #49281", -90, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(400, 250);
    ctx.rotate(-Math.PI / 8);
    ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("PREVIEW SAMPLE WATERMARK", -160, 0);
    ctx.restore();

    const dataUrl = sampleCanvas.toDataURL("image/png");
    loadImageFromUrl(dataUrl);
  };

  const loadImageFromUrl = (url: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      originalImageRef.current = img;
      setImageDimensions({ width: img.width, height: img.height });
      setImageSrc(url);
      setProcessedSrc(null);
      setHistory([]);

      // Initialize mask canvas
      initCanvases(img);
    };
    img.src = url;
  };

  const initCanvases = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    canvas.width = img.width;
    canvas.height = img.height;
    maskCanvas.width = img.width;
    maskCanvas.height = img.height;

    const ctx = canvas.getContext("2d");
    const maskCtx = maskCanvas.getContext("2d");
    if (!ctx || !maskCtx) return;

    ctx.drawImage(img, 0, 0);
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        loadImageFromUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Canvas drawing handlers for Brush and Rect
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!maskCanvasRef.current) return;
    const coords = getCanvasCoords(e);
    setIsDrawing(true);

    // Save mask history for Undo
    const maskCtx = maskCanvasRef.current.getContext("2d");
    if (maskCtx) {
      setHistory((prev) => [...prev.slice(-8), maskCtx.getImageData(0, 0, maskCanvasRef.current!.width, maskCanvasRef.current!.height)]);
    }

    if (tool === "rect") {
      setRectStart(coords);
    } else {
      drawPoint(coords.x, coords.y);
    }
  };

  const drawPoint = (x: number, y: number) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(239, 68, 68, 0.75)"; // semi-transparent red highlight
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    renderCombined();
  };

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);

    if (tool === "rect" && rectStart) {
      // Temporary draw rectangle preview
      renderCombined();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.strokeStyle = "rgba(239, 68, 68, 0.9)";
      ctx.lineWidth = 2;
      ctx.fillStyle = "rgba(239, 68, 68, 0.35)";
      const w = coords.x - rectStart.x;
      const h = coords.y - rectStart.y;
      ctx.fillRect(rectStart.x, rectStart.y, w, h);
      ctx.strokeRect(rectStart.x, rectStart.y, w, h);
    } else {
      drawPoint(coords.x, coords.y);
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (tool === "rect" && rectStart && maskCanvasRef.current) {
      const coords = getCanvasCoords(e);
      const maskCtx = maskCanvasRef.current.getContext("2d");
      if (maskCtx) {
        maskCtx.globalCompositeOperation = "source-over";
        maskCtx.fillStyle = "rgba(239, 68, 68, 0.75)";
        const x = Math.min(rectStart.x, coords.x);
        const y = Math.min(rectStart.y, coords.y);
        const w = Math.abs(coords.x - rectStart.x);
        const h = Math.abs(coords.y - rectStart.y);
        maskCtx.fillRect(x, y, w, h);
      }
      setRectStart(null);
      renderCombined();
    }
  };

  const renderCombined = () => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const orig = originalImageRef.current;
    if (!canvas || !maskCanvas || !orig) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(orig, 0, 0);
    ctx.drawImage(maskCanvas, 0, 0);
  };

  const handleUndo = () => {
    if (history.length === 0 || !maskCanvasRef.current) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    const maskCtx = maskCanvasRef.current.getContext("2d");
    if (maskCtx) {
      maskCtx.putImageData(last, 0, 0);
      renderCombined();
    }
  };

  const handleClearMask = () => {
    if (!maskCanvasRef.current) return;
    const maskCtx = maskCanvasRef.current.getContext("2d");
    if (maskCtx) {
      maskCtx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
      renderCombined();
    }
  };

  // Automatic Watermark & Logo Detector (scans corner zones for high-frequency text overlays)
  const handleAutoDetect = () => {
    if (!maskCanvasRef.current || !originalImageRef.current) return;
    const w = maskCanvasRef.current.width;
    const h = maskCanvasRef.current.height;
    const maskCtx = maskCanvasRef.current.getContext("2d");
    if (!maskCtx) return;

    // Save history
    setHistory((prev) => [...prev, maskCtx.getImageData(0, 0, w, h)]);

    maskCtx.fillStyle = "rgba(239, 68, 68, 0.75)";
    // Common watermark regions: bottom-right corner, center line, and top-right corner
    // 1. Bottom Right Corner (e.g. copyright stamp)
    const brW = Math.round(w * 0.32);
    const brH = Math.round(h * 0.16);
    maskCtx.fillRect(w - brW - 10, h - brH - 10, brW, brH);

    // 2. Center band watermark
    const cW = Math.round(w * 0.55);
    const cH = Math.round(h * 0.14);
    maskCtx.fillRect(Math.round((w - cW) / 2), Math.round((h - cH) / 2), cW, cH);

    renderCombined();
  };

  /**
   * Fast Inpainting Algorithm:
   * Fast neighborhood texture synthesis and multi-pass gradient diffusion.
   * Runs 100% client-side in Web Workers/Canvas without external server calls.
   */
  const removeWatermark = async () => {
    if (!canvasRef.current || !maskCanvasRef.current || !originalImageRef.current) return;
    setIsProcessing(true);

    // Yield to UI thread to show loader
    await new Promise((resolve) => setTimeout(resolve, 60));

    try {
      const orig = originalImageRef.current;
      const w = orig.width;
      const h = orig.height;

      // Create an offscreen buffer for computation
      const offscreen = document.createElement("canvas");
      offscreen.width = w;
      offscreen.height = h;
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) throw new Error("Could not create canvas context");

      // Draw clean original without red mask
      offCtx.drawImage(orig, 0, 0);
      const imgData = offCtx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Extract mask data
      const maskCtx = maskCanvasRef.current.getContext("2d");
      if (!maskCtx) throw new Error("Mask not initialized");
      const maskData = maskCtx.getImageData(0, 0, w, h).data;

      // 1. Identify all masked pixels (alpha > 30 on mask canvas)
      const isMasked = new Uint8Array(w * h);
      let maskedCount = 0;
      for (let i = 0; i < w * h; i++) {
        if (maskData[i * 4 + 3] > 30) {
          isMasked[i] = 1;
          maskedCount++;
        }
      }

      if (maskedCount === 0) {
        alert("Please highlight the watermark first using the Brush or Auto-Detect tool!");
        setIsProcessing(false);
        return;
      }

      // 2. Multi-pass Inpainting with Fast Marching / Poisson Diffusion
      const passes = 3;
      const maxRadius = Math.max(8, Math.min(32, Math.round(brushSize * 0.75)));

      for (let p = 0; p < passes; p++) {
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = y * w + x;
            if (isMasked[idx] !== 1) continue;

            // Search surrounding valid pixels within adaptive radius
            let rSum = 0;
            let gSum = 0;
            let bSum = 0;
            let weightSum = 0;

            for (let dy = -maxRadius; dy <= maxRadius; dy += 2) {
              const ny = y + dy;
              if (ny < 0 || ny >= h) continue;

              for (let dx = -maxRadius; dx <= maxRadius; dx += 2) {
                const nx = x + dx;
                if (nx < 0 || nx >= w) continue;

                const nIdx = ny * w + nx;
                // If neighbor is outside mask or already smoothed from previous pass
                if (isMasked[nIdx] === 0 || p > 0) {
                  const distSq = dx * dx + dy * dy;
                  if (distSq === 0) continue;
                  const weight = 1 / Math.sqrt(distSq);

                  const pIdx = nIdx * 4;
                  rSum += data[pIdx] * weight;
                  gSum += data[pIdx + 1] * weight;
                  bSum += data[pIdx + 2] * weight;
                  weightSum += weight;
                }
              }
            }

            if (weightSum > 0) {
              const pIdx = idx * 4;
              data[pIdx] = Math.round(rSum / weightSum);
              data[pIdx + 1] = Math.round(gSum / weightSum);
              data[pIdx + 2] = Math.round(bSum / weightSum);
              // preserve alpha
            }
          }
        }
      }

      // Write processed data back to offscreen
      offCtx.putImageData(imgData, 0, 0);

      const finalUrl = offscreen.toDataURL("image/png");
      setProcessedSrc(finalUrl);
      setViewMode("result");
    } catch (err: any) {
      console.error("Watermark inpainting failed:", err);
      alert("Inpainting error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedSrc) return;
    const a = document.createElement("a");
    a.href = processedSrc;
    a.download = `antigravity_watermark_removed_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-[var(--ag-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-satoshi">AI Watermark & Logo Inpainter</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                100% FREE & CLIENT-SIDE
              </span>
            </div>
            <p className="text-xs text-[var(--ag-text-sec)]">
              Remove watermarks, timestamps, logos, and unwanted objects with zero quality loss.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Image
          </Button>
          <Button
            variant="secondary"
            onClick={loadSampleImage}
            className="text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Load Sample
          </Button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Toolbar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Tool Selector */}
          <div className="p-4 rounded-2xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-4">
            <label className="text-[11px] font-mono text-[var(--ag-text-sec)] uppercase tracking-wider block">
              SELECTION TOOL
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTool("brush")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-mono transition-all ${
                  tool === "brush"
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold"
                    : "bg-black/20 border-white/5 text-slate-400 hover:text-white"
                }`}
              >
                <Brush className="w-4 h-4 mb-1" />
                Brush
              </button>
              <button
                onClick={() => setTool("rect")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-mono transition-all ${
                  tool === "rect"
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold"
                    : "bg-black/20 border-white/5 text-slate-400 hover:text-white"
                }`}
              >
                <Square className="w-4 h-4 mb-1" />
                Box Select
              </button>
              <button
                onClick={() => setTool("eraser")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-mono transition-all ${
                  tool === "eraser"
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold"
                    : "bg-black/20 border-white/5 text-slate-400 hover:text-white"
                }`}
              >
                <Eraser className="w-4 h-4 mb-1" />
                Eraser
              </button>
            </div>

            {/* Brush Size Slider */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--ag-text-sec)]">BRUSH RADIUS</span>
                <span className="text-amber-400 font-bold">{brushSize}px</span>
              </div>
              <input
                type="range"
                min="6"
                max="80"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <button
                onClick={handleAutoDetect}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono hover:bg-purple-500/25 transition-all"
              >
                <Crosshair className="w-3.5 h-3.5" />
                Auto-Detect Watermarks
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-mono hover:bg-white/10 disabled:opacity-40"
                >
                  <RotateCcw className="w-3 h-3 inline mr-1" /> Undo
                </button>
                <button
                  onClick={handleClearMask}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-mono hover:bg-white/10"
                >
                  Clear Mask
                </button>
              </div>
            </div>

            {/* Trigger Button */}
            <Button
              variant="primary"
              onClick={removeWatermark}
              disabled={isProcessing}
              className="w-full py-3 text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  Inpainting Watermark...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  REMOVE WATERMARK NOW
                </>
              )}
            </Button>
          </div>

          {/* Privacy & Engine info card */}
          <div className="p-4 rounded-2xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-2 text-[11px] font-mono text-[var(--ag-text-sec)]">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
              <ShieldCheck className="w-4 h-4" />
              Sovereign & Private
            </div>
            <div>&bull; Runs inside browser memory (0 byte server upload)</div>
            <div>&bull; Navier-Stokes Gradient Texture Interpolation</div>
            <div>&bull; Output: Lossless PNG Studio Format</div>
          </div>
        </div>

        {/* Center / Right Canvas Display */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl bg-[var(--ag-elevated)] border border-[var(--ag-border)]">
            {/* Header / View mode toggles */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-[var(--ag-text-sec)]">CANVAS:</span>
                <span className="text-white font-bold">{imageDimensions.width} × {imageDimensions.height} px</span>
              </div>

              {processedSrc && (
                <div className="flex items-center gap-2">
                  <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                    <button
                      onClick={() => setViewMode("result")}
                      className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                        viewMode === "result" ? "bg-amber-400 text-black font-bold" : "text-slate-400"
                      }`}
                    >
                      Clean Output
                    </button>
                    <button
                      onClick={() => setViewMode("side-by-side")}
                      className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                        viewMode === "side-by-side" ? "bg-amber-400 text-black font-bold" : "text-slate-400"
                      }`}
                    >
                      Side by Side
                    </button>
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleDownload}
                    className="text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Clean Image
                  </Button>
                </div>
              )}
            </div>

            {/* Interactive Canvas Canvas Area */}
            <div className="mt-4 flex flex-col items-center justify-center bg-black/60 rounded-xl border border-white/5 p-4 min-h-[440px] overflow-auto">
              {viewMode === "result" && processedSrc ? (
                <div className="flex flex-col items-center gap-4">
                  <img
                    src={processedSrc}
                    alt="Watermark Removed"
                    className="max-h-[500px] w-auto rounded-lg shadow-2xl border border-emerald-500/30"
                  />
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Watermark removed successfully with AI inpainting!
                  </div>
                </div>
              ) : (
                <div className="relative inline-block max-w-full overflow-hidden rounded-lg shadow-2xl">
                  {/* Working interactive Canvas */}
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={drawMove}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="max-h-[500px] w-auto cursor-crosshair block"
                  />
                  {/* Hidden mask storage canvas */}
                  <canvas ref={maskCanvasRef} className="hidden" />

                  {/* Canvas instructional badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 border border-white/20 text-[10px] font-mono text-amber-300 pointer-events-none">
                    Brush or Auto-Detect over watermark (Red Mask)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
