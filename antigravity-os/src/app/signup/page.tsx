"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Lock, Mail, Eye, EyeOff, AlertTriangle, ArrowRight,
  CheckCircle2, XCircle, Shield, UserCheck, Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/DesignSystem";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const criteria = useMemo(() => ({
    length:     password.length >= 8,
    lowerUpper: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number:     /[0-9]/.test(password),
    symbol:     /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password),
    match:      password.length > 0 && password === confirmPassword,
  }), [password, confirmPassword]);

  const strengthScore = Object.values(criteria).filter(Boolean).length - (criteria.match ? 1 : 0);
  const strengthLabels = ["Critical", "Weak", "Fair", "Strong", "High-Entropy"];
  const strengthColors = ["bg-[var(--ag-error)]", "bg-[var(--ag-error)]", "bg-[var(--ag-warning)]", "bg-[var(--ag-success)]", "bg-[var(--ag-success)]"];

  const allMet = Object.values(criteria).every(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allMet || isLoading) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/omnicraft/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signup", email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Registration failed. Please try again.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setErrorMsg("Connection error. Please check your network.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--ag-bg)]">
      {/* Hero Image */}
      <div className="hidden md:block md:w-[55%] relative min-h-screen sticky top-0 overflow-hidden">
        <Image src="/assets/login-hero.jpg" alt="Antigravity OS" fill priority className="object-cover object-center" sizes="55vw" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,11,10,0.0)_0%,rgba(11,11,10,0.3)_60%,rgba(11,11,10,0.97)_100%)]" />
        <div className="absolute bottom-8 left-8 right-16 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ag-gold)] opacity-80">Antigravity OS v5.2</p>
          <p className="text-[13px] text-[var(--ag-text-sec)] leading-relaxed max-w-sm">Create your sovereign AI workspace account.</p>
        </div>
      </div>

      {/* Mobile hero */}
      <div className="md:hidden relative h-40 overflow-hidden shrink-0">
        <Image src="/assets/login-hero.jpg" alt="Antigravity OS" fill priority className="object-cover object-top" sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,10,0.2)_0%,rgba(11,11,10,0.95)_100%)]" />
      </div>

      {/* Panel */}
      <div className="flex-1 md:w-[45%] flex flex-col min-h-screen overflow-y-auto">
        <div className="flex-1 flex flex-col justify-start md:justify-center px-6 sm:px-10 md:px-12 lg:px-16 py-8 md:py-12 max-w-md w-full mx-auto md:mx-0">
          <div className="flex justify-end mb-4 md:mb-6">
            <ThemeToggle />
          </div>

          {/* Wordmark */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--ag-gold-alpha)] border border-[var(--ag-gold)]/30 flex items-center justify-center shadow-[var(--ag-shadow-gold)] shrink-0">
                <Cpu className="w-5 h-5 text-[var(--ag-gold)]" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-widest text-[var(--ag-text)] uppercase">
                  Antigravity <span className="text-[var(--ag-gold)]">OS</span>
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--ag-muted)] font-semibold">Sovereign AI Workspace</p>
              </div>
            </div>
            <div className="pt-2">
              <h2 className="text-xl font-bold text-[var(--ag-text)]">Create Account</h2>
              <p className="text-[13px] text-[var(--ag-text-sec)] mt-1">Register as an operator to access the command center.</p>
            </div>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center animate-[fade-in_0.3s_ease-out]">
              <CheckCircle2 className="w-10 h-10 text-[var(--ag-success)]" />
              <p className="text-[var(--ag-text)] font-semibold">Account created.</p>
              <p className="text-[var(--ag-text-sec)] text-sm">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {errorMsg && (
                <div role="alert" className="flex items-start gap-3 p-3.5 rounded-lg bg-[var(--ag-error-bg)] border border-[var(--ag-error)]/25 text-[var(--ag-error)] text-sm animate-[fade-in_0.25s_ease-out]">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="reg-email" className="block text-[11px] font-semibold uppercase tracking-widest text-[var(--ag-muted)]">Email</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ag-muted)] pointer-events-none z-10" />
                  <input id="reg-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operator@workspace.ai" className="ag-input !pl-10" style={{ paddingLeft: "2.5rem" }} />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="reg-password" className="block text-[11px] font-semibold uppercase tracking-widest text-[var(--ag-muted)]">Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ag-muted)] pointer-events-none z-10" />
                  <input id="reg-password" type={showPassword ? "text" : "password"} required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" className="ag-input !pl-10 !pr-11" style={{ paddingLeft: "2.5rem", paddingRight: "2.75rem" }} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--ag-muted)] hover:text-[var(--ag-text-sec)] transition-colors z-10" aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength meter */}
                {password && (
                  <div className="space-y-2 animate-[fade-in_0.2s_ease-out]">
                    <div className="flex gap-1">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strengthScore ? strengthColors[strengthScore] : "bg-[var(--ag-border)]"}`} />
                      ))}
                    </div>
                    <p className="text-[10px] text-[var(--ag-muted)]">Strength: <span className="text-[var(--ag-text-sec)] font-semibold">{strengthLabels[strengthScore]}</span></p>
                    <div className="grid grid-cols-2 gap-1">
                      {([
                        { key: "length",     label: "8+ characters" },
                        { key: "lowerUpper", label: "Upper & lowercase" },
                        { key: "number",     label: "Number" },
                        { key: "symbol",     label: "Symbol" },
                      ] as {key: keyof typeof criteria; label: string}[]).map((c) => (
                        <div key={c.key} className="flex items-center gap-1.5 text-[10px]">
                          {criteria[c.key]
                            ? <CheckCircle2 className="w-3 h-3 text-[var(--ag-success)]" />
                            : <XCircle className="w-3 h-3 text-[var(--ag-border)]" />}
                          <span className={criteria[c.key] ? "text-[var(--ag-text-sec)]" : "text-[var(--ag-muted)]"}>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div className="space-y-1.5">
                <label htmlFor="reg-confirm" className="block text-[11px] font-semibold uppercase tracking-widest text-[var(--ag-muted)]">Confirm Password</label>
                <div className="relative flex items-center">
                  <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ag-muted)] pointer-events-none z-10" />
                  <input id="reg-confirm" type="password" required autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••••••" className={`ag-input !pl-10 ${criteria.match ? "border-[var(--ag-success)]" : ""}`} style={{ paddingLeft: "2.5rem" }} />
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading} disabled={!allMet} iconRight={<ArrowRight className="w-4 h-4" />} className="mt-2">
                Create Account
              </Button>

              <div className="text-center pt-1">
                <span className="text-[12px] text-[var(--ag-muted)]">Already registered? </span>
                <Link href="/login" className="text-[12px] text-[var(--ag-gold)] hover:text-[var(--ag-gold-bright)] font-semibold transition-colors">
                  Sign in →
                </Link>
              </div>
            </form>
          )}

          {/* Security */}
          <div className="mt-6 pt-5 border-t border-[var(--ag-border)]">
            <div className="flex flex-wrap gap-2">
              {[
                { icon: <Shield className="w-3 h-3" />, label: "PBKDF2-SHA512" },
                { icon: <Lock className="w-3 h-3" />,   label: "Server-Enforced Role" },
              ].map((item) => (
                <span key={item.label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--ag-elevated)] border border-[var(--ag-border)] text-[10px] font-medium text-[var(--ag-muted)]">
                  <span className="text-[var(--ag-gold)] opacity-70">{item.icon}</span>
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
