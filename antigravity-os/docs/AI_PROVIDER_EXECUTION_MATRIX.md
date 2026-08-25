# OMNICRAFT AI PROVIDER EXECUTION MATRIX

## 1. Unified Gateway Routing Paths

The `aiGateway` acts as the single provider-agnostic entry point. Direct calls to individual APIs inside UI components are prohibited.

```
                  ┌──────────────────────────────┐
                  │      Unified AI Gateway      │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                     Provider Health Monitor
                                 │
       ┌─────────────────────────┼─────────────────────────┐
       ▼                         ▼                         ▼
  IMAGE PIPELINE            AUDIO PIPELINE            3D PIPELINE
  ├── OpenAI (DALL-E 3)     ├── ElevenLabs            ├── Hyper3D (Cloud)
  │   [CONFIG_REQUIRED]     │   [AUTH_REQUIRED]       │   [CONFIG_REQUIRED]
  │                         │                         │
  └── Local SVG Synthesizer └── Edge-TTS WAV Engine   └── Blender Procedural
      [VERIFIED_LOCAL]          [VERIFIED_LOCAL]          [VERIFIED_LOCAL]
```

---

## 2. Capability Execution Rules

- **`TEXT` / `CODE`**: Routed to Ollama GPU (`qwen2.5-coder:7b`) [VERIFIED_LOCAL] or DeepSeek API [VERIFIED_LIVE] with automatic OpenRouter free fallback.
- **`IMAGE`**: If `OPENAI_API_KEY` is not present, the router logs a fallback and executes `LOCAL` SVG/Canvas image generation.
- **`AUDIO`**: If `ELEVENLABS_API_KEY` is absent, the system uses the `LOCAL_TTS` WAV tone engine.
- **`3D`**: Uses the local Blender Python execution wrapper to compile GLTF meshes.
- **`VIDEO`**: Sequences scenes and outputs a Remotion WebM composition manifest.
