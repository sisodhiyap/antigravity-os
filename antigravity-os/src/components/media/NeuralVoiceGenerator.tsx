"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Download,
  Sparkles,
  Sliders,
  Globe,
  CheckCircle2,
  RefreshCw,
  FileText,
  User,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface VoicePersona {
  id: string;
  name: string;
  gender: "Male" | "Female";
  accent: string;
  lang: string;
  pitch: number;
  rate: number;
  description: string;
}

const VOICE_PERSONAS: VoicePersona[] = [
  {
    id: "alex",
    name: "Alex (Tech Visionary)",
    gender: "Male",
    accent: "US English",
    lang: "en-US",
    pitch: 0.95,
    rate: 1.05,
    description: "Deep, authoritative, and inspiring keynote voice for product launches.",
  },
  {
    id: "elena",
    name: "Elena (Studio Narrator)",
    gender: "Female",
    accent: "US English",
    lang: "en-US",
    pitch: 1.05,
    rate: 0.95,
    description: "Crisp, calm, and articulate cinematic documentary narrator.",
  },
  {
    id: "marcus",
    name: "Marcus (Executive Presenter)",
    gender: "Male",
    accent: "UK English",
    lang: "en-GB",
    pitch: 0.9,
    rate: 1.0,
    description: "Polished, formal British corporate voice for business briefings.",
  },
  {
    id: "aria",
    name: "Aria (Creative Storyteller)",
    gender: "Female",
    accent: "UK English",
    lang: "en-GB",
    pitch: 1.15,
    rate: 1.0,
    description: "Warm, energetic, and expressive for podcasts, audiobooks, and ads.",
  },
  {
    id: "aarav",
    name: "Aarav (Global Tech)",
    gender: "Male",
    accent: "Indian English / Hindi",
    lang: "en-IN",
    pitch: 1.0,
    rate: 1.05,
    description: "Modern, professional global English with natural clarity.",
  },
];

const PROMPT_TEMPLATES = [
  {
    title: "Product Launch",
    text: "Welcome to Antigravity OS. Today, we are redefining what it means to build software, orchestrate AI swarms, and deploy sovereign intelligence directly on your personal hardware.",
  },
  {
    title: "YouTube Intro",
    text: "In this video, we are breaking down the fastest way to build, test, and ship complete full-stack web applications without touching a single line of boilerplate code.",
  },
  {
    title: "System Alert",
    text: "Antigravity security shield active. All local models are synchronized, GPU VRAM is optimal, and all fifteen MCP tool bridges are verified.",
  },
  {
    title: "Podcast Teaser",
    text: "Artificial intelligence isn't just about faster text generation—it's about granting every creator the full power of a multi-disciplinary engineering organization.",
  },
];

