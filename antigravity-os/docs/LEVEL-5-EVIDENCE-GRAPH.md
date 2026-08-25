# 🕸️ ANTIGRAVITY LEVEL-5 EVIDENCE GRAPH SPECIFICATION

## 1. LINEAGE MODEL

The `EvidenceGraph` stores every engineering artifact in a cryptographically connected graph structure:
- **12 Node Types**: `REQUIREMENT`, `SPEC`, `UX_DECISION`, `ARCHITECTURE`, `CODE_CHANGE`, `TEST`, `SECURITY`, `ARTIFACT`, `RELEASE`, `DEPLOYMENT`, `INCIDENT`, `REMEDIATION`, `POSTMORTEM`.
- **8 Edge Types**: `DERIVED_FROM`, `IMPLEMENTS`, `VALIDATES`, `DEPENDS_ON`, `DEPLOYED_AS`, `CAUSED_BY`, `REMEDIATES`, `SUPERSEDES`.

---

## 2. TRACEABILITY QUERIES

1. **Why does this code exist?**
   - Query: `evidenceGraph.traceWhyCodeExists(codeNodeId)`
   - Returns: Complete ancestor path up to the originating `REQUIREMENT` node.
2. **Which tests validate this requirement?**
   - Query: `evidenceGraph.getTestsForRequirement(reqNodeId)`
   - Returns: All `TEST` nodes validating artifacts derived from the requirement.
