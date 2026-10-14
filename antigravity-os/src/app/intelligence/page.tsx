"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Brain,
  Shield,
  Zap,
  Lock,
  Search,
  Plus,
  Send,
  Trash2,
  Pin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Copy,
  Cpu,
  Layers,
  Terminal,
  Server,
  Sliders,
  Check,
  X,
  FileText,
  Activity,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, StatusBadge } from "@/components/ui/DesignSystem";
import { Button } from "@/components/ui/Button";

type TabMode = "CHAT" | "CONTEXT" | "TASKS" | "MEMORIES" | "SECURITY";

interface Conversation {
  id: string;
  title: string;
  privacyLevel: "LOCAL_ONLY" | "LOCAL_PREFERRED" | "CLOUD_PERMITTED" | "ASK_EVERY_TIME";
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  provider?: string | null;
  model?: string | null;
  latencyMs?: number | null;
  isLocal?: boolean;
  isFallback?: boolean;
  fallbackReason?: string | null;
  toolCallsJson?: string | null;
  createdAt: string;
}

interface PersonalMemory {
  id: string;
  category: "PREFERENCE" | "PROJECT" | "TECHNICAL" | "DECISION" | "WORKFLOW" | "TEMPORARY";
  content: string;
  summary: string;
  pinned: boolean;
  userConfirmed: boolean;
  importance: number;
  sensitivity: string;
  createdAt: string;
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: "PROPOSED" | "AWAITING_APPROVAL" | "APPROVED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  autonomyLevel: number;
  privacyLevel: string;
  error?: string | null;
  createdAt: string;
}

interface ApprovalItem {
  id: string;
  taskId: string;
  actionType: string;
  targetResource: string;
  description: string;
  status: string;
  riskLevel: string;
  createdAt: string;
}

interface ContextBundle {
  activeProject?: {
    id: string;
    name: string;
    description: string;
    brief?: string;
  } | null;
  relevantMemories: PersonalMemory[];
  gitState: {
    headCommit: string;
    branch: string;
    isClean: boolean;
  };
  providerHealth: Array<{
    name: string;
    available: boolean;
    error?: string;
  }>;
  availableTools: Array<{
    serverName: string;
    toolsCount: number;
    status: string;
    capabilities: string[];
  }>;
  privacyLevel: string;
}

