# Antigravity OS V7.0 — Plugin & Adapter Guide

## 1. Plugin Governance
All extensions connect strictly through the public `PluginAdapterManager` above the frozen core.

## 2. Plugin Promotion Lifecycle
1. **REGISTER**: Plugin registers its manifest.
2. **STATIC ANALYSIS**: Scans for dangerous APIs and hardcoded secrets.
3. **SANDBOX TEST**: Executes within isolated worker environments.
4. **REALITY TEST**: Verifies tool calls against real execution backends.
5. **OWNER APPROVAL**: Requires Level 5 approval before promotion to `ACTIVE`.
