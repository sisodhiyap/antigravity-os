/**
 * ANTIGRAVITY OS v5.3 — AGENT SWARM GRAPH
 * AgentGraph: 14 Graph-Aware Specialist Agent Definitions & Structured Artifact Contracts
 */

export interface SpecialistAgent {
  id: string;
  name: string;
  roleTitle: string;
  capabilities: string[];
  preferredModel: string;
  permissionTier: "READ_ONLY" | "LOW_RISK_WRITE" | "HIGH_RISK_WRITE" | "PRODUCTION_CRITICAL";
  description: string;
}

export interface AgentArtifactPayload {
  agentId: string;
  taskId: string;
  decision: string;
  artifactPath?: string;
  evidence: Record<string, any>;
  confidence: number;
  timestamp: string;
}

export class AgentGraph {
  public static readonly SPECIALIST_ROSTER: SpecialistAgent[] = [
    {
      id: "agent_product_architect",
      name: "Product Architect",
      roleTitle: "Lead Product & Requirements Architect",
      capabilities: ["requirements-analysis", "user-stories", "scope-definition"],
      preferredModel: "qwen2.5-coder:7b",
      permissionTier: "READ_ONLY",
      description: "Deconstructs prompts into functional requirements, constraints, and acceptance criteria."
    },
    {
      id: "agent_ux_strategist",
      name: "UX Strategist",
      roleTitle: "User Experience & Wireframe Architect",
      capabilities: ["ux-research", "wireframing", "information-architecture"],
      preferredModel: "qwen2.5-coder:7b",
      permissionTier: "READ_ONLY",
      description: "Establishes information hierarchy, interaction states, and user journeys."
    },
    {
      id: "agent_ui_engineer",
      name: "UI Engineer",
      roleTitle: "Frontend & Design System Engineer",
      capabilities: ["vanilla-css-tokens", "hardware-accel", "dom-binding", "responsive-design"],
      preferredModel: "qwen2.5-coder:7b",
      permissionTier: "LOW_RISK_WRITE",
      description: "Builds high-performance glassmorphic user interfaces and responsive layouts."
    },
    {
      id: "agent_backend_engineer",
      name: "Backend Engineer",
      roleTitle: "API & Systems Engineer",
      capabilities: ["rest-api", "crypto-auth", "rbac-middleware", "node-http"],
      preferredModel: "qwen2.5-coder:7b",
      permissionTier: "LOW_RISK_WRITE",
      description: "Implements robust HTTP servers, route dispatchers, and authentication engines."
    },
    {
      id: "agent_db_engineer",
      name: "Database Engineer",
      roleTitle: "Persistence & Data Architect",
      capabilities: ["sqlite-wal", "schema-design", "acid-transactions", "indexing"],
      preferredModel: "qwen2.5-coder:7b",
      permissionTier: "LOW_RISK_WRITE",
      description: "Provisions SQLite WAL tables, relational schemas, and atomic disk writes."
    },
    {
      id: "agent_ai_engineer",
      name: "AI Engineer",
      roleTitle: "Model Routing & Context Engineer",
      capabilities: ["model-routing", "ollama-gpu", "airllm-cascade", "prompt-optimization"],
      preferredModel: "qwen2.5-coder:7b",
      permissionTier: "LOW_RISK_WRITE",
      description: "Routes tasks across local GPU Ollama, AirLLM, and in-process fallback mesh."
    },
    {
      id: "agent_security_engineer",
      name: "Security Engineer",
      roleTitle: "Defense & Cryptography Engineer",
      capabilities: ["pbkdf2-sha512", "jwt-hmac", "path-traversal-defense", "dotfile-shield"],
      preferredModel: "qwen2.5-coder:7b",
      permissionTier: "LOW_RISK_WRITE",
      description: "Implements timing-safe verification, sandbox boundaries, and encryption gates."
    },
    {
      id: "agent_qa_engineer",
      name: "QA Engineer",
      roleTitle: "Quality Assurance & Test Automation Lead",
      capabilities: ["unit-testing", "api-testing", "e2e-qa", "playwright"],
      preferredModel: "qwen2.5-coder:7b",
      permissionTier: "READ_ONLY",
      description: "Executes functional unit tests, API integration tests, and multi-viewport QA."
    },
    {
      id: "agent_performance_engineer",
      name: "Performance Engineer",
      roleTitle: "Telemetry & Performance Profiler",
      capabilities: ["profiling", "latency-benchmarking", "memory-telemetry"],
      preferredModel: "qwen2.5-coder:7b",
      permissionTier: "READ_ONLY",
      description: "Measures startup times, latency percentiles, and memory footprint."
    },
    {
      id: "agent_devops_engineer",
      name: "DevOps Engineer",
      roleTitle: "Infrastructure & Packaging Engineer",
      capabilities: ["docker-multistage", "docker-compose", "volume-persistence"],
      preferredModel: "qwen2.5-coder:7b",
      permissionTier: "LOW_RISK_WRITE",
      description: "Constructs hardened Alpine Docker containers and compose service stacks."
    },
    {
      id: "agent_code_reviewer",
      name: "Code Reviewer",
      roleTitle: "Independent Senior Reviewer",
      capabilities: ["code-review", "anti-hallucination", "strict-types"],
      preferredModel: "qwen2.5-coder:7b",
      permissionTier: "READ_ONLY",
      description: "Audits generated code against architectural rules and TypeScript strictness."
    },
    {
      id: "agent_red_team",
      name: "Red Team Agent",
      roleTitle: "Adversarial Attack Specialist",
      capabilities: ["sqli-attack", "xss-probe", "traversal-attack", "jwt-forge"],
      preferredModel: "qwen2.5-coder:7b",
      permissionTier: "READ_ONLY",
      description: "Launches 20+ red-team attacks to identify security vulnerabilities."
    },
    {
      id: "agent_research_agent",
      name: "Research Agent",
      roleTitle: "Domain Knowledge Researcher",
      capabilities: ["domain-research", "competitive-analysis", "best-practices"],
      preferredModel: "qwen2.5-coder:7b",
      permissionTier: "READ_ONLY",
      description: "Synthesizes industry-specific patterns and architectural domain models."
    },
    {
      id: "agent_release_engineer",
      name: "Release Engineer",
      roleTitle: "Release & Certification Gatekeeper",
      capabilities: ["sha256-hashing", "certification-generation", "owner-gate"],
      preferredModel: "qwen2.5-coder:7b",
      permissionTier: "PRODUCTION_CRITICAL",
      description: "Captures cryptographic evidence hashes and generates master reality certificates."
    }
  ];

  public static getAgentById(id: string): SpecialistAgent | undefined {
    return this.SPECIALIST_ROSTER.find((a) => a.id === id || a.name.toLowerCase() === id.toLowerCase());
  }
}
