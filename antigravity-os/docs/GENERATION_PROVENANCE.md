# OMNICRAFT GENERATION PROVENANCE SPECIFICATION

## 1. Cryptographic Lineage & Integrity
Every generated asset in the OmniCraft system receives a mandatory, immutable provenance manifest upon creation. 

- **SHA-256 Checksum**: Computed programmatically from the raw file contents (`crypto.createHash("sha256")`).
- **Orphan Prevention**: Assets are immediately registered in the asset table before being served to the frontend.

---

## 2. Provenance Schema Reference

```json
{
  "assetId": "ast_1787382025_9b2a",
  "userId": "usr_accept_01",
  "projectId": "proj_accept_01",
  "capability": "IMAGE",
  "provider": "antigravity-native-image",
  "model": "vector-canvas-synthesis",
  "executionMode": "LOCAL",
  "promptHash": "4fa92c10b1ad8...",
  "hashSha256": "bd365963d78a9ddfe8399573887...",
  "sizeBytes": 2048,
  "mimeType": "image/svg+xml",
  "timestamp": "2026-08-22T07:05:00Z"
}
```
If a parent asset exists (e.g. compiling a video containing generated images), the video's provenance stores the parent asset IDs, establishing a verifiable lineage.
