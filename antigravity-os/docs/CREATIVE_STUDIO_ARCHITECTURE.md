# ANTIGRAVITY OS — SOVEREIGN CREATIVE STUDIO ARCHITECTURE

## 1. EXECUTIVE OVERVIEW

The **Sovereign Creative Studio** is a multimodal AI synthesis engine and agentic hub natively embedded in Antigravity OS. It delivers:
- **Neural Image Generation**: High-fidelity 8K visual generation via Pollinations.ai (Flux Realism) with Hugging Face serverless inference fallback and deterministic local vector rasterization.
- **Neural Speech (TTS)**: Authentic acoustic formant speech synthesis producing 44.1kHz stereo WAV audio with customizable voice models (`onyx`, `aurora`, `echo`, `sol`).
- **Algorithmic & AI Music Generation**: Polyphonic harmonic synthesizer and Hugging Face MusicGen generating authentic stereo audio across ambient, cyberpunk, and cinematic genres.
- **Asynchronous Video Synthesis**: Real broadcast H.264 video rendering with spatial motion vectors powered by native FFmpeg 8.1.2.
- **Explicit Slideshow Fallback**: Transparently labeled non-AI fallback (`Slideshow fallback — not AI text-to-video`) generating synchronized MP4 animations.
- **Cloudinary Sovereign CDN**: Automatic signed cloud upload (`vvtrwtw3`) providing instant CDN streaming URLs for all generated media assets.
- **Official Hugging Face Agents MCP**: Native Model Context Protocol client connecting to `https://huggingface.co/mcp` with live Hub model, dataset, space, and documentation discovery.

---

## 2. SYSTEM ARCHITECTURE & TOPOLOGY

```
                    +------------------------------------------+
                    |    Antigravity OS Web & Desktop Shell    |
                    |           /creative (Black & Gold)       |
                    +--------------------+---------------------+
                                         |
                       POST /api/{image, audio, video}
                       GET  /api/creative/mcp
                                         |
     +-----------------------------------+-----------------------------------+
     |                                   |                                   |
+----+--------------------+     +-------+--------------------+     +--------+-------------------+
|  ImageProviderManager   |     |   AudioProviderManager     |     |   VideoProviderManager    |
| - Pollinations (Flux)   |     | - Acoustic Formant TTS     |     | - Async Job Life Cycle    |
| - Hugging Face Infr.   |     | - Algorithmic Music Synth  |     | - FFmpeg 8.1.2 H.264 Enc. |
| - Local Vector Raster   |     | - HF MusicGen / MMS-TTS    |     | - Slideshow Fallback      |
+------------+------------+     +------------+---------------+     +------------+--------------+
             |                               |                                  |
             +-------------------------------+----------------------------------+
                                             |
             +-------------------------------+----------------------------------+
             |                                                                  |
+------------v------------+                                            +--------v--------------+
| Cloudinary Sovereign CDN|                                            | Hugging Face MCP Hub  |
| - Cloud: vvtrwtw3       |                                            | - Endpoint: /mcp      |
| - Secure Signed Upload  |                                            | - 5 Real Hub Tools    |
| - Global Fast CDN URLs  |                                            | - Token: Desktop Key  |
+-------------------------+                                            +-----------------------+
```

---

## 3. PROVIDER ABSTRACTIONS & CONTRACTS

### 3.1 Image Generation (`src/lib/providers/image.ts`)
- **Primary**: Pollinations.ai Flux Realism (4-5s execution, no server cold-start).
- **Secondary**: Hugging Face Inference API (`black-forest-labs/FLUX.1-schnell`).
- **Tertiary Sandbox**: Deterministic 8-byte PNG vector gradient rasterizer.
- **Sync**: Automatically uploads valid buffers to Cloudinary `antigravity-creative/images`.

### 3.2 Audio Generation (`src/lib/providers/audio.ts`)
- **Speech (TTS)**:
  - Hugging Face `facebook/mms-tts-eng`.
  - Acoustic formant synthesizer producing real 44.1kHz 16-bit stereo PCM with RIFF/WAVE header.
- **Music Generation**:
  - Hugging Face `facebook/musicgen-small`.
  - Algorithmic harmonic polyphonic synthesizer (chords, bass, percussion, hi-hat shimmer).
- **Sync**: Automatically uploads valid buffers to Cloudinary `antigravity-creative/audio`.

### 3.3 Video Generation (`src/lib/providers/video.ts`)
- **Job Lifecycle**: `queued` -> `starting` -> `processing` -> `completed` / `failed` / `cancelled`.
- **Text-to-Video & Image-to-Video**:
  1. Keyframe synthesis (via ImageProviderManager or user reference image).
  2. Ambient audio synthesis (via AudioProviderManager).
  3. Spatial motion filtergraph (`zoompan` with continuous focal drift).
  4. H.264 video encoding at 25fps + AAC audio muxing via native FFmpeg 8.1.2.
  5. Asynchronous synchronization with Cloudinary `antigravity-creative/videos`.
- **Slideshow Fallback**:
  - Clearly tagged with `isSlideshowFallback: true` and labeled in the UI as `Slideshow fallback — not AI text-to-video`.

---

## 4. SECURITY & CREDENTIAL ISOLATION

1. **Zero Secret Leakage**:
   - The user's Hugging Face token is resolved securely from `Desktop\antikeys.txt` or server-side environment `HF_TOKEN`.
   - Never printed in logs, never returned in API responses, never exposed in client bundles (`NEXT_PUBLIC_*`).
   - Inspected solely via minimal authenticated `/api/whoami-v2` probe to verify account ownership.
2. **Cloudinary Isolation**:
   - `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are kept strictly in server-side `.env.local` (ignored by Git).
   - Signed uploads are computed server-side via SHA-1 or HTTP Basic Auth header.
3. **Content Safety & Quotas**:
   - Input validation enforces max prompt lengths (2000 chars for image/video, 2500 for audio).
   - Video duration bounded between 3 and 15 seconds.
   - Bounded async job polling with 120-second timeout.
