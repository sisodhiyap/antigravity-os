# Antigravity OS V7 — Trust Center Operator Guide

## 1. Operating the Trust Center UI
The Trust Center in the Operator Console provides comprehensive visibility into all facts, assumptions, uncertainties, and security evaluations.

### Key Views
1. **Trust Score Gauge**: Real-time evaluation of factual grounding, evidence completeness, and freshness.
2. **Claim Filters**: Filter by `VERIFIED`, `OBSERVED`, `SUPPORTED`, `INFERRED`, `GENERATED`, `UNKNOWN`, `CONTRADICTED`, and `STALE`.
3. **Claim Inspector**: Click any claim to inspect its full cryptographic hash, source citations, evidence chain, and verification timeline.

## 2. Resolving Contradictions
When conflicting sources arise:
- The system automatically compiles a `ContradictionSet`.
- Higher-authority sources and direct runtime executions (E5) take precedence.
- If authority is equal, the claim is presented as `CONTRADICTED / UNRESOLVED`, surfacing uncertainty directly to the operator.
