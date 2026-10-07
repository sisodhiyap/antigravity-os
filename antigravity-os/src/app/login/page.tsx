"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  Shield,
  Cpu,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/DesignSystem";

/** Prevent open redirect — only allow internal relative paths */
function sanitizeCallbackUrl(url: string | null): string {
  if (!url) return "/";
  const trimmed = url.trim();
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("/\\") &&
    !trimmed.includes(":")
  ) {
    return trimmed;
  }
  return "/";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeCallbackUrl(searchParams.get("callbackUrl"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);

  // Lockout countdown
  useEffect(() => {
    if (!lockoutSeconds || lockoutSeconds <= 0) return;
    const t = setInterval(() => setLockoutSeconds((p) => (p && p > 1 ? p - 1 : null)), 1000);
    return () => clearInterval(t);
  }, [lockoutSeconds]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading || lockoutSeconds) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/omnicraft/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.status === 429) {
        const retry = data.retryAfter ?? 60;
        setLockoutSeconds(retry);
        setErrorMsg(`Too many attempts. Try again in ${retry}s.`);
        return;
      }

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Invalid email or password.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setErrorMsg("Connection error. Please check your network.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Error Banner */}
      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-3 p-3.5 rounded-lg bg-[var(--ag-error-bg)] border border-[var(--ag-error)]/25 text-[var(--ag-error)] text-sm animate-[fade-in_0.25s_ease-out]"
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-[11px] font-semibold uppercase tracking-widest text-[var(--ag-muted)]">
          Email
        </label>
        <div className="relative flex items-center">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ag-muted)] pointer-events-none z-10" aria-hidden="true" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operator@workspace.ai"
            className="ag-input !pl-10"
            style={{ paddingLeft: "2.5rem" }}
            aria-label="Email address"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-[11px] font-semibold uppercase tracking-widest text-[var(--ag-muted)]">
          Password
        </label>
        <div className="relative flex items-center">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ag-muted)] pointer-events-none z-10" aria-hidden="true" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="ag-input !pl-10 !pr-11"
            style={{ paddingLeft: "2.5rem", paddingRight: "2.75rem" }}
            aria-label="Password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--ag-muted)] hover:text-[var(--ag-text-sec)] transition-colors z-10"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* CTA */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isLoading}
        disabled={!email || !password || !!lockoutSeconds}
        iconRight={<ArrowRight className="w-4 h-4" />}
        className="mt-2"
      >
        {lockoutSeconds ? `Locked — ${lockoutSeconds}s` : "Enter Workspace"}
      </Button>

      {/* Secondary */}
      <div className="text-center pt-1">
        <span className="text-[12px] text-[var(--ag-muted)]">New operator? </span>
        <Link
          href="/signup"
          className="text-[12px] text-[var(--ag-gold)] hover:text-[var(--ag-gold-bright)] font-semibold transition-colors"
        >
          Create account →
        </Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--ag-bg)]">
      {/* ── LEFT — Hero Image (desktop) ──────────────────────────── */}
      <div className="hidden md:block md:w-[55%] relative min-h-screen sticky top-0 overflow-hidden">
        <Image
          src="/assets/login-hero.jpg"
          alt="Antigravity OS AI Command Center"
          fill
          priority
          className="object-cover object-center"
          sizes="55vw"
        />
        {/* Gradient overlay — integrates image into dark UI */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,11,10,0.0)_0%,rgba(11,11,10,0.3)_60%,rgba(11,11,10,0.97)_100%)]" />
        {/* Bottom caption */}
        <div className="absolute bottom-8 left-8 right-16 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ag-gold)] opacity-80">
            Antigravity OS v5.2
          </p>
          <p className="text-[13px] text-[var(--ag-text-sec)] leading-relaxed max-w-sm">
            Sovereign AI infrastructure running entirely on your machine.
          </p>
        </div>
      </div>

      {/* ── Mobile Hero ───────────────────────────────────────────── */}
      <div className="md:hidden relative h-48 overflow-hidden shrink-0">
        <Image
          src="/assets/login-hero.jpg"
          alt="Antigravity OS AI Command Center"
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,10,0.2)_0%,rgba(11,11,10,0.95)_100%)]" />
        <div className="absolute bottom-4 left-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ag-gold)]">
            Antigravity OS v5.2
          </p>
        </div>
      </div>

      {/* ── RIGHT — Login Panel ───────────────────────────────────── */}
      <div className="flex-1 md:w-[45%] flex flex-col min-h-screen overflow-y-auto">
        <div className="flex-1 flex flex-col justify-start md:justify-center px-6 sm:px-10 md:px-12 lg:px-16 py-8 md:py-12 max-w-md w-full mx-auto md:mx-0">
          {/* Theme toggle */}
          <div className="flex justify-end mb-4 md:mb-6">
            <Suspense>
              <ThemeToggle />
            </Suspense>
          </div>

          {/* Wordmark */}
          <div className="mb-8 space-y-2">
            <div className="flex items-center gap-3">
              {/* Logo mark */}
              <div className="w-10 h-10 rounded-xl bg-[var(--ag-gold-alpha)] border border-[var(--ag-gold)]/30 flex items-center justify-center shadow-[var(--ag-shadow-gold)]">
                <Cpu className="w-5 h-5 text-[var(--ag-gold)]" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-widest text-[var(--ag-text)] uppercase font-satoshi">
                  Antigravity <span className="text-[var(--ag-gold)]">OS</span>
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--ag-muted)] font-semibold">
                  Sovereign AI Workspace
                </p>
              </div>
            </div>

            <div className="pt-4">
              <h2 className="text-xl font-bold text-[var(--ag-text)] font-satoshi">
                Operator Sign In
              </h2>
              <p className="text-[13px] text-[var(--ag-text-sec)] mt-1">
                Authentication required to access the command center.
              </p>
            </div>
          </div>

          {/* Form */}
          <Suspense fallback={<div className="h-48 ag-shimmer rounded-xl" />}>
            <LoginForm />
          </Suspense>

          {/* Security Status */}
          <div className="mt-8 pt-6 border-t border-[var(--ag-border)]">
            <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--ag-muted)] mb-3 font-semibold">
              Session Security
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: <Shield className="w-3 h-3" />, label: "Secure Session" },
                { icon: <WifiOff className="w-3 h-3" />, label: "Local-First" },
                { icon: <Lock className="w-3 h-3" />, label: "PBKDF2-SHA512" },
              ].map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--ag-elevated)] border border-[var(--ag-border)] text-[10px] font-medium text-[var(--ag-muted)]"
                >
                  <span className="text-[var(--ag-gold)] opacity-70" aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Version */}
          <p className="mt-6 text-[10px] text-[var(--ag-muted)] opacity-50">
            Antigravity OS v5.2 · LOCAL-FIRST · CLOUD OFF
          </p>
        </div>
      </div>
    </div>
  );
}
