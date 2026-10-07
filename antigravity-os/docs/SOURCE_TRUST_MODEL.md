# Antigravity OS V7 — Source Trust Model

## 1. Source Classification & Trust Hierarchy

| Source Class | Default Trust Weight | Provenance Requirement | Independent Evidence For Self |
| :--- | :--- | :--- | :--- |
| **OWNER_SOURCE** | 1.00 | Owner cryptographically signed key | Yes |
| **LOCAL_RUNTIME** | 0.98 | Deterministic process/CLI output hash | Yes |
| **LOCAL_FILE** | 0.95 | File SHA-256 hash on disk | Yes |
| **OFFICIAL_DOCUMENTATION** | 0.90 | Verified domain & URL retrieval timestamp | Yes |
| **PRIMARY_SOURCE** | 0.85 | First-party publication timestamp & hash | Yes |
| **SECONDARY_SOURCE** | 0.65 | Multi-reference citation link | Yes |
| **TERTIARY_SOURCE** | 0.45 | Summary or aggregator citation | Partial |
| **USER_ASSERTION** | 0.40 | Input hash | No (Requires corroboration) |
| **MODEL_OUTPUT** | 0.20 | Model ID + Prompt hash | **NEVER** |
| **UNKNOWN_SOURCE** | 0.05 | Raw capture | No |

## 2. Model Output Restriction
Under no circumstances is `MODEL_OUTPUT` considered independent evidence for its own assertions. Model consensus (e.g. Model A agrees with Model B) remains a hypothesis until corroborated by empirical sources (`LOCAL_FILE`, `OFFICIAL_DOCUMENTATION`, or `LOCAL_RUNTIME`).
