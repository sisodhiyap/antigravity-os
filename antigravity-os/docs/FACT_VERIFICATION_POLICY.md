# Antigravity OS V7 — Fact Verification Policy

## 1. Fact Status Taxonomy
Every extracted statement in Antigravity OS MUST receive exactly one of the following statuses:

| Status | Meaning | Required Evidence Level |
| :--- | :--- | :--- |
| **OBSERVED** | Directly present in supplied material or runtime observation | E3, E5 |
| **VERIFIED** | Confirmed by independent verification or execution | E4, E5 |
| **SUPPORTED** | Supported by reliable evidence but not independently reconstructed | E3 |
| **INFERRED** | Derived logically from available evidence | E2, E3 |
| **GENERATED** | Created by an AI model or generator | E1 |
| **ASSUMED** | An assumption introduced because evidence is incomplete | E1 |
| **UNKNOWN** | Insufficient evidence available | E0 |
| **CONTRADICTED** | Evidence directly conflicts with the claim | Conflict set |
| **STALE** | Previously valid information whose freshness expired | Expired |

## 2. Evidence Scoring Levels (E0 - E5)
- **E0 (No Evidence)**: Pure ungrounded assertion.
- **E1 (Model-Generated)**: Output from an AI model without external proof.
- **E2 (User Assertion)**: Statement from a user prompt or unverified source.
- **E3 (Trusted Source)**: Support from official documentation or local verified files.
- **E4 (Cross-Check)**: Confirmed by multiple independent, authoritative sources.
- **E5 (Runtime Execution)**: Confirmed by direct deterministic code execution, test pass, or API response.

## 3. High-Risk Category Enforcement
The following categories mandate minimum E4/E5 evidence before promotion:
`SECURITY`, `MEDICAL`, `LEGAL`, `FINANCIAL`, `IDENTITY`, `CURRENT_EVENTS`, `GOVERNMENT`, `SAFETY`, `SCIENTIFIC_CLAIMS`, `SOFTWARE_SECURITY`, `PRIVACY`, `CURRENT_PRODUCT_CAPABILITIES`.

## 4. Absolute Rule
The system strictly prefers **"I don't know"** over a fabricated answer, **"Not verified"** over a false pass, and **"Evidence conflict"** over an arbitrary decision.
