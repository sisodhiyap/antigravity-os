# Antigravity IDE — MCP Workstation Rules & Operating Constitution

This document defines the operational rules, safety boundaries, tool selection matrix, and quality standards for Antigravity IDE.

---

## 1. Safety & Security Safeguards

1. **Zero Secret Exposure**:
   - Secrets (API keys, passwords, bearer tokens, SSH keys) MUST NEVER be embedded in source code, commit messages, logs, or chat outputs.
   - All secret credentials MUST be loaded from environment variables or `.env` files.

2. **Human Approval Gate for Destructive Operations**:
   - Explicit confirmation is MANDATORY before executing:
     - Destructive database commands (`DROP DATABASE`, `DROP TABLE`, `DELETE` without `WHERE`, `TRUNCATE`).
     - Destructive git operations (`git push --force`, `git reset --hard` on shared branches).
     - File tree deletions or destructive build directory purges.

3. **DOM & Code Security**:
   - Never use `document.write()` or unsafe `innerHTML` for rendering dynamic strings or AI model outputs.
   - Use safe DOM node creation (`textContent` / `createTextNode`).

---

## 2. Tool Selection & Efficiency Matrix

When executing tasks, select the minimum set of high-quality tools required:

| Task Type | Core Tools & MCP Servers | Key Capabilities |
| :--- | :--- | :--- |
| **Web UI & Frontend** | `playwright` MCP, `StitchMCP`, Tailwind CSS, `run_command` | Page navigation, screenshot capture, console inspection, UI generation |
| **Backend & APIs** | `supabase` MCP, `prisma-mcp-server`, `api-integrator` skill | SQL execution, Prisma migrations, API route wiring, schema analysis |
| **Mobile / Flutter** | `dart-mcp-server` skill, `android-cli` plugin | Flutter project analysis, pub dependencies, widget testing, Android CLI |
| **Git & GitHub** | `github` MCP, `run_command` | Repositories search, issues, pull requests, commits, local git status |
| **Memory & Context** | `memory` MCP | Graph entity relations, project observations across complex multi-step tasks |
| **Research & Docs** | `search_web`, `read_url_content`, `mobbin` MCP | Authoritative documentation lookup, UI design pattern research |

---

## 3. Senior Engineer Coding Workflow

For every feature request or refactoring task:

1. **Understand**: Inspect relevant repository files, architecture, existing dependencies, and build commands before writing code.
2. **Plan**: Outline the minimal clean implementation plan.
3. **Implement**: Write clean, modular, strongly-typed code adhering to existing project conventions.
4. **Validate**:
   - Run linter/analyzer checks.
   - Run unit and integration tests.
   - Run Playwright browser tests for UI verification.
5. **Review**: Audit for regressions, type safety, performance, accessibility (WCAG AA), and security.
6. **Report**: Summarize files changed, implementation details, test results, and any limitations discovered.
