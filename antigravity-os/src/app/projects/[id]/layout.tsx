"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import {
  FolderKanban,
  FileText,
  Target,
  PenTool,
  Image,
  Database,
  BarChart,
  ChevronLeft,
  BookOpen,
} from "lucide-react";

export default function ProjectWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { id } = use(params);

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProject = async () => {
    try {
      // Use session cookie auth — no localStorage email needed
      const res = await fetch(`/api/omnicraft/projects/${id}`);
      const json = await res.json();
      if (json.success) {
        setProject(json.data);
      } else {
        setErrorMsg(json.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="font-mono text-xs text-slate-400 py-12 text-center animate-pulse">
        ⚙️ LOADING PROJECT WORKSPACE ENGINE...
      </div>
    );
  }

  if (errorMsg || !project) {
    return (
      <div className="font-mono text-center py-12 space-y-4 text-xs">
        <div className="text-red-400 font-bold">PROJECT WORKSPACE REGISTRATION NOT FOUND</div>
        <p className="text-slate-500">{errorMsg || "The requested campaign project ID does not exist in the database."}</p>
        <Button onClick={() => router.push("/projects")} size="sm" variant="secondary">
          Return to Directory
        </Button>
      </div>
    );
  }

  const tabs = [
    { label: "AI Command", href: `/projects/${id}`, icon: FolderKanban },
    { label: "UX Research", href: `/projects/${id}/research`, icon: FileText },
    { label: "Strategy", href: `/projects/${id}/strategy`, icon: Target },
    { label: "Stitch Design", href: `/projects/${id}/design`, icon: PenTool },
    { label: "Media Synth", href: `/projects/${id}/media`, icon: Image },
    { label: "Asset Library", href: `/projects/${id}/assets`, icon: Database },
    { label: "Analytics", href: `/projects/${id}/analytics`, icon: BarChart },
    { label: "Case Study", href: `/projects/${id}/case-study`, icon: BookOpen },
  ];

  return (
    <div className="space-y-6 font-mono text-slate-100">
      {/* Project Header Ribbon */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <Link href="/projects" className="flex items-center gap-1 text-[10px] text-cyber-cyan hover:underline uppercase mb-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Campaign Directory</span>
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span>{project.name.toUpperCase()}</span>
          </h1>
          {project.brief ? (
            <p className="text-xs text-slate-400 line-clamp-1">{project.brief}</p>
          ) : (
            <p className="text-xs text-slate-500">{project.description || "No campaign description specified."}</p>
          )}
        </div>

        <Badge variant="cyan" dot>
          ID: {project.id}
        </Badge>
      </div>

      {/* Workspace Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                isActive
                  ? "bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Workspace Frame */}
      <div className="min-h-[50vh]">{children}</div>
    </div>
  );
}