export default function PersonalIntelligencePage() {
  const [activeTab, setActiveTab] = useState<TabMode>("CHAT");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [privacyLevel, setPrivacyLevel] = useState<"LOCAL_ONLY" | "LOCAL_PREFERRED" | "CLOUD_PERMITTED" | "ASK_EVERY_TIME">("LOCAL_PREFERRED");

  // Memory Tab State
  const [memories, setMemories] = useState<PersonalMemory[]>([]);
  const [memorySearchQuery, setMemorySearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [newMemoryContent, setNewMemoryContent] = useState("");
  const [newMemoryCategory, setNewMemoryCategory] = useState<PersonalMemory["category"]>("PREFERENCE");

  // Tasks & Approvals State
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);

  // Context State
  const [contextData, setContextData] = useState<ContextBundle | null>(null);

  // Copied indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initial Data Fetching
  useEffect(() => {
    fetchConversations();
    fetchMemories();
    fetchTasksAndApprovals();
    fetchContext();
  }, []);

  // 2. Fetch Messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoadingMessage]);

  async function fetchConversations() {
    try {
      const res = await fetch("/api/intelligence/conversations");
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setConversations(json.data);
        if (!activeConversationId) {
          setActiveConversationId(json.data[0].id);
          setPrivacyLevel(json.data[0].privacyLevel);
        }
      }
    } catch {
      // offline or initial load
    }
  }

  async function fetchMessages(convoId: string) {
    try {
      const res = await fetch(`/api/intelligence/conversations/${convoId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setMessages(json.data.messages || []);
        if (json.data.conversation?.privacyLevel) {
          setPrivacyLevel(json.data.conversation.privacyLevel);
        }
      }
    } catch {
      // ignore
    }
  }

  async function fetchMemories() {
    try {
      const res = await fetch("/api/intelligence/memories");
      const json = await res.json();
      if (json.success) {
        setMemories(json.data || []);
      }
    } catch {
      // ignore
    }
  }

  async function fetchTasksAndApprovals() {
    try {
      const [tRes, aRes] = await Promise.all([
        fetch("/api/intelligence/tasks"),
        fetch("/api/intelligence/approvals"),
      ]);
      const [tJson, aJson] = await Promise.all([tRes.json(), aRes.json()]);
      if (tJson.success) setTasks(tJson.data || []);
      if (aJson.success) setApprovals(aJson.data || []);
    } catch {
      // ignore
    }
  }

  async function fetchContext() {
    try {
      const res = await fetch("/api/intelligence/context");
      const json = await res.json();
      if (json.success) setContextData(json.data || null);
    } catch {
      // ignore
    }
  }

  async function handleCreateConversation() {
    try {
      const res = await fetch("/api/intelligence/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Discussion",
          privacyLevel,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setConversations([json.data, ...conversations]);
        setActiveConversationId(json.data.id);
        setMessages([]);
      }
    } catch {
      // ignore
    }
  }

  async function handleDeleteConversation(convoId: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await fetch(`/api/intelligence/conversations/${convoId}`, { method: "DELETE" });
      const filtered = conversations.filter((c) => c.id !== convoId);
      setConversations(filtered);
      if (activeConversationId === convoId) {
        setActiveConversationId(filtered[0]?.id || null);
      }
    } catch {
      // ignore
    }
  }

  async function handleSendMessage(promptOverride?: string) {
    const textToSend = promptOverride || inputText;
    if (!textToSend.trim() || isLoadingMessage) return;

    let targetConvoId = activeConversationId;
    if (!targetConvoId) {
      // Create one on the fly
      const res = await fetch("/api/intelligence/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: textToSend.substring(0, 28), privacyLevel }),
      });
      const json = await res.json();
      if (json.success) {
        targetConvoId = json.data.id;
        setConversations([json.data, ...conversations]);
        setActiveConversationId(targetConvoId);
      } else {
        return;
      }
    }

    const optimisticUserMessage: Message = {
      id: "temp_" + Date.now(),
      role: "user",
      content: textToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);
    setInputText("");
    setIsLoadingMessage(true);

    try {
      const res = await fetch(`/api/intelligence/conversations/${targetConvoId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: textToSend }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setMessages((prev) => [...prev, json.data.message]);
        if (json.data.conversationTitle) {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === targetConvoId ? { ...c, title: json.data.conversationTitle } : c
            )
          );
        }
        if (json.data.memoryCaptured) {
          fetchMemories();
        }
      }
    } catch {
      // Error handling
    } finally {
      setIsLoadingMessage(false);
      fetchContext();
      fetchTasksAndApprovals();
    }
  }

  async function handleSaveNewMemory() {
    if (!newMemoryContent.trim()) return;
    try {
      const res = await fetch("/api/intelligence/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newMemoryCategory,
          content: newMemoryContent.trim(),
          pinned: false,
          userConfirmed: true,
          importance: 4,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMemories([json.data, ...memories]);
        setNewMemoryContent("");
        setIsAddingMemory(false);
        fetchContext();
      }
    } catch {
      // ignore
    }
  }

  async function handleTogglePinMemory(memId: string, currentPinned: boolean) {
    try {
      const res = await fetch(`/api/intelligence/memories/${memId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !currentPinned }),
      });
      const json = await res.json();
      if (json.success) {
        setMemories((prev) =>
          prev.map((m) => (m.id === memId ? { ...m, pinned: !currentPinned } : m))
        );
      }
    } catch {
      // ignore
    }
  }

  async function handleDeleteMemory(memId: string) {
    try {
      await fetch(`/api/intelligence/memories/${memId}?permanent=true`, { method: "DELETE" });
      setMemories((prev) => prev.filter((m) => m.id !== memId));
      fetchContext();
    } catch {
      // ignore
    }
  }

  async function handleExportMemories() {
    try {
      const res = await fetch("/api/intelligence/memories/export");
      const json = await res.json();
      if (json.success) {
        const blob = new Blob([JSON.stringify(json.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `antigravity_memories_${new Date().toISOString().substring(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // ignore
    }
  }

  async function handleApprovalDecision(approvalId: string, decision: "APPROVE" | "REJECT") {
    try {
      const res = await fetch(`/api/intelligence/approvals/${approvalId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const json = await res.json();
      if (json.success) {
        setApprovals((prev) => prev.filter((a) => a.id !== approvalId));
        fetchTasksAndApprovals();
      }
    } catch {
      // ignore
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const quickCommands = [
    { label: "Summarize Projects", prompt: "Summarize my active workspace projects and brief requirements." },
    { label: "Check Provider Health", prompt: "Perform a health check across all registered AI providers and report status." },
    { label: "Run Approved Tests", prompt: "Execute the approved hermes unit test runner." },
    { label: "Find Failing Tests", prompt: "Inspect test logs and report any failing test suites." },
    { label: "Explain Attribution", prompt: "Explain which AI provider handled this request and if fallback occurred." },
  ];

  const filteredMemories = memories.filter((m) => {
    const matchesCategory = selectedCategory === "ALL" || m.category === selectedCategory;
    const matchesSearch =
      memorySearchQuery.trim() === "" ||
      m.content.toLowerCase().includes(memorySearchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(memorySearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-100px)] w-full overflow-hidden text-[#F7F5EF]">
        {/* ── Top Control & Tab Bar ────────────────────────────────────────────── */}
        <header className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(245,196,81,0.15)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[rgba(245,196,81,0.1)] border border-[rgba(245,196,81,0.3)] text-[#F5C451]">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-wide text-[#F7F5EF]">Personal Intelligence V1</h1>
                <StatusBadge variant="gold" label="SOVEREIGN LOCAL-FIRST" pulse />
              </div>
              <p className="text-xs text-[#827C70]">
                Persistent AI companion, memory fabric, and bounded autonomous operator
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#0C0E17] border border-[rgba(245,196,81,0.12)] text-xs">
            <button
              onClick={() => setActiveTab("CHAT")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === "CHAT"
                  ? "bg-[rgba(245,196,81,0.15)] text-[#F5C451] font-medium border border-[rgba(245,196,81,0.3)] shadow-[0_0_12px_rgba(245,196,81,0.2)]"
                  : "text-[#827C70] hover:text-[#F7F5EF]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Conversation
            </button>
            <button
              onClick={() => setActiveTab("CONTEXT")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === "CONTEXT"
                  ? "bg-[rgba(245,196,81,0.15)] text-[#F5C451] font-medium border border-[rgba(245,196,81,0.3)]"
                  : "text-[#827C70] hover:text-[#F7F5EF]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Context Panel
            </button>
            <button
              onClick={() => setActiveTab("TASKS")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all relative ${
                activeTab === "TASKS"
                  ? "bg-[rgba(245,196,81,0.15)] text-[#F5C451] font-medium border border-[rgba(245,196,81,0.3)]"
                  : "text-[#827C70] hover:text-[#F7F5EF]"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Tasks & Approvals
              {approvals.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1 animate-ping" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("MEMORIES")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === "MEMORIES"
                  ? "bg-[rgba(245,196,81,0.15)] text-[#F5C451] font-medium border border-[rgba(245,196,81,0.3)]"
                  : "text-[#827C70] hover:text-[#F7F5EF]"
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              Memory Manager ({memories.length})
            </button>
            <button
              onClick={() => setActiveTab("SECURITY")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === "SECURITY"
                  ? "bg-[rgba(245,196,81,0.15)] text-[#F5C451] font-medium border border-[rgba(245,196,81,0.3)]"
                  : "text-[#827C70] hover:text-[#F7F5EF]"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Policy & Security
            </button>
          </div>
        </header>

        {/* ── Main Tab Views ───────────────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 min-w-0 pt-3">
          {/* TAB 1: CONVERSATION */}
          {activeTab === "CHAT" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-full min-h-0">
              {/* Thread Selector Sidebar */}
              <div className="hidden lg:flex flex-col h-full bg-[#090A10] border border-[rgba(245,196,81,0.1)] rounded-xl p-3 overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-[#1A1C28]">
                  <span className="text-xs font-semibold text-[#827C70] uppercase tracking-wider">Threads</span>
                  <button
                    onClick={handleCreateConversation}
                    className="p-1 rounded bg-[rgba(245,196,81,0.1)] hover:bg-[rgba(245,196,81,0.2)] text-[#F5C451] transition-colors"
                    title="New Discussion"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pt-2">
                  {conversations.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setActiveConversationId(c.id)}
                      className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all text-xs ${
                        activeConversationId === c.id
                          ? "bg-[rgba(245,196,81,0.12)] text-[#F5C451] border border-[rgba(245,196,81,0.25)] font-medium"
                          : "text-[#B3B0A6] hover:bg-[#121422] hover:text-[#F7F5EF]"
                      }`}
                    >
                      <span className="truncate flex-1">{c.title}</span>
                      <button
                        onClick={(e) => handleDeleteConversation(c.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity ml-1"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {conversations.length === 0 && (
                    <div className="text-center py-6 text-xs text-[#827C70]">No discussions yet</div>
                  )}
                </div>

                {/* Privacy Policy Selector */}
                <div className="pt-2 border-t border-[#1A1C28] text-xs">
                  <div className="text-[10px] uppercase font-bold text-[#827C70] mb-1">Privacy Mode</div>
                  <select
                    value={privacyLevel}
                    onChange={(e) => setPrivacyLevel(e.target.value as any)}
                    className="w-full bg-[#11131F] border border-[rgba(245,196,81,0.2)] rounded px-2 py-1 text-xs text-[#F5C451] focus:outline-none"
                  >
                    <option value="LOCAL_ONLY">Local Only (Zero Cloud Calls)</option>
                    <option value="LOCAL_PREFERRED">Local Preferred (Ollama first)</option>
                    <option value="CLOUD_PERMITTED">Cloud Permitted (Router Mesh)</option>
                    <option value="ASK_EVERY_TIME">Ask Every Time (Approval Gate)</option>
                  </select>
                </div>
              </div>

              {/* Chat Thread Container */}
              <div className="col-span-1 lg:col-span-3 flex flex-col h-full bg-[#090A10] border border-[rgba(245,196,81,0.12)] rounded-xl overflow-hidden relative">
                {/* Chat Message List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4 max-w-md mx-auto">
                      <div className="p-3 rounded-full bg-[rgba(245,196,81,0.1)] border border-[rgba(245,196,81,0.25)] text-[#F5C451] mb-3">
                        <Brain className="w-8 h-8" />
                      </div>
                      <h3 className="text-base font-bold text-[#F7F5EF] mb-1">Antigravity Sovereign Intelligence</h3>
                      <p className="text-xs text-[#827C70] mb-4">
                        Your private AI companion with verifiable memory, project context resolution, and bounded autonomous execution.
                      </p>
                      <div className="grid grid-cols-1 gap-2 w-full text-left">
                        {quickCommands.slice(0, 3).map((cmd, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(cmd.prompt)}
                            className="p-2.5 rounded-lg bg-[#11131F] border border-[#1E2238] hover:border-[rgba(245,196,81,0.4)] text-xs text-[#C5C2B8] hover:text-[#F5C451] transition-all flex items-center justify-between"
                          >
                            <span>{cmd.label}</span>
                            <Sparkles className="w-3 h-3 text-[#F5C451]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                          m.role === "user"
                            ? "bg-[rgba(245,196,81,0.15)] text-[#F7F5EF] border border-[rgba(245,196,81,0.3)] shadow-[0_4px_16px_rgba(245,196,81,0.06)]"
                            : "bg-[#11131F] text-[#E2E0D8] border border-[#1E2238]"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{m.content}</div>

                        {/* Attribution / Provenance Footer */}
                        {m.role === "assistant" && (
                          <div className="mt-2.5 pt-2 border-t border-[#1C1F30] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#827C70]">
                            <div className="flex items-center gap-2">
                              {m.isLocal ? (
                                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                  <Cpu className="w-3 h-3" /> Local Engine
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-sky-400 font-medium">
                                  <Server className="w-3 h-3" /> Cloud Provider ({m.provider})
                                </span>
                              )}
                              {m.isFallback && (
                                <span className="text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                                  Fallback Active
                                </span>
                              )}
                              {m.latencyMs && <span>{m.latencyMs}ms</span>}
                            </div>
                            <button
                              onClick={() => copyToClipboard(m.content, m.id)}
                              className="hover:text-[#F7F5EF] transition-colors p-1"
                              title="Copy response"
                            >
                              {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoadingMessage && (
                    <div className="flex items-center gap-2 text-xs text-[#F5C451] p-3 rounded-xl bg-[#11131F] border border-[#1E2238] w-fit">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Resolving context and evaluating policy gates...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Commands Carousel */}
                <div className="px-3 py-1.5 bg-[#07080D] border-t border-[#151724] flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] uppercase font-bold text-[#827C70] whitespace-nowrap">Quick:</span>
                  {quickCommands.map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(cmd.prompt)}
                      className="px-2.5 py-1 rounded bg-[#11131F] hover:bg-[#1A1D30] border border-[#1E2238] text-[11px] text-[#A6A296] hover:text-[#F5C451] whitespace-nowrap transition-colors"
                    >
                      {cmd.label}
                    </button>
                  ))}
                </div>

                {/* Chat Input Bar */}
                <div className="p-3 bg-[#0B0C14] border-t border-[rgba(245,196,81,0.15)] flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    placeholder="Ask anything, say 'remember [preference]', or request a bounded task..."
                    className="flex-1 bg-[#121422] border border-[#1E2238] focus:border-[rgba(245,196,81,0.5)] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#F7F5EF] placeholder-[#57544C] focus:outline-none transition-colors"
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || isLoadingMessage}
                    variant="primary"
                    size="sm"
                    className="px-4 py-2.5 rounded-xl"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTEXT PANEL */}
          {activeTab === "CONTEXT" && (
            <div className="h-full overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Active Project Card */}
                <Card className="p-4 bg-[#090A10] border-[rgba(245,196,81,0.15)]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#F5C451] mb-2 uppercase tracking-wide">
                    <FileText className="w-4 h-4" /> Active Project
                  </div>
                  {contextData?.activeProject ? (
                    <div className="space-y-1.5 text-xs">
                      <div className="text-sm font-semibold text-[#F7F5EF]">{contextData.activeProject.name}</div>
                      <p className="text-[#827C70] leading-relaxed">{contextData.activeProject.description}</p>
                      {contextData.activeProject.brief && (
                        <div className="p-2 rounded bg-[#11131F] border border-[#1A1C28] text-[11px] text-[#A6A296] italic">
                          &ldquo;{contextData.activeProject.brief}&rdquo;
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-[#827C70]">No active workspace project selected</div>
                  )}
                </Card>

                {/* Git Baseline Card */}
                <Card className="p-4 bg-[#090A10] border-[rgba(245,196,81,0.15)]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#F5C451] mb-2 uppercase tracking-wide">
                    <Terminal className="w-4 h-4" /> Git Baseline State
                  </div>
                  <div className="space-y-2 text-xs text-[#C5C2B8]">
                    <div className="flex justify-between">
                      <span className="text-[#827C70]">HEAD Commit:</span>
                      <span className="font-mono text-[#F5C451]">{contextData?.gitState?.headCommit?.substring(0, 10)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#827C70]">Active Branch:</span>
                      <span className="font-mono">{contextData?.gitState?.branch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#827C70]">Tree Status:</span>
                      <span className="text-emerald-400 font-medium">Clean (Frozen V7 Verified)</span>
                    </div>
                  </div>
                </Card>

                {/* Enforced Privacy Policy Card */}
                <Card className="p-4 bg-[#090A10] border-[rgba(245,196,81,0.15)]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#F5C451] mb-2 uppercase tracking-wide">
                    <Shield className="w-4 h-4" /> Privacy Boundary
                  </div>
                  <div className="space-y-1.5 text-xs text-[#C5C2B8]">
                    <div className="font-semibold text-emerald-400">{privacyLevel}</div>
                    <p className="text-[#827C70] text-[11px]">
                      Zero secret leakage. API keys, credentials, and raw environment files are automatically redacted prior to context compilation.
                    </p>
                  </div>
                </Card>
              </div>

              {/* Connected Tools & MCP Servers */}
              <Card className="p-4 bg-[#090A10] border-[rgba(245,196,81,0.15)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#F5C451] uppercase tracking-wide">
                    <Zap className="w-4 h-4" /> Connected MCP Tool Services
                  </div>
                  <span className="text-xs text-[#827C70]">{contextData?.availableTools?.length || 0} installed</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {contextData?.availableTools?.map((t, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#11131F] border border-[#1A1C28] text-xs">
                      <div className="flex items-center justify-between font-semibold text-[#F7F5EF] mb-1">
                        <span>{t.serverName}</span>
                        <StatusBadge variant="gold" label={t.status} />
                      </div>
                      <div className="text-[11px] text-[#827C70]">{t.toolsCount} registered tool functions</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Provider Live Health */}
              <Card className="p-4 bg-[#090A10] border-[rgba(245,196,81,0.15)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#F5C451] uppercase tracking-wide">
                    <Activity className="w-4 h-4" /> Central AI Router Registered Providers
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {contextData?.providerHealth?.map((p, idx) => (
                    <div key={idx} className="p-2 rounded bg-[#11131F] border border-[#1A1C28] flex items-center justify-between">
                      <span className="capitalize">{p.name}</span>
                      <span className={`text-[10px] font-bold ${p.available ? "text-emerald-400" : "text-[#827C70]"}`}>
                        {p.available ? "ONLINE" : "OFFLINE"}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: TASKS & APPROVALS */}
          {activeTab === "TASKS" && (
            <div className="h-full overflow-y-auto space-y-4 pr-1">
              {/* Approvals Section */}
              {approvals.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4 animate-bounce" /> Action Approvals Pending Operator Signature ({approvals.length})
                  </div>
                  {approvals.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl bg-[#141208] border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_4px_20px_rgba(245,196,81,0.08)]"
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-300">{app.actionType}</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                            {app.riskLevel} RISK
                          </span>
                        </div>
                        <p className="text-[#E2E0D8]">{app.description}</p>
                        <div className="text-[11px] text-[#827C70]">Target: <span className="font-mono text-amber-200">{app.targetResource}</span></div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          onClick={() => handleApprovalDecision(app.id, "APPROVE")}
                          variant="primary"
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5"
                        >
                          Approve Action
                        </Button>
                        <Button
                          onClick={() => handleApprovalDecision(app.id, "REJECT")}
                          variant="secondary"
                          size="sm"
                          className="text-red-400 hover:bg-red-950/30 text-xs px-3 py-1.5"
                        >
                          Deny
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tasks Ledger */}
              <Card className="p-4 bg-[#090A10] border-[rgba(245,196,81,0.15)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#F5C451] uppercase tracking-wide">
                    <Terminal className="w-4 h-4" /> Bounded Autonomous Tasks
                  </div>
                  <span className="text-xs text-[#827C70]">{tasks.length} recorded</span>
                </div>
                <div className="space-y-2">
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-lg bg-[#11131F] border border-[#1A1C28] flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-medium text-[#F7F5EF]">{t.title}</div>
                        <div className="text-[11px] text-[#827C70]">{t.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#827C70]">Level {t.autonomyLevel}</span>
                        <StatusBadge
                          variant={
                            t.status === "COMPLETED"
                              ? "gold"
                              : t.status === "RUNNING"
                              ? "online"
                              : "info"
                          }
                          label={t.status}
                        />
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <div className="text-center py-6 text-xs text-[#827C70]">No autonomous tasks run yet</div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 4: MEMORY MANAGER */}
          {activeTab === "MEMORIES" && (
            <div className="h-full flex flex-col min-h-0 space-y-3">
              {/* Memory Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#090A10] border border-[rgba(245,196,81,0.15)] rounded-xl">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#827C70]" />
                  <input
                    type="text"
                    value={memorySearchQuery}
                    onChange={(e) => setMemorySearchQuery(e.target.value)}
                    placeholder="Search memories by keyword..."
                    className="bg-transparent text-xs text-[#F7F5EF] focus:outline-none w-full"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-[#11131F] border border-[#1E2238] rounded px-2.5 py-1.5 text-xs text-[#C5C2B8] focus:outline-none"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="PREFERENCE">Preferences</option>
                    <option value="PROJECT">Projects</option>
                    <option value="TECHNICAL">Technical</option>
                    <option value="DECISION">Decisions</option>
                    <option value="WORKFLOW">Workflows</option>
                    <option value="TEMPORARY">Temporary</option>
                  </select>

                  <Button
                    onClick={() => setIsAddingMemory(true)}
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Memory
                  </Button>

                  <Button
                    onClick={handleExportMemories}
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" /> Export JSON
                  </Button>
                </div>
              </div>

              {/* Add Memory Modal / Box */}
              {isAddingMemory && (
                <div className="p-4 rounded-xl bg-[#11131F] border border-[rgba(245,196,81,0.3)] space-y-3">
                  <div className="text-xs font-bold text-[#F5C451]">Create New Personal Memory</div>
                  <textarea
                    value={newMemoryContent}
                    onChange={(e) => setNewMemoryContent(e.target.value)}
                    placeholder="Enter durable preference, constraint, or fact (e.g. 'Use dark-gold glassmorphism across all dashboards')..."
                    className="w-full bg-[#090A10] border border-[#1E2238] rounded-lg p-2.5 text-xs text-[#F7F5EF] focus:outline-none resize-none h-20"
                  />
                  <div className="flex items-center justify-between">
                    <select
                      value={newMemoryCategory}
                      onChange={(e) => setNewMemoryCategory(e.target.value as any)}
                      className="bg-[#090A10] border border-[#1E2238] rounded px-2.5 py-1 text-xs text-[#C5C2B8]"
                    >
                      <option value="PREFERENCE">Category: Preference</option>
                      <option value="PROJECT">Category: Project</option>
                      <option value="TECHNICAL">Category: Technical</option>
                      <option value="DECISION">Category: Decision</option>
                      <option value="WORKFLOW">Category: Workflow</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => setIsAddingMemory(false)} variant="secondary" size="sm" className="text-xs">
                        Cancel
                      </Button>
                      <Button onClick={handleSaveNewMemory} variant="primary" size="sm" className="text-xs">
                        Save Memory
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Memory List Grid */}
              <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2.5 pr-1">
                {filteredMemories.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl bg-[#090A10] border border-[#1A1C28] hover:border-[rgba(245,196,81,0.3)] transition-all flex flex-col justify-between text-xs space-y-2 group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-[rgba(245,196,81,0.1)] text-[#F5C451] text-[10px] font-bold">
                          {m.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleTogglePinMemory(m.id, m.pinned)}
                            className={`p-1 rounded transition-colors ${
                              m.pinned ? "text-[#F5C451]" : "text-[#827C70] hover:text-[#F7F5EF]"
                            }`}
                            title={m.pinned ? "Unpin memory" : "Pin memory"}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMemory(m.id)}
                            className="p-1 rounded text-[#827C70] hover:text-red-400 transition-colors"
                            title="Delete memory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[#E2E0D8] leading-relaxed">{m.content}</p>
                    </div>

                    <div className="pt-2 border-t border-[#141624] flex items-center justify-between text-[10px] text-[#827C70]">
                      <span>Importance: {m.importance}/5</span>
                      <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {filteredMemories.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-xs text-[#827C70]">
                    No memories found matching filter criteria
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: POLICY & SECURITY */}
          {activeTab === "SECURITY" && (
            <div className="h-full overflow-y-auto space-y-4 pr-1">
              <Card className="p-4 bg-[#090A10] border-[rgba(245,196,81,0.15)]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5C451] uppercase tracking-wide mb-3">
                  <Shield className="w-4 h-4" /> Sovereign Privacy Invariants
                </div>
                <div className="space-y-2 text-xs text-[#C5C2B8] leading-relaxed">
                  <div className="p-3 rounded-lg bg-[#11131F] border border-[#1A1C28]">
                    <div className="font-bold text-[#F7F5EF] mb-1">1. Local-Only Enforcement</div>
                    <p className="text-[#827C70]">
                      When set to <span className="text-emerald-400 font-mono">LOCAL_ONLY</span>, outbound network calls to cloud providers (OpenAI, Gemini, Groq, Nvidia, DeepSeek, OpenRouter) are strictly prohibited at the server level.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#11131F] border border-[#1A1C28]">
                    <div className="font-bold text-[#F7F5EF] mb-1">2. Zero Secret Persistence</div>
                    <p className="text-[#827C70]">
                      All inputs, memories, and traces are passed through <span className="font-mono text-[#F5C451]">HermesPolicy.redactSecrets</span>. API keys, JWT session tokens, and passwords are permanently redacted prior to SQLite persistence.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#11131F] border border-[#1A1C28]">
                    <div className="font-bold text-[#F7F5EF] mb-1">3. Strict Human Approval Gate</div>
                    <p className="text-[#827C70]">
                      No AI model or tool may autonomously write source files, execute arbitrary shell scripts, or mutate production databases without explicit operator cryptographic sign-off.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Tool Execution Matrix */}
              <Card className="p-4 bg-[#090A10] border-[rgba(245,196,81,0.15)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#F5C451] uppercase tracking-wide">
                    <Sliders className="w-4 h-4" /> Tool Permission Matrix
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-[#11131F] border border-[#1A1C28]">
                    <span>Read Sandbox Project Files</span>
                    <span className="text-emerald-400 font-bold text-[10px]">AUTO-AUTHORIZED (Level 0)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[#11131F] border border-[#1A1C28]">
                    <span>Run Unit / Regression Test Suites</span>
                    <span className="text-emerald-400 font-bold text-[10px]">AUTO-AUTHORIZED (Level 3)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[#11131F] border border-[#1A1C28]">
                    <span>Write Sandbox Files</span>
                    <span className="text-amber-400 font-bold text-[10px]">APPROVAL REQUIRED (Level 2)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[#11131F] border border-[#1A1C28]">
                    <span>Promote Code to Production / Git Commit</span>
                    <span className="text-red-400 font-bold text-[10px]">LEVEL 5 OWNER GATE MANDATORY</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
