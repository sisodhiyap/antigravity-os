"use client";

import React, { useState, useEffect, use } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { Target, Zap, Save, RefreshCw } from "lucide-react";

export default function ProjectStrategyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [strategyText, setStrategyText] = useState("");
  const [goal, setGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProject = async () => {
    try {
      const userStr = typeof window !== "undefined" ? localStorage.getItem("omnicraft_user") : null;
      const email = userStr ? JSON.parse(userStr).email : "";
      const res = await fetch(`/api/omnicraft/projects/${id}?email=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (json.success && json.data.strategyText) {
        setStrategyText(json.data.strategyText);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/omnicraft/chat", {
        method: "POST",
        body: JSON.stringify({
          prompt: `Draft a campaign marketing strategy and positioning strategy for goal: "${goal}". Outline target user personas, jobs-to-be-done, and opportunity channels.`,
          category: "STRATEGY",
          workspaceId: id,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStrategyText(json.data.text || json.data);
      }
    } catch (_) {} finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const userStr = typeof window !== "undefined" ? localStorage.getItem("omnicraft_user") : null;
    const email = userStr ? JSON.parse(userStr).email : "";
    try {
      await fetch(`/api/omnicraft/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ strategyText, email }),
      });
    } catch (_) {} finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 font-mono text-slate-100">
      {/* Strategy creation and text panel */}
      <div className="xl:col-span-2 space-y-5">
        <Card glow="cyan">
          <CardHeader>
            <CardTitle>
              <Zap className="w-4 h-4 text-cyber-cyan" />
              <span>Define Campaign Goal</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="flex gap-2">
              <input
                type="text"
                required
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Double organic user signups across mobile app channels..."
                className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyber-cyan"
              />
              <Button type="submit" disabled={isLoading} className="gap-2">
                <span>{isLoading ? "FORMULATING..." : "FORMULATE"}</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-[400px] flex flex-col">
          <CardHeader className="flex justify-between items-center border-b border-white/5 pb-3">
            <CardTitle className="text-xs">
              <Target className="w-4 h-4 text-cyber-cyan" />
              <span>Brand Strategy & Positioning Hypothesis</span>
            </CardTitle>
            {strategyText && (
              <Button onClick={handleSave} disabled={isSaving} size="sm" variant="primary" className="gap-1.5 py-1 text-[10px]">
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "SAVING..." : "SAVE STRATEGY"}</span>
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 bg-slate-950 text-xs leading-relaxed whitespace-pre-wrap text-slate-300">
            {strategyText ? (
              strategyText
            ) : (
              <div className="text-center py-16 text-slate-500 space-y-2">
                <Target className="w-8 h-8 mx-auto text-slate-700" />
                <p className="text-xs">No strategy draft saved yet.</p>
                <p className="text-[10px] text-slate-600">Enter your campaign goal above to formulate positioning goals and personas.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Guide Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Zap className="w-4 h-4 text-cyber-cyan" />
            <span>Opportunity Alignment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-slate-400">
          <p>
            Campaign strategies establish organization-wide context for your generation workflows.
          </p>
          <p>
            The assistant reviews this strategy dynamically when drafting audio transcripts and video scene descriptions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
