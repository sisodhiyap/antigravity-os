# HUGGING FACE AGENTS MCP INTEGRATION SPECIFICATION

## 1. OFFICIAL INTEGRATION REFERENCE
- **Official Documentation**: [https://huggingface.co/docs/hub/agents-mcp](https://huggingface.co/docs/hub/agents-mcp)
- **Official Endpoint**: `https://huggingface.co/mcp`
- **MCP Settings**: [https://huggingface.co/settings/mcp](https://huggingface.co/settings/mcp)

---

## 2. CLIENT ARCHITECTURE (`src/server/tools/huggingface-mcp.ts`)

Antigravity OS implements the official Model Context Protocol (MCP) JSON-RPC specification to connect directly to the Hugging Face Hub MCP endpoint.

### 2.1 Available & Verified Tools

| Tool Name | Scope | Capability Description |
|-----------|-------|------------------------|
| `hf_search_models` | Hub Models | Search models by query, task, or tag |
| `hf_search_datasets` | Hub Datasets | Search open datasets across categories |
| `hf_search_spaces` | Spaces | Search Gradio & Docker interactive Spaces |
| `hf_docs_search` | Documentation | Semantic search over official Hugging Face docs |
| `hf_get_model_info` | Model Metadata | Retrieve model tags, pipeline type, and author |

### 2.2 Live Handshake & Authentication

1. **Token Resolution**:
   - Checks `process.env.HF_TOKEN`
   - Falls back dynamically to user's Windows Desktop: `Desktop\antikeys.txt`
   - Resolves Bearer authorization header `Bearer <token>`
2. **TLS Security**:
   - Node.js server-side requests adapt to local corporate firewall certificates safely.
3. **Registry Registration**:
   - Registered as Server #26 (`huggingface`) in `src/server/tools/mcp-registry.ts`.
   - Accessible to Hermes and all agent workflows through the unified tool bridge.

---

## 3. SANITIZED MCP CONFIGURATION EXAMPLE

For desktop MCP hosts or CLI tools, the recommended configuration is:

```json
{
  "mcpServers": {
    "huggingface": {
      "url": "https://huggingface.co/mcp",
      "headers": {
        "Authorization": "Bearer ${HF_TOKEN}"
      }
    }
  }
}
```

> **Security Note:** Never hardcode the real token in configuration files or source code.
