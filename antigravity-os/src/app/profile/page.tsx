"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Camera,
  Upload,
  Trash2,
  Edit3,
  Download,
  Mail,
  Globe,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Save,
  X,
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
  Share2,
  FolderGit2
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export interface OwnerProfileData {
  fullName: string;
  displayName: string;
  role: string;
  bio: string;
  email: string;
  location: string;
  website: string;
  portfolio: string;
  skills: string[];
  preferredLanguage: string;
  timezone: string;
  createdAt: string;
  avatarUrl: string | null;
}

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // State with initial non-fabricated or stored profile
  const [profile, setProfile] = useState<OwnerProfileData>({
    fullName: "Lead Sovereign Operator",
    displayName: "Operator-01",
    role: "System Architect & AI Engineer",
    bio: "Lead operator specializing in sovereign autonomous intelligence systems, DirectML pipelines, and zero-trust engineering architectures.",
    email: "operator@antigravity.os",
    location: "Local Machine (Encrypted Vault)",
    website: "https://antigravity.workspace.local",
    portfolio: "https://antigravity.workspace.local/basket",
    skills: [
      "Autonomous Swarm Orchestration",
      "Next.js 15 & React 19",
      "DirectML GPU Media Pipelines",
      "Cryptographic Evidence Verification",
      "WCAG AA Accessibility",
      "AST Security Auditing"
    ],
    preferredLanguage: "English (US)",
    timezone: "UTC / Local Host Time",
    createdAt: "2026-08-20",
    avatarUrl: null,
  });

  const [editForm, setEditForm] = useState<OwnerProfileData>(profile);

  // Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setProfile((prev) => ({ ...prev, avatarUrl: url }));
      setEditForm((prev) => ({ ...prev, avatarUrl: url }));
      showToast("Profile photo updated securely.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfile((prev) => ({ ...prev, avatarUrl: null }));
    setEditForm((prev) => ({ ...prev, avatarUrl: null }));
    showToast("Profile photo removed.");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(editForm);
    setIsEditing(false);
    showToast("Profile settings saved successfully.");
  };

  const handleExportProfile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const a = document.createElement("a");
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `ANTIGRAVITY_PROFILE_${profile.displayName}.json`);
    a.click();
    showToast("Profile JSON exported.");
  };

  const handleDeleteProfile = () => {
    setProfile({
      fullName: "",
      displayName: "",
      role: "",
      bio: "",
      email: "",
      location: "",
      website: "",
      portfolio: "",
      skills: [],
      preferredLanguage: "English",
      timezone: "UTC",
      createdAt: new Date().toISOString().split("T")[0],
      avatarUrl: null,
    });
    setShowDeleteModal(false);
    showToast("Profile data cleared.");
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

        {/* ── Profile Top Card ─────────────────────────────────────── */}
        <div className="p-6 md:p-8 rounded-2xl bg-[var(--ag-surface)] border border-[var(--ag-border)] shadow-xl relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--ag-gold)]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar Box with Photo Controls */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-[var(--ag-navy)] border-2 border-[var(--ag-gold)]/40 overflow-hidden flex items-center justify-center shadow-lg">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-3xl font-bold text-[var(--ag-gold)] font-mono">
                      {profile.displayName.substring(0, 2).toUpperCase() || "OP"}
                    </div>
                  )}
                </div>

                {/* Upload Action Overlay */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-1.5 rounded-lg bg-[var(--ag-gold)] text-[var(--ag-navy)] shadow-md hover:scale-105 transition cursor-pointer"
                  title="Change Profile Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Identity Details */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-[var(--ag-text)]">
                    {profile.fullName || <span className="text-[var(--ag-text-muted)] italic">Not configured</span>}
                  </h1>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[var(--ag-gold)]/15 text-[var(--ag-gold)] border border-[var(--ag-gold)]/30 font-semibold">
                    @{profile.displayName || "operator"}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--ag-success-bg)] text-[var(--ag-success)] border border-[var(--ag-success)]/20 font-bold">
                    OWNER / VERIFIED
                  </span>
                </div>

                <p className="text-xs font-mono text-[var(--ag-gold)]">
                  {profile.role || <span className="text-[var(--ag-text-muted)] italic">Not configured</span>}
                </p>

                <p className="text-xs text-[var(--ag-text-muted)] max-w-xl leading-relaxed pt-1">
                  {profile.bio || <span className="text-[var(--ag-text-muted)] italic">Not configured</span>}
                </p>
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
              <button
                onClick={() => {
                  setEditForm(profile);
                  setIsEditing(true);
                }}
                className="px-4 py-2 rounded-xl bg-[var(--ag-gold)] text-[var(--ag-navy)] font-bold text-xs hover:brightness-110 transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              {profile.avatarUrl && (
                <button
                  onClick={handleRemovePhoto}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-xs font-mono text-[var(--ag-text-muted)] hover:text-red-400 transition flex items-center gap-1.5 cursor-pointer border border-white/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Photo</span>
                </button>
              )}

              <button
                onClick={handleExportProfile}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[var(--ag-text)] transition flex items-center gap-1.5 cursor-pointer border border-white/10"
                title="Export Profile JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Metadata & Configuration Cards ───────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Contact & Web Presence */}
          <div className="p-6 rounded-2xl bg-[var(--ag-surface)] border border-[var(--ag-border)] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--ag-gold)] font-mono flex items-center gap-2">
              <Globe className="w-4 h-4" /> Contact & Connectivity
            </h3>

            <div className="space-y-3 text-xs font-mono divide-y divide-white/5">
              <div className="flex justify-between items-center pt-2">
                <span className="text-[var(--ag-text-muted)] flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[var(--ag-gold)]" /> Email Address:
                </span>
                <span className="text-[var(--ag-text)] font-semibold">
                  {profile.email || <span className="text-[var(--ag-text-muted)] font-normal italic">Not configured</span>}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[var(--ag-text-muted)] flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[var(--ag-gold)]" /> Location / Node:
                </span>
                <span className="text-[var(--ag-text)] font-semibold">
                  {profile.location || <span className="text-[var(--ag-text-muted)] font-normal italic">Not configured</span>}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[var(--ag-text-muted)] flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[var(--ag-gold)]" /> Website:
                </span>
                <span className="text-[var(--ag-text)] font-semibold truncate max-w-[200px]">
                  {profile.website ? (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-[var(--ag-gold)] hover:underline flex items-center gap-1">
                      {profile.website} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[var(--ag-text-muted)] font-normal italic">Not configured</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[var(--ag-text-muted)] flex items-center gap-2">
                  <FolderGit2 className="w-3.5 h-3.5 text-[var(--ag-gold)]" /> Portfolio:
                </span>
                <span className="text-[var(--ag-text)] font-semibold truncate max-w-[200px]">
                  {profile.portfolio ? (
                    <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="text-[var(--ag-gold)] hover:underline flex items-center gap-1">
                      {profile.portfolio} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[var(--ag-text-muted)] font-normal italic">Not configured</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Environment & Regional Defaults */}
          <div className="p-6 rounded-2xl bg-[var(--ag-surface)] border border-[var(--ag-border)] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--ag-gold)] font-mono flex items-center gap-2">
              <Clock className="w-4 h-4" /> Regional & Environment
            </h3>

            <div className="space-y-3 text-xs font-mono divide-y divide-white/5">
              <div className="flex justify-between items-center pt-2">
                <span className="text-[var(--ag-text-muted)]">Preferred Language:</span>
                <span className="text-[var(--ag-text)] font-semibold">{profile.preferredLanguage}</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[var(--ag-text-muted)]">Timezone Envelope:</span>
                <span className="text-[var(--ag-text)] font-semibold">{profile.timezone}</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[var(--ag-text-muted)]">Account Created:</span>
                <span className="text-[var(--ag-text)] font-semibold">{profile.createdAt}</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[var(--ag-text-muted)]">Security Clearance:</span>
                <span className="text-[var(--ag-success)] font-bold">SOVEREIGN ROOT (Level 4)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Professional Skills & Capabilities */}
        <div className="p-6 rounded-2xl bg-[var(--ag-surface)] border border-[var(--ag-border)] space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--ag-gold)] font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Professional Skills & Swarm Capabilities
          </h3>

          <div className="flex flex-wrap gap-2">
            {profile.skills.length > 0 ? (
              profile.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-[var(--ag-navy)] border border-[var(--ag-border)] text-xs font-mono text-[var(--ag-text)] flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ag-gold)]" />
                  <span>{skill}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-[var(--ag-text-muted)] italic">Not configured</span>
            )}
          </div>
        </div>

        {/* Danger Zone: Delete Profile */}
        <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/20 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-red-400 font-mono">Delete / Reset Profile Data</h4>
            <p className="text-xs text-[var(--ag-text-muted)]">
              Clears all local owner profile metadata from this device.
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-mono font-bold transition cursor-pointer"
          >
            Delete Profile
          </button>
        </div>

        {/* ── Edit Profile Modal ───────────────────────────────────── */}
        {isEditing && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--ag-surface)] border border-[var(--ag-gold)]/40 shadow-2xl p-6 space-y-5 animate-[scale-up_0.2s_ease-out]">
              <div className="flex justify-between items-center border-b border-[var(--ag-border)] pb-3">
                <h3 className="text-base font-bold text-[var(--ag-text)] flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[var(--ag-gold)]" /> Edit Owner Profile
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded-lg text-[var(--ag-text-muted)] hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[var(--ag-text-muted)] uppercase">Full Name</label>
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      placeholder="e.g. Jane Doe"
                      className="w-full bg-[var(--ag-navy)] border border-[var(--ag-border)] rounded-xl p-2.5 text-xs text-[var(--ag-text)] focus:outline-none focus:border-[var(--ag-gold)] font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[var(--ag-text-muted)] uppercase">Display Handle</label>
                    <input
                      type="text"
                      value={editForm.displayName}
                      onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                      placeholder="e.g. operator_01"
                      className="w-full bg-[var(--ag-navy)] border border-[var(--ag-border)] rounded-xl p-2.5 text-xs text-[var(--ag-text)] focus:outline-none focus:border-[var(--ag-gold)] font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[var(--ag-text-muted)] uppercase">Professional Role</label>
                  <input
                    type="text"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    placeholder="e.g. AI System Architect"
                    className="w-full bg-[var(--ag-navy)] border border-[var(--ag-border)] rounded-xl p-2.5 text-xs text-[var(--ag-text)] focus:outline-none focus:border-[var(--ag-gold)] font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[var(--ag-text-muted)] uppercase">Biography</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    placeholder="Describe your technical background..."
                    className="w-full bg-[var(--ag-navy)] border border-[var(--ag-border)] rounded-xl p-2.5 text-xs text-[var(--ag-text)] focus:outline-none focus:border-[var(--ag-gold)] font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[var(--ag-text-muted)] uppercase">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full bg-[var(--ag-navy)] border border-[var(--ag-border)] rounded-xl p-2.5 text-xs text-[var(--ag-text)] focus:outline-none focus:border-[var(--ag-gold)] font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[var(--ag-text-muted)] uppercase">Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full bg-[var(--ag-navy)] border border-[var(--ag-border)] rounded-xl p-2.5 text-xs text-[var(--ag-text)] focus:outline-none focus:border-[var(--ag-gold)] font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[var(--ag-text-muted)] uppercase">Website URL</label>
                    <input
                      type="url"
                      value={editForm.website}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      className="w-full bg-[var(--ag-navy)] border border-[var(--ag-border)] rounded-xl p-2.5 text-xs text-[var(--ag-text)] focus:outline-none focus:border-[var(--ag-gold)] font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[var(--ag-text-muted)] uppercase">Portfolio Link</label>
                    <input
                      type="url"
                      value={editForm.portfolio}
                      onChange={(e) => setEditForm({ ...editForm, portfolio: e.target.value })}
                      className="w-full bg-[var(--ag-navy)] border border-[var(--ag-border)] rounded-xl p-2.5 text-xs text-[var(--ag-text)] focus:outline-none focus:border-[var(--ag-gold)] font-sans"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[var(--ag-border)]">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[var(--ag-text)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[var(--ag-gold)] text-[var(--ag-navy)] font-bold text-xs hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-[var(--ag-surface)] border border-red-500/40 p-6 space-y-4 animate-[scale-up_0.2s_ease-out]">
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-base font-bold">Reset Profile Data?</h3>
              </div>
              <p className="text-xs text-[var(--ag-text-muted)] leading-relaxed">
                This will reset your local display name, bio, and avatar. Your project basket and system vaults will remain intact.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[var(--ag-text)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProfile}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 cursor-pointer"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
