"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  Cpu,
  Fingerprint,
} from "lucide-react";

/**
 * Sanitizes callback URL to prevent open redirect vulnerabilities.
 * Only allows relative internal paths and rejects absolute URLs / protocol-relative URLs.
 */
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
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl = sanitizeCallbackUrl(rawCallbackUrl);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds === null || lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev === null || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/omnicraft/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signin",
          email: email.trim(),
          password: password || undefined,
        }),
      });

      const json = await res.json();

      if (json.success) {
        if (typeof window !== "undefined") {
          // Store minimal public user metadata only (NEVER session tokens)
          localStorage.setItem("omnicraft_user", JSON.stringify(json.user));
          window.location.href = callbackUrl;
        }
      } else {
        setErrorMsg(json.error || "Invalid email or password.");
        const match = json.error?.match(/Retry in (\d+)s/i);
        if (match) {
          setLockoutSeconds(parseInt(match[1], 10));
        }
      }
    } catch {
      setErrorMsg("Unable to complete authentication request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10 space-y-6">
      {/* System Branding Badge */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-cyber-cyan/30 text-cyber-cyan text-[11px]">
          <Cpu className="w-3.5 h-3.5" />
          <span className="tracking-widest uppercase font-bold">ANTIGRAVITY OS v5.1</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          <span>OPERATOR SIGN IN</span>
        </h1>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Authenticated workstation access with PBKDF2-SHA512 session verification.
        </p>
      </div>

      {/* Auth Glass Panel Card */}
      <Card glow="cyan" className="border-cyber-cyan/30 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="pb-4 border-b border-white/10">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan">
                <Fingerprint className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-xs uppercase font-bold text-slate-100">
                  Authentication Gateway
                </CardTitle>
                <p className="text-[10px] text-slate-400">PBKDF2-SHA512 / 100,000 Iterations</p>
              </div>
            </div>
            <Badge variant="cyan" className="border-cyber-cyan/40 text-cyber-cyan text-[10px]">
              ACTIVE
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-cyber-cyan" />
                  Operator Email
                </span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@domain.com"
                disabled={isLoading || lockoutSeconds !== null}
                className="w-full bg-slate-950/90 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-cyber-purple" />
                  Password
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-slate-400 hover:text-cyber-cyan flex items-center gap-1 transition-colors"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3 h-3" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" /> Show
                    </>
                  )}
                </button>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isLoading || lockoutSeconds !== null}
                className="w-full bg-slate-950/90 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition-all"
              />
            </div>

            {/* Remember Session */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/10 bg-slate-950 text-cyber-cyan focus:ring-cyber-cyan h-3.5 w-3.5"
                />
                <span>Persist session (7 days)</span>
              </label>
            </div>

            {/* Lockout Warning Banner */}
            {lockoutSeconds !== null && (
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-300 flex items-start gap-2.5 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-wider">Account Lockout Active</p>
                  <p className="text-[10px] text-amber-400/90">
                    Excessive failed attempts. Retry in{" "}
                    <span className="font-bold text-white underline">{lockoutSeconds}s</span>.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && lockoutSeconds === null && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-[11px] text-red-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || lockoutSeconds !== null}
              className="w-full h-10 gap-2 bg-gradient-to-r from-cyber-cyan via-blue-600 to-cyber-purple hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold tracking-wider uppercase text-xs shadow-glow-cyan"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>VERIFYING CREDENTIALS...</span>
                </>
              ) : (
                <>
                  <span>SIGN IN TO WORKSPACE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Switch to Signup */}
          <div className="mt-5 pt-4 border-t border-white/5 text-center text-xs text-slate-400 space-y-2">
            <p>
              New Operator?{" "}
              <Link
                href="/signup"
                className="text-cyber-cyan hover:text-cyan-300 font-semibold underline underline-offset-4 ml-1 transition-colors"
              >
                Create Account →
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Factual Telemetry Footer */}
      <div className="grid grid-cols-3 gap-2 text-center text-[9px] text-slate-500">
        <div className="p-2 rounded bg-slate-900/50 border border-white/5">
          <span className="block text-slate-400 font-bold">PBKDF2-SHA512</span>
          <span>100K ITERATIONS</span>
        </div>
        <div className="p-2 rounded bg-slate-900/50 border border-white/5">
          <span className="block text-slate-400 font-bold">RATE LIMIT</span>
          <span>5 ATTEMPTS / 15 MIN</span>
        </div>
        <div className="p-2 rounded bg-slate-900/50 border border-white/5">
          <span className="block text-slate-400 font-bold">COOKIE</span>
          <span>HTTPONLY + SAMESITE</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono selection:bg-cyber-cyan selection:text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyber-cyan/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyber-purple/10 blur-[140px] rounded-full pointer-events-none" />

      <Suspense
        fallback={
          <div className="text-cyber-cyan font-mono text-xs flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
            <span>INITIALIZING GATEWAY...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