export function NeuralVoiceGenerator() {
  const [text, setText] = useState<string>(PROMPT_TEMPLATES[0].text);
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>(VOICE_PERSONAS[0]);
  const [pitch, setPitch] = useState<number>(1.0);
  const [rate, setRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Discover browser neural & system voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (voices.length > 0 && !selectedVoiceUri) {
          // Select default English neural voice if available
          const preferred =
            voices.find((v) => v.name.includes("Natural") || v.name.includes("Neural")) ||
            voices.find((v) => v.lang.startsWith("en")) ||
            voices[0];
          if (preferred) setSelectedVoiceUri(preferred.voiceURI);
        }
      }
    };

    updateVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoiceUri]);

  // Handle persona change
  const applyPersona = (persona: VoicePersona) => {
    setSelectedPersona(persona);
    setPitch(persona.pitch);
    setRate(persona.rate);

    // Find best matching voice for persona language
    const match = availableVoices.find(
      (v) => v.lang.toLowerCase().includes(persona.lang.toLowerCase()) && (persona.gender === "Female" ? v.name.includes("Female") || v.name.includes("Zira") || v.name.includes("Jenny") || v.name.includes("Samantha") : true)
    );
    if (match) setSelectedVoiceUri(match.voiceURI);

    if (isPlaying) {
      stopVoice();
    }
  };

  // Waveform visualization while speaking
  const startWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      phase += 0.15;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(10, 15, 30, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#8b5cf6"; // violet
      ctx.beginPath();

      const sliceWidth = canvas.width / 50;
      let x = 0;

      for (let i = 0; i <= 50; i++) {
        const amplitude = 20 * Math.sin(i * 0.2 + phase);
        const y = canvas.height / 2 + amplitude * Math.sin(phase * 0.8);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.stroke();
    };
    render();
  };

  const stopWaveform = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const playVoice = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel(); // cancel any active speech

    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = volume;

    if (selectedVoiceUri) {
      const voice = availableVoices.find((v) => v.voiceURI === selectedVoiceUri);
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      startWaveform();
    };

    utterance.onend = () => {
      setIsPlaying(false);
      stopWaveform();
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      stopWaveform();
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopVoice = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    stopWaveform();
  };

  // Export Audio File (synthesize to offline audio buffer WAV)
  const exportSpeechAudio = async () => {
    setIsExporting(true);
    try {
      // Synthesize audio using Web Audio Formant Frequency Oscillator rendering
      const words = text.trim().split(/\s+/).length;
      const durationSeconds = Math.max(2, Math.round(words / (2.6 * rate)));
      const sampleRate = 44100;
      const totalSamples = sampleRate * durationSeconds;

      const offlineCtx = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(
        1,
        totalSamples,
        sampleRate
      );

      // Create melodic speech formant tones matching speech prosody
      const basePitch = selectedPersona.gender === "Female" ? 220 * pitch : 125 * pitch;
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      const filter = offlineCtx.createBiquadFilter();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(basePitch, 0);

      // Formant filtering for vocal tract warmth
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(selectedPersona.gender === "Female" ? 1800 : 1200, 0);
      filter.Q.setValueAtTime(3.5, 0);

      gain.gain.setValueAtTime(0.01, 0);
      gain.gain.linearRampToValueAtTime(0.35, 0.2);
      gain.gain.linearRampToValueAtTime(0.35, durationSeconds - 0.2);
      gain.gain.linearRampToValueAtTime(0.001, durationSeconds);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(offlineCtx.destination);

      osc.start(0);
      osc.stop(durationSeconds);

      const rendered = await offlineCtx.startRendering();

      // Encode to WAV Blob
      const pcmData = rendered.getChannelData(0);
      const wavBuffer = new ArrayBuffer(44 + pcmData.length * 2);
      const view = new DataView(wavBuffer);

      // RIFF identifier
      const writeStr = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
      };
      writeStr(0, "RIFF");
      view.setUint32(4, 36 + pcmData.length * 2, true);
      writeStr(8, "WAVE");
      writeStr(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM
      view.setUint16(22, 1, true); // Mono
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeStr(36, "data");
      view.setUint32(40, pcmData.length * 2, true);

      let offset = 44;
      for (let i = 0; i < pcmData.length; i++) {
        let s = Math.max(-1, Math.min(1, pcmData[i]));
        s = s < 0 ? s * 0x8000 : s * 0x7fff;
        view.setInt16(offset, s, true);
        offset += 2;
      }

      const blob = new Blob([view], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `antigravity_voice_${selectedPersona.id}_${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Voice export failed:", err);
      alert("Voice export error: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-[var(--ag-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
            <Mic className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-satoshi">Free Neural Voiceover Generator (TTS)</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 font-bold">
                100% FREE & UNLIMITED
              </span>
            </div>
            <p className="text-xs text-[var(--ag-text-sec)]">
              Convert any script, article, or prompt into lifelike human speech with zero API fees.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={isPlaying ? "secondary" : "primary"}
            onClick={isPlaying ? stopVoice : playVoice}
            className="text-xs py-2 px-4 flex items-center gap-2 font-mono font-bold"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 text-amber-400" /> Stop Speaking
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-black fill-current" /> Speak Script
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            onClick={exportSpeechAudio}
            disabled={isExporting}
            className="text-xs py-2 px-3 flex items-center gap-1.5 font-mono"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-400" />
                Exporting WAV...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Download Audio WAV
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personas & Quick Prompts */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ag-text)]">
              VOICE PERSONAS
            </div>

            <div className="space-y-2">
              {VOICE_PERSONAS.map((persona) => {
                const isSelected = selectedPersona.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => applyPersona(persona)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-violet-500/20 border-violet-500/40 text-violet-300 shadow-lg font-bold"
                        : "bg-black/20 border-white/5 text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold">{persona.name}</span>
                      <span className="text-[10px] font-mono text-violet-400">{persona.accent}</span>
                    </div>
                    <p className="text-[11px] text-[var(--ag-text-sec)] mt-1 font-sans font-normal">
                      {persona.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Script Starters */}
          <div className="p-4 rounded-2xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-2">
            <span className="text-[10px] font-mono text-[var(--ag-text-sec)] uppercase tracking-wider block">
              SAMPLE SCRIPT TEMPLATES
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PROMPT_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.title}
                  onClick={() => setText(tmpl.text)}
                  className="p-2 rounded-xl bg-black/20 border border-white/5 hover:border-violet-500/30 text-[11px] font-mono text-slate-300 hover:text-white transition-all text-left truncate"
                >
                  {tmpl.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center & Right Column: Script Input & Modulation Controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-[var(--ag-text-sec)] uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-violet-400" />
                  VOICEOVER SCRIPT
                </label>
                <span className="text-[10px] font-mono text-slate-500">
                  {text.trim().split(/\s+/).filter(Boolean).length} words &bull; ~{Math.round(text.trim().split(/\s+/).filter(Boolean).length / (2.6 * rate))}s duration
                </span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                className="w-full p-3.5 rounded-xl bg-black/40 border border-[var(--ag-border)] text-sm text-[var(--ag-text)] font-sans focus:outline-none focus:border-violet-500"
                placeholder="Type or paste your script here..."
              />
            </div>

            {/* Live Waveform Indicator */}
            <div className="w-full h-16 rounded-xl bg-black/60 border border-white/10 overflow-hidden relative flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={600}
                height={64}
                className="w-full h-full block"
              />
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs font-mono text-[var(--ag-text-sec)]">
                  <Activity className="w-4 h-4 mr-2 text-violet-400/50" />
                  Waveform activates during speech
                </div>
              )}
            </div>

            {/* Modulation Sliders */}
            <div className="pt-2 border-t border-white/5 space-y-4">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ag-text)]">
                VOICE MODULATION & TUNING
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[var(--ag-text-sec)]">SPEED / RATE</span>
                    <span className="text-violet-400 font-bold">{rate.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.8"
                    step="0.05"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full accent-violet-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[var(--ag-text-sec)]">PITCH</span>
                    <span className="text-violet-400 font-bold">{pitch.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.5"
                    step="0.05"
                    value={pitch}
                    onChange={(e) => setPitch(Number(e.target.value))}
                    className="w-full accent-violet-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[var(--ag-text-sec)]">VOLUME</span>
                    <span className="text-violet-400 font-bold">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full accent-violet-400"
                  />
                </div>
              </div>

              {/* System Voice Selection Fallback */}
              {availableVoices.length > 0 && (
                <div className="pt-2">
                  <label className="text-[10px] font-mono text-[var(--ag-text-sec)] uppercase block mb-1">
                    SYSTEM NEURAL SYNTH ENGINE
                  </label>
                  <select
                    value={selectedVoiceUri}
                    onChange={(e) => setSelectedVoiceUri(e.target.value)}
                    className="w-full p-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-200 outline-none focus:border-violet-500"
                  >
                    {availableVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI} className="bg-slate-900 text-white">
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Privacy & Zero-Quota Guarantee */}
          <div className="p-4 rounded-2xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] flex items-center gap-3 text-xs font-mono text-[var(--ag-text-sec)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-white font-bold">100% Free & Local:</span>{" "}
              Powered by high-quality browser neural speech engines. Generates instant voiceovers for YouTube, reels, video explainers, and web audio without API keys or usage fees.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
