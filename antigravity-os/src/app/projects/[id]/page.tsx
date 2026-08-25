"use client";

import React, { useState, useEffect, use } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Badge";
import { Sparkles, Send, Bot, User, Trash2, Database, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  provider?: string;
  model?: string;
  isError?: boolean;
  persisted?: boolean;
}

export default function ProjectCommandHubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [project, setProject] = useState<any>(null);

  // Load project data + persisted conversation history from DB
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingHistory(true);
      try {
        // Load project details (includes brief, research, strategy context)
        const projRes = await fetch(`/api/omnicraft/projects/${id}`);
        const projJson = await projRes.json();
        if (projJson.success) setProject(projJson.data);

        // Load persisted conversation history from DB
        const histRes = await fetch(`/api/omnicraft/chat?projectId=${encodeURIComponent(id)}`);
        const histJson = await histRes.json();
        if (histJson.success && histJson.data.length > 0) {
          // Flatten all conversations into a single message list (most recent conversation)
          const conversations = histJson.data;
          if (conversations.length > 0) {
            const latestConv = conversations[0];
            const dbMessages: Message[] = latestConv.messages.map((m: any) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
              timestamp: m.createdAt,
              provider: m.provider || undefined,
              model: m.model || undefined,
              persisted: true,
            }));
            setMessages(dbMessages);
          }
        } else {
          // Fallback to localStorage if no DB history (backward compat)
          const saved = localStorage.getItem(`omnicraft_chat_${id}`);
          if (saved) {
            try {
              setMessages(JSON.parse(saved));
            } catch {
              setMessages([]);
            }
          }
        }
      } catch (_) {
        // If unauthenticated, fall back to localStorage
        const saved = localStorage.getItem(`omnicraft_chat_${id}`);
        if (saved) {
          try { setMessages(JSON.parse(saved)); } catch { setMessages([]); }
        }
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadData();
  }, [id]);

  // Mirror messages to localStorage for offline resilience
  const persistMessages = (msgs: Message[]) => {
    setMessages(msgs);
    try {
      localStorage.setItem(`omnicraft_chat_${id}`, JSON.stringify(msgs.slice(-50)));
    } catch {}
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isSending) return;

    const userMsg: Message = {
      role: "user",
      content: prompt,
      timestamp: new Date().toISOString(),
    };
    const newMsgs = [...messages, userMsg];
    persistMessages(newMsgs);
    setPrompt("");
    setIsSending(true);

    try {
      // Include project context in the prompt if available
      const contextualPrompt = project
        ? `[Project: "${project.name}"${project.brief ? `. Brief: ${project.brief.slice(0, 200)}` : ""}]\n\n${prompt}`
        : prompt;

      const res = await fetch("/api/omnicraft/chat", {
        method: "POST",
        body: JSON.stringify({ prompt: contextualPrompt, workspaceId: id }),
      });
      const json = await res.json();

      if (json.success) {
        const botMsg: Message = {
          role: "assistant",
          content: json.data.text || json.data,
          timestamp: new Date().toISOString(),
          provider: json.data.providerMetadata?.provider || "Local",
          model: json.data.providerMetadata?.model || "unknown",
          persisted: true,
        };
        persistMessages([...newMsgs, botMsg]);
      } else {
        const errorMsg: Message = {
          role: "assistant",
          content: `AI Router error: ${json.error}. Check provider configuration or try again.`,
          timestamp: new Date().toISOString(),
          isError: true,
        };
        persistMessages([...newMsgs, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: Message = {
        role: "assistant",
        content: `Connection error: ${err.message}. Verify the AI router is running.`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      persistMessages([...newMsgs, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClear = () => {
    persistMessages([]);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 font-mono text-slate-100">
      {/* AI Conversation Console */}
      <div className="xl:col-span-2 space-y-4">
        <Card className="h-[550px] flex flex-col">
          <CardHeader className="flex flex-row justify-between items-center border-b border-white/5 pb-3">
            <CardTitle className="text-xs">
              <Bot className="w-4 h-4 text-cyber-cyan" />
              <span>Workspace AI Assistant</span>
              {messages.some((m) => m.persisted) && (
                <Badge variant="neon" className="ml-2 text-[9px]">
                  <Database className="w-3 h-3 mr-1" />DB
                </Badge>
              )}
            </CardTitle>
            {messages.length > 0 && (
              <button
                onClick={handleClear}
                className="text-slate-500 hover:text-red-400 transition"
                title="Clear thread"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-950">
            {isLoadingHistory ? (
              <div className="text-center py-16 text-slate-500 text-xs animate-pulse">
                Loading conversation history from database...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16 text-slate-500 space-y-2">
                <Bot className="w-8 h-8 mx-auto text-slate-700" />
                <p className="text-xs">No conversation started yet.</p>
                <p className="text-[10px] text-slate-600">
                  Explain your creative goals to start generating campaign plans, strategies, or content briefs.
                </p>
                {project && (
                  <div className="mt-4 p-3 bg-slate-900 border border-white/5 rounded-lg text-left space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold">Project Brief:</p>
                    <p className="text-[10px] text-slate-500">
                      {project.brief || project.description || "No brief entered yet."}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 text-xs ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role !== "user" && (
                    <div className="w-6 h-6 rounded-lg bg-cyber-cyan/15 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-cyber-cyan" />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-xl max-w-[80%] border ${
                      msg.role === "user"
                        ? "bg-cyber-cyan/10 border-cyber-cyan/20 text-slate-200"
                        : msg.isError
                        ? "bg-red-950/20 border-red-500/20 text-red-400"
                        : "bg-slate-900 border-white/5 text-slate-300"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === "assistant" && (msg.provider || msg.model) && (
                      <span className="text-[9px] text-slate-500 block mt-2 text-right">
                        {msg.provider} / {msg.model}
                      </span>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-6 h-6 rounded-lg bg-cyber-purple/15 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-cyber-purple" />
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>

          <div className="p-3 border-t border-white/5 bg-slate-950">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask to outline strategy, draft copy, define personas, or plan campaign..."
                className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyber-cyan"
              />
              <Button type="submit" disabled={isSending} className="px-4">
                {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {/* Project Context Panel */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Sparkles className="w-4 h-4 text-cyber-cyan" />
            <span>Workspace Context</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-xs">
          {project && (
            <div className="space-y-3">
              {project.brief && (
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Project Brief</span>
                  <p className="text-slate-400 text-[10px] bg-slate-950 p-2 rounded border border-white/5 line-clamp-4">
                    {project.brief}
                  </p>
                </div>
              )}

              {project.researchText && (
                <div className="space-y-1">
                  <span className="text-emerald-400 text-[10px] uppercase font-bold">✓ Research Saved</span>
                  <p className="text-slate-500 text-[10px] line-clamp-3">{project.researchText}</p>
                </div>
              )}

              {project.strategyText && (
                <div className="space-y-1">
                  <span className="text-cyber-cyan text-[10px] uppercase font-bold">✓ Strategy Saved</span>
                  <p className="text-slate-500 text-[10px] line-clamp-3">{project.strategyText}</p>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-white/5 pt-4 space-y-3">
            <p className="text-slate-400 text-[10px] font-bold uppercase">Workflow Steps</p>
            {[
              { n: "1", label: "UX Research", done: !!project?.researchText },
              { n: "2", label: "Strategy", done: !!project?.strategyText },
              { n: "3", label: "Design System", done: false },
              { n: "4", label: "Media Synth", done: false },
            ].map((step) => (
              <div key={step.n} className="flex items-center gap-2 text-[10px]">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 text-[9px] font-bold ${
                    step.done
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-900 text-slate-500 border border-white/5"
                  }`}
                >
                  {step.done ? "✓" : step.n}
                </div>
                <span className={step.done ? "text-emerald-400" : "text-slate-500"}>{step.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
