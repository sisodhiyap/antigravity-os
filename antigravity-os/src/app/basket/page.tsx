"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderPlus,
  Search,
  Grid,
  List,
  Filter,
  Download,
  Trash2,
  ExternalLink,
  Layers,
  Globe,
  Smartphone,
  Sparkles,
  Database,
  Archive,
  CheckCircle2,
  Clock,
  Tag,
  Copy,
  ChevronRight,
  ChevronDown,
  Eye,
  FileText,
  Code,
  ShieldCheck,
  Plus,
  Play,
  ArrowUpRight
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { UniversalOperator } from "@/components/operator/UniversalOperator";

export interface BasketProject {
  id: string;
  name: string;
  category: "PRESENTATIONS" | "WEBSITES" | "APPLICATIONS" | "MOBILE" | "CREATIVE" | "EXPERIMENTS" | "ARCHIVED";
  description: string;
  techStack: string;
  slideCount?: number;
  hashSha256: string;
  status: "VERIFIED" | "SEALED" | "DRAFT" | "READY";
  createdAt: string;
  tags: string[];
  launchUrl: string;
}

export default function ProjectBasketPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"GRID" | "TREE">("GRID");
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [projects, setProjects] = useState<BasketProject[]>([
    // PRESENTATIONS
    {
      id: "PRJ_PRES_01",
      name: "Sovereign AI Architecture Vision",
      category: "PRESENTATIONS",
      description: "12-slide executive presentation covering zero-leak model routing and local hardware telemetry.",
      techStack: "PresentX 21-Engine • OpenXML PPTX",
      slideCount: 12,
      hashSha256: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      status: "SEALED",
      createdAt: "Today, 14:15",
      tags: ["Executive", "AI Governance", "Gamma-Style"],
      launchUrl: "/presentx",
    },
    {
      id: "PRJ_PRES_02",
      name: "Creative AI Studio Pitch Deck",
      category: "PRESENTATIONS",
      description: "8-slide investor pitch deck with ARR metrics, unit economics, and defensive technical moats.",
      techStack: "PresentX 21-Engine • Single-file HTML",
      slideCount: 8,
      hashSha256: "sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
      status: "VERIFIED",
      createdAt: "Yesterday",
      tags: ["Fundraising", "Series A", "Design"],
      launchUrl: "/presentx",
    },
    // WEBSITES
    {
      id: "PRJ_WEB_01",
      name: "FutureMind Enterprise Landing Page",
      category: "WEBSITES",
      description: "High-conversion responsive landing page with animated hero, dark gold theme, and WCAG AA contrast.",
      techStack: "Next.js 15 • React 19 • Tailwind CSS",
      hashSha256: "sha256:7d793037a0760186574b0282f2f435e7b1e7a6acc941e074d6e2434b02d13488",
      status: "VERIFIED",
      createdAt: "Today, 11:30",
      tags: ["Landing Page", "Dark Luxe", "PWA"],
      launchUrl: "/dashboard",
    },
    {
      id: "PRJ_WEB_02",
      name: "Autonomous Portfolio & Showcase",
      category: "WEBSITES",
      description: "Interactive portfolio featuring DirectML media renders, case study inspector, and contact API.",
      techStack: "Next.js 15 • Three.js • SQLite",
      hashSha256: "sha256:c22b5f9178342609428d6f51b2c5af4c0bde6a42bb0f33989c72e2db45e9988a",
      status: "READY",
      createdAt: "2 days ago",
      tags: ["Portfolio", "Creative", "3D"],
      launchUrl: "/dashboard",
    },
    // APPLICATIONS
    {
      id: "PRJ_APP_01",
      name: "Fintech SaaS Analytics Console",
      category: "APPLICATIONS",
      description: "Complete full-stack dashboard with real-time portfolio charts, user permissions, and SQLite vault.",
      techStack: "Next.js 15 • TanStack Query • SQLite • Prisma",
      hashSha256: "sha256:8f48a1c9e83b2a5d7c9f1e0b3d6a9c8e7b4a2f1d5e8c3b6a9f2e1d4c7b0a3f6e",
      status: "SEALED",
      createdAt: "3 days ago",
      tags: ["SaaS", "Full-Stack", "Fintech"],
      launchUrl: "/dashboard",
    },
    // MOBILE
    {
      id: "PRJ_MOB_01",
      name: "TradeX Mobile Operator PWA",
      category: "MOBILE",
      description: "Offline-first mobile PWA optimized for 375px native viewports with touch controls and bio-auth.",
      techStack: "React 19 • PWA Manifest • Local Storage Sync",
      hashSha256: "sha256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      status: "VERIFIED",
      createdAt: "4 days ago",
      tags: ["Mobile", "PWA", "Offline-First"],
      launchUrl: "/dashboard",
    },
    // CREATIVE
    {
      id: "PRJ_CRE_01",
      name: "VFX Production DirectML Assets",
      category: "CREATIVE",
      description: "Collection of hardware-accelerated ComfyUI diffusion renders and 3D glTF viewport models.",
      techStack: "ComfyUI Pipeline • DirectML GPU • glTF",
      hashSha256: "sha256:9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e",
      status: "READY",
      createdAt: "5 days ago",
      tags: ["ComfyUI", "DirectML", "VFX"],
      launchUrl: "/media",
    },
  ]);

  // Categories config
  const categories = [
    { id: "ALL", label: "All Projects", count: projects.length, icon: FolderPlus },
    { id: "PRESENTATIONS", label: "Presentations", count: projects.filter(p => p.category === "PRESENTATIONS").length, icon: Layers },
    { id: "WEBSITES", label: "Websites", count: projects.filter(p => p.category === "WEBSITES").length, icon: Globe },
    { id: "APPLICATIONS", label: "Applications", count: projects.filter(p => p.category === "APPLICATIONS").length, icon: Code },
    { id: "MOBILE", label: "Mobile PWA", count: projects.filter(p => p.category === "MOBILE").length, icon: Smartphone },
    { id: "CREATIVE", label: "Creative & VFX", count: projects.filter(p => p.category === "CREATIVE").length, icon: Sparkles },
    { id: "EXPERIMENTS", label: "Experiments", count: projects.filter(p => p.category === "EXPERIMENTS").length, icon: Database },
    { id: "ARCHIVED", label: "Archived", count: projects.filter(p => p.category === "ARCHIVED").length, icon: Archive },
  ];

  // Filtered project list
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchCat = selectedCategory === "ALL" || p.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [projects, selectedCategory, searchQuery]);

  // Actions
  const handleDeleteProject = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the Project Basket?`)) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      showToast(`Project "${name}" removed.`);
    }
  };

  const handleExportProject = (project: BasketProject) => {
    const manifest = {
      project: project.name,
      id: project.id,
      category: project.category,
      techStack: project.techStack,
      integrityHash: project.hashSha256,
      exportedAt: new Date().toISOString(),
      governance: "V7 Sovereign Immutable Sealed",
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, "_")}_V7_MANIFEST.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported "${project.name}" sealed JSON manifest.`);
  };

  const handleExportAllBasket = () => {
    const basketExport = {
      basket: "Antigravity OS V7 Project Basket",
      exportedAt: new Date().toISOString(),
      totalProjects: projects.length,
      categories: categories.map(c => ({ category: c.id, count: c.count })),
      manifests: projects,
    };
    const blob = new Blob([JSON.stringify(basketExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `V7_PROJECT_BASKET_FULL_ARCHIVE_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Complete Project Basket archive exported successfully.");
  };

  return (
    <AppShell>
      <div className="space-y-8 select-none font-sans pb-16">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[var(--ag-surface)] border border-[var(--ag-gold)] text-[var(--ag-gold)] text-xs font-mono shadow-2xl flex items-center gap-2 animate-[slide-up_0.2s_ease-out]">
            <CheckCircle2 className="w-4 h-4 text-[var(--ag-gold)]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ── Top Header Banner ─────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-[var(--ag-border)]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--ag-gold)] font-bold mb-1">
              <FolderPlus className="w-4 h-4" />
              <span>CENTRAL V7 REPOSITORY • NEVER UNSTRUCTURED</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--ag-text)]">
              Project Basket
            </h1>
            <p className="text-xs text-[var(--ag-text-muted)] mt-1 max-w-2xl leading-relaxed">
              The single authoritative repository for all sovereign presentations, web applications, mobile PWAs, and creative direct media generated by Antigravity OS V7.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowOperatorModal((v) => !v)}
              className="px-4 py-2.5 rounded-xl bg-[var(--ag-gold)] text-[var(--ag-navy)] font-bold text-xs hover:brightness-110 transition shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create with Universal Operator</span>
            </button>

            <button
              onClick={handleExportAllBasket}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[var(--ag-text)] transition flex items-center gap-1.5 cursor-pointer border border-white/10"
              title="Export Complete Basket Archive"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All</span>
            </button>
          </div>
        </div>

        {/* Universal Operator Drawer (when toggled) */}
        {showOperatorModal && (
          <div className="p-6 rounded-2xl bg-[var(--ag-surface)] border border-[var(--ag-gold)]/40 shadow-2xl relative animate-[scale-up_0.2s_ease-out]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold font-mono text-[var(--ag-gold)] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> New Autonomous Project Synthesis
              </h3>
              <button
                onClick={() => setShowOperatorModal(false)}
                className="text-xs text-[var(--ag-text-muted)] hover:text-white px-2 py-1 rounded bg-white/5"
              >
                Close
              </button>
            </div>
            <UniversalOperator />
          </div>
        )}

        {/* ── Category Folders Navigation Bar ──────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--ag-border)]">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition flex items-center gap-2 shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[var(--ag-gold)]/15 text-[var(--ag-gold)] border border-[var(--ag-gold)]/40 font-bold shadow-sm"
                    : "text-[var(--ag-text-muted)] hover:text-[var(--ag-text)] hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[var(--ag-gold)]" : "text-[var(--ag-text-muted)]"}`} />
                <span>{cat.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-mono">
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Search & View Mode Bar ───────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ag-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name, tech stack, or tags..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded-xl text-[var(--ag-text)] focus:outline-none focus:border-[var(--ag-gold)] font-sans"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[var(--ag-text-muted)]">
              Showing {filteredProjects.length} projects
            </span>
            <div className="flex items-center rounded-xl bg-[var(--ag-surface)] border border-[var(--ag-border)] p-1">
              <button
                onClick={() => setViewMode("GRID")}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  viewMode === "GRID" ? "bg-[var(--ag-gold)] text-[var(--ag-navy)] font-bold" : "text-[var(--ag-text-muted)] hover:text-white"
                }`}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("TREE")}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  viewMode === "TREE" ? "bg-[var(--ag-gold)] text-[var(--ag-navy)] font-bold" : "text-[var(--ag-text-muted)] hover:text-white"
                }`}
                title="Tree / List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Projects Display ─────────────────────────────────────── */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[var(--ag-surface)] border border-[var(--ag-border)] space-y-3">
            <FolderPlus className="w-12 h-12 mx-auto text-[var(--ag-text-muted)]/40" />
            <h3 className="text-base font-bold text-[var(--ag-text)]">No projects found</h3>
            <p className="text-xs text-[var(--ag-text-muted)] max-w-sm mx-auto">
              No artifacts match your search filter. Use the Universal Operator to synthesize a new project.
            </p>
            <button
              onClick={() => setShowOperatorModal(true)}
              className="px-4 py-2 rounded-xl bg-[var(--ag-gold)] text-[var(--ag-navy)] font-bold text-xs hover:brightness-110 transition cursor-pointer inline-flex items-center gap-1.5 mt-2"
            >
              <Sparkles className="w-3.5 h-3.5" /> Generate First Project
            </button>
          </div>
        ) : viewMode === "GRID" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((prj) => (
              <div
                key={prj.id}
                className="p-5 rounded-2xl bg-[var(--ag-surface)] border border-[var(--ag-border)] hover:border-[var(--ag-gold)]/50 transition flex flex-col justify-between space-y-4 group shadow-md"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[var(--ag-gold)]/15 text-[var(--ag-gold)] border border-[var(--ag-gold)]/30">
                      {prj.category}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                        prj.status === "SEALED" || prj.status === "VERIFIED"
                          ? "bg-[var(--ag-success-bg)] text-[var(--ag-success)]"
                          : "bg-white/5 text-[var(--ag-text-muted)]"
                      }`}
                    >
                      {prj.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[var(--ag-text)] group-hover:text-[var(--ag-gold)] transition">
                    {prj.name}
                  </h3>
                  <p className="text-xs text-[var(--ag-text-muted)] leading-relaxed line-clamp-2">
                    {prj.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {prj.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-[var(--ag-text-muted)]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-[var(--ag-border)] text-xs font-mono">
                  <div className="flex justify-between items-center text-[11px] text-[var(--ag-text-muted)]">
                    <span className="truncate max-w-[180px]">{prj.techStack}</span>
                    <span>{prj.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={prj.launchUrl}
                      className="flex-1 py-2 text-center text-xs font-bold rounded-xl bg-[var(--ag-gold)] text-[var(--ag-navy)] hover:brightness-110 transition flex items-center justify-center gap-1.5"
                    >
                      <span>Open Workspace</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => handleExportProject(prj)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--ag-text-muted)] hover:text-white transition cursor-pointer"
                      title="Export Manifest"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteProject(prj.id, prj.name)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-[var(--ag-text-muted)] hover:text-red-400 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tree / List View */
          <div className="rounded-2xl border border-[var(--ag-border)] bg-[var(--ag-surface)] divide-y divide-[var(--ag-border)] overflow-hidden">
            {filteredProjects.map((prj) => (
              <div
                key={prj.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--ag-gold)]/10 text-[var(--ag-gold)] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--ag-text)]">{prj.name}</h4>
                    <p className="text-[11px] text-[var(--ag-text-muted)] truncate max-w-md">{prj.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--ag-gold)]/10 text-[var(--ag-gold)]">
                    {prj.category}
                  </span>
                  <span className="text-[10px] text-[var(--ag-success)] font-bold">{prj.status}</span>
                  <span className="text-[10px] text-[var(--ag-text-muted)]">{prj.createdAt}</span>

                  <Link
                    href={prj.launchUrl}
                    className="px-3 py-1.5 rounded-lg bg-[var(--ag-gold)] text-[var(--ag-navy)] font-bold text-xs hover:brightness-110 transition"
                  >
                    Open
                  </Link>

                  <button
                    onClick={() => handleExportProject(prj)}
                    className="p-1.5 rounded hover:bg-white/10 text-[var(--ag-text-muted)]"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteProject(prj.id, prj.name)}
                    className="p-1.5 rounded hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
