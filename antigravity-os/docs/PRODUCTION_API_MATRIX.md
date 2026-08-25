# OMNICRAFT PRODUCTION API MATRIX

## 1. REST API Routing Directory

| Method | Endpoint | Description | Real Database Connection | Target Output |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/omnicraft/image` | Generates campaign UI assets | Real-time `aiGateway` | Registered `IMAGE` Asset |
| `POST` | `/api/omnicraft/audio` | Synthesizes voiceover narration | Real-time `aiGateway` | Registered `AUDIO` Asset |
| `POST` | `/api/omnicraft/video` | Sequenced Remotion video reels | Real-time `aiGateway` | Registered `VIDEO` Asset |
| `POST` | `/api/omnicraft/mesh3d` | Procedural Blender GLTF compiling | Real-time `aiGateway` | Registered `MODEL_3D` Asset |
| `GET` | `/api/omnicraft/assets` | Lists registered media library | Canonical Asset Registry | JSON Asset Array |
| `GET` | `/api/omnicraft/providers`| Exposes healthy/disabled adapters | Provider health ledger | JSON State Matrix |
| `POST` | `/api/omnicraft/chat` | AI reasoning chat completions | LLM Gateway Selector | Prompt Response |

---

## 2. Server-Side Security Headers & CORS
- **Security Scope**: Traversal checker (`filesystemSecurity`) blocks all paths with `..` or leading secret identifiers.
- **CORS Rules**: Requests are limited to same-origin domains in production.
- **Header Policies**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
