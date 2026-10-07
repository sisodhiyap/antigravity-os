"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Music,
  Play,
  Pause,
  Download,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  Layers,
  Activity,
  Disc,
  CheckCircle2,
  RefreshCw,
  Radio
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface GenrePreset {
  id: string;
  name: string;
  bpm: number;
  scale: string;
  description: string;
  baseFreq: number;
  scaleIntervals: number[];
  color: string;
}

const GENRE_PRESETS: GenrePreset[] = [
  {
    id: "synthwave",
    name: "Cyberpunk Synthwave",
    bpm: 120,
    scale: "A Minor",
    description: "Driving retro saw bassline, neon synth arpeggios, and 80s gated drums.",
    baseFreq: 220, // A3
    scaleIntervals: [0, 3, 5, 7, 10, 12, 15, 17],
    color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  },
  {
    id: "lofi",
    name: "Lo-Fi Chillhop",
    bpm: 78,
    scale: "D Dorian",
    description: "Relaxed mellow keys, vinyl tape warmth, subtle swing, and soft vinyl kick.",
    baseFreq: 146.83, // D3
    scaleIntervals: [0, 2, 3, 5, 7, 9, 10, 12],
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    id: "ambient",
    name: "Ambient Deep Space",
    bpm: 65,
    scale: "C Pentatonic",
    description: "Atmospheric cosmic pads, crystalline drone washes, and meditative resonance.",
    baseFreq: 130.81, // C3
    scaleIntervals: [0, 2, 4, 7, 9, 12, 14, 16],
    color: "text-violet-400 border-violet-500/30 bg-violet-500/10",
  },
  {
    id: "cinematic",
    name: "Epic Cinematic Pulse",
    bpm: 130,
    scale: "E Phrygian",
    description: "Thunderous sub impacts, aggressive staccato pulses, and rising drama.",
    baseFreq: 164.81, // E3
    scaleIntervals: [0, 1, 3, 5, 7, 8, 10, 12],
    color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  },
  {
    id: "chiptune",
    name: "8-Bit Retro Chiptune",
    bpm: 140,
    scale: "F Major",
    description: "Pure square-wave leads, nostalgic NES bass leaps, and high-energy runs.",
    baseFreq: 174.61, // F3
    scaleIntervals: [0, 2, 4, 5, 7, 9, 11, 12],
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  {
    id: "techno",
    name: "Techno Minimal Club",
    bpm: 128,
    scale: "F# Minor",
    description: "Hypnotic 4-on-the-floor kick, rhythmic rolling sub bass, and filter sweeps.",
    baseFreq: 185.0, // F#3
    scaleIntervals: [0, 3, 5, 7, 10, 12, 14, 17],
    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  },
];

export function FreeMusicGenerator() {
  const [selectedGenre, setSelectedGenre] = useState<GenrePreset>(GENRE_PRESETS[0]);
  const [bpm, setBpm] = useState<number>(120);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportDuration, setExportDuration] = useState<number>(30); // 30 seconds export
  const [layers, setLayers] = useState({
    drums: true,
    bass: true,
    chords: true,
    lead: true,
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const stepRef = useRef<number>(0);

  // Update BPM when preset changes
  const selectPreset = (preset: GenrePreset) => {
    setSelectedGenre(preset);
    setBpm(preset.bpm);
    if (isPlaying) {
      stopPlayback();
    }
  };

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Real-time Visualizer Animation
  const startVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background subtle gradient
      ctx.fillStyle = "rgba(10, 15, 30, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

        // Gradient color for spectrum bars
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, "#06b6d4"); // cyan
        grad.addColorStop(0.5, "#8b5cf6"); // violet
        grad.addColorStop(1, "#f59e0b"); // amber

        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }
    };
    render();
  };

  const stopVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Synthesize single note sound in audio context
  const playStepSound = (ctx: AudioContext, destination: AudioNode, step: number) => {
    const t = ctx.currentTime;
    const secondsPerBeat = 60.0 / bpm;
    const stepDuration = secondsPerBeat / 4; // 16th note steps

    // 1. Kick Drum (Steps 0, 4, 8, 12)
    if (layers.drums && step % 4 === 0) {
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = "sine";
      kickOsc.frequency.setValueAtTime(140, t);
      kickOsc.frequency.exponentialRampToValueAtTime(32, t + 0.12);
      kickGain.gain.setValueAtTime(0.8, t);
      kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      kickOsc.connect(kickGain);
      kickGain.connect(destination);
      kickOsc.start(t);
      kickOsc.stop(t + 0.25);
    }

    // 2. Snare / Clack (Steps 4, 12)
    if (layers.drums && (step === 4 || step === 12)) {
      const snareFilter = ctx.createBiquadFilter();
      snareFilter.type = "highpass";
      snareFilter.frequency.setValueAtTime(800, t);

      const snareGain = ctx.createGain();
      snareGain.gain.setValueAtTime(0.4, t);
      snareGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      // Noise generator for snare punch
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;
      noiseSrc.connect(snareFilter);
      snareFilter.connect(snareGain);
      snareGain.connect(destination);
      noiseSrc.start(t);
      noiseSrc.stop(t + 0.15);
    }

    // 3. Hi-Hat (Every 2 steps or 16ths)
    if (layers.drums && step % 2 === 0) {
      const hatOsc = ctx.createOscillator();
      const hatGain = ctx.createGain();
      hatOsc.type = "highpass" as any; // fallback will be square with filter
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(7000, t);

      hatGain.gain.setValueAtTime(step % 4 === 2 ? 0.2 : 0.08, t);
      hatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      hatOsc.type = "square";
      hatOsc.frequency.setValueAtTime(300, t);
      hatOsc.connect(filter);
      filter.connect(hatGain);
      hatGain.connect(destination);
      hatOsc.start(t);
      hatOsc.stop(t + 0.05);
    }

    // 4. Bassline (Syncopated 8th notes)
    if (layers.bass && step % 2 === 0) {
      const bassIndex = (Math.floor(step / 4) + (step % 4)) % selectedGenre.scaleIntervals.length;
      const semitones = selectedGenre.scaleIntervals[bassIndex];
      const bassFreq = (selectedGenre.baseFreq / 2) * Math.pow(2, semitones / 12);

      const bassOsc = ctx.createOscillator();
      const bassFilter = ctx.createBiquadFilter();
      const bassGain = ctx.createGain();

      bassOsc.type = selectedGenre.id === "chiptune" ? "square" : "sawtooth";
      bassOsc.frequency.setValueAtTime(bassFreq, t);

      bassFilter.type = "lowpass";
      bassFilter.frequency.setValueAtTime(450, t);
      bassFilter.frequency.exponentialRampToValueAtTime(150, t + stepDuration * 1.5);

      bassGain.gain.setValueAtTime(0.45, t);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 1.8);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(destination);
      bassOsc.start(t);
      bassOsc.stop(t + stepDuration * 2);
    }

    // 5. Lead Arpeggio & Melody
    if (layers.lead && (step % 2 === 1 || step % 4 === 0)) {
      const leadNoteIndex = (step * 3) % selectedGenre.scaleIntervals.length;
      const semitones = selectedGenre.scaleIntervals[leadNoteIndex];
      const leadFreq = selectedGenre.baseFreq * Math.pow(2, semitones / 12);

      const leadOsc = ctx.createOscillator();
      const leadGain = ctx.createGain();
      leadOsc.type = selectedGenre.id === "chiptune" ? "square" : selectedGenre.id === "ambient" ? "sine" : "sawtooth";
      leadOsc.frequency.setValueAtTime(leadFreq, t);

      leadGain.gain.setValueAtTime(0.18, t);
      leadGain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 1.2);

      leadOsc.connect(leadGain);
      leadGain.connect(destination);
      leadOsc.start(t);
      leadOsc.stop(t + stepDuration * 1.3);
    }

    // 6. Chords & Lush Pad (Every 8 steps)
    if (layers.chords && step % 8 === 0) {
      [0, 4, 7].forEach((chordInterval) => {
        const chordOsc = ctx.createOscillator();
        const chordGain = ctx.createGain();
        const chordFilter = ctx.createBiquadFilter();

        chordOsc.type = "sine";
        const chordFreq = selectedGenre.baseFreq * Math.pow(2, chordInterval / 12);
        chordOsc.frequency.setValueAtTime(chordFreq, t);

        chordFilter.type = "lowpass";
        chordFilter.frequency.setValueAtTime(1200, t);

        chordGain.gain.setValueAtTime(0.001, t);
        chordGain.gain.linearRampToValueAtTime(0.12, t + 0.4);
        chordGain.gain.exponentialRampToValueAtTime(0.001, t + secondsPerBeat * 2);

        chordOsc.connect(chordFilter);
        chordFilter.connect(chordGain);
        chordGain.connect(destination);
        chordOsc.start(t);
        chordOsc.stop(t + secondsPerBeat * 2.2);
      });
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const startPlayback = () => {
    const ctx = getAudioContext();

    if (!analyserRef.current) {
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;
    }

    setIsPlaying(true);
    startVisualizer();

    stepRef.current = 0;
    const stepDurationMs = ((60 / bpm) / 4) * 1000;

    intervalRef.current = setInterval(() => {
      if (analyserRef.current && audioCtxRef.current) {
        playStepSound(audioCtxRef.current, analyserRef.current, stepRef.current);
        stepRef.current = (stepRef.current + 1) % 16;
      }
    }, stepDurationMs);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopVisualizer();
  };

  useEffect(() => {
    return () => {
      stopPlayback();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  /**
   * Generates and downloads a lossless 16-bit 44.1kHz Stereo WAV file
   * using OfflineAudioContext with zero server latency or copyright restrictions!
   */
  const exportWavTrack = async () => {
    setIsExporting(true);
    try {
      const sampleRate = 44100;
      const totalSeconds = exportDuration;
      const offlineCtx = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(
        2,
        sampleRate * totalSeconds,
        sampleRate
      );

      const secondsPerBeat = 60.0 / bpm;
      const stepDuration = secondsPerBeat / 4;
      const totalSteps = Math.floor(totalSeconds / stepDuration);

      for (let s = 0; s < totalSteps; s++) {
        // Schedule each step directly in offline context
        offlineCtx.suspend(s * stepDuration).then(() => {
          playStepSound(offlineCtx as any, offlineCtx.destination, s % 16);
          offlineCtx.resume();
        });
      }

      const renderedBuffer = await offlineCtx.startRendering();

      // Convert AudioBuffer to WAV blob
      const wavBlob = audioBufferToWavBlob(renderedBuffer);
      const url = URL.createObjectURL(wavBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `antigravity_royalty_free_${selectedGenre.id}_${bpm}bpm.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Audio export failed:", err);
      alert("Audio export error: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Helper: AudioBuffer to WAV conversion
  const audioBufferToWavBlob = (buffer: AudioBuffer): Blob => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    // RIFF identifier
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, "WAVE");

    // fmt chunk
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);

    // data chunk
    writeString(view, 36, "data");
    view.setUint32(40, dataLength, true);

    // Interleave samples
    let offset = 44;
    const channels = [];
    for (let c = 0; c < numChannels; c++) {
      channels.push(buffer.getChannelData(c));
    }

    for (let i = 0; i < buffer.length; i++) {
      for (let c = 0; c < numChannels; c++) {
        let sample = Math.max(-1, Math.min(1, channels[c][i]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, sample, true);
        offset += 2;
      }
    }

    return new Blob([view], { type: "audio/wav" });
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-[var(--ag-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
            <Music className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-satoshi">Procedural Royalty-Free Music Generator</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold">
                100% FREE & ZERO-COPYRIGHT
              </span>
            </div>
            <p className="text-xs text-[var(--ag-text-sec)]">
              Algorithmic soundtrack synthesizer for YouTube, gaming, web demos, and presentations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={isPlaying ? "secondary" : "primary"}
            onClick={togglePlayback}
            className="text-xs py-2 px-4 flex items-center gap-2 font-mono font-bold"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 text-amber-400" /> Stop Track
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-black fill-current" /> Play Live Demo
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            onClick={exportWavTrack}
            disabled={isExporting}
            className="text-xs py-2 px-3 flex items-center gap-1.5 font-mono"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                Rendering WAV...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Export Studio WAV
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid: Presets and Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Preset Selector */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ag-text)]">
              SELECT SOUNDTRACK GENRE
            </div>

            <div className="space-y-2">
              {GENRE_PRESETS.map((preset) => {
                const isSelected = selectedGenre.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => selectPreset(preset)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? `${preset.color} shadow-lg font-bold`
                        : "bg-black/20 border-white/5 text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold">{preset.name}</span>
                      <span className="text-[10px] font-mono opacity-80">{preset.bpm} BPM</span>
                    </div>
                    <p className="text-[11px] text-[var(--ag-text-sec)] mt-1 font-sans font-normal">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center & Right Column: Visualizer & Mixer */}
        <div className="lg:col-span-2 space-y-4">
          {/* Visualizer Panel */}
          <div className="p-5 rounded-2xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  AUDIO FREQUENCY OSCILLOSCOPE
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-mono text-cyan-400">
                  {isPlaying ? "LIVE GENERATING" : "STANDBY"}
                </span>
              </div>
            </div>

            {/* Canvas Spectrum Visualizer */}
            <div className="w-full h-36 rounded-xl bg-black/60 border border-white/10 overflow-hidden relative flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={600}
                height={144}
                className="w-full h-full block"
              />
              {!isPlaying && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <Disc className="w-8 h-8 text-cyan-400/40 mb-1 animate-spin" style={{ animationDuration: "8s" }} />
                  <span className="text-xs font-mono text-[var(--ag-text-sec)]">
                    Press &quot;Play Live Demo&quot; to synthesize audio
                  </span>
                </div>
              )}
            </div>

            {/* Mixer & Track Layers */}
            <div className="pt-2 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--ag-text-sec)] uppercase font-bold">INSTRUMENT LAYER BUS</span>
                <span className="text-amber-400">{bpm} BPM</span>
              </div>

              {/* Layer Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: "drums", label: "🥁 Drums / Beat" },
                  { key: "bass", label: "🎸 Sub Bass" },
                  { key: "chords", label: "🎹 Ambient Chords" },
                  { key: "lead", label: "✨ Neon Lead Arp" },
                ].map(({ key, label }) => {
                  const active = (layers as any)[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setLayers((prev) => ({ ...prev, [key]: !active }))}
                      className={`p-2.5 rounded-xl border text-xs font-mono transition-all text-center ${
                        active
                          ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold"
                          : "bg-black/20 border-white/5 text-slate-500"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Sliders: BPM & Export duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[var(--ag-text-sec)]">TEMPO / SPEED</span>
                    <span className="text-cyan-400 font-bold">{bpm} BPM</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="160"
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[var(--ag-text-sec)]">EXPORT DURATION</span>
                    <span className="text-cyan-400 font-bold">{exportDuration}s Track</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    step="15"
                    value={exportDuration}
                    onChange={(e) => setExportDuration(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Legal / Freedom Guarantee */}
          <div className="p-4 rounded-2xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] flex items-center gap-3 text-xs font-mono text-[var(--ag-text-sec)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-white font-bold">100% Royalty-Free Commercial License Included:</span>{" "}
              All audio synthesized by Antigravity OS is mathematically synthesized via code and is free from copyright strikes on YouTube, Twitch, Spotify, and commercial advertising.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
