"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Shield,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Real-time password criteria evaluation
  const criteria = useMemo(() => {
    return {
      length: password.length >= 8,
      lowerUpper: /[a-z]/.test(password) && /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password),
      match: password.length > 0 && password === confirmPassword,
    };
  }, [password, confirmPassword]);

  // Compute strength score 0..4
  const strengthScore = useMemo(() => {
    let score = 0;
    if (criteria.length) score += 1;
    if (criteria.lowerUpper) score += 1;
    if (criteria.number) score += 1;
    if (criteria.symbol) score += 1;
    return score;
  }, [criteria]);

  const strengthLabels = ["Critical", "Weak", "Fair", "Strong", "High-Entropy"];
  const strengthColors = [
    "bg-red-500",
    "bg-red-500",
    "bg-amber-500",
    "bg-cyber-cyan",
    "bg-emerald-400",
  ];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    if (strengthScore < 2) {
      setErrorMsg("Password does not meet minimum policy requirements.");
      return;
    }

    if (!agreeTerms) {
      setErrorMsg("You must accept the terms to proceed.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/omnicraft/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signup",
          email: email.trim(),
          password,
        }),
      });

      const json = await res.json();

      if (json.success) {
        if (typeof window !== "undefined") {
          // Store minimal public user metadata only (NEVER session tokens)
          localStorage.setItem("omnicraft_user", JSON.stringify(json.user));
          window.location.href = "/";
        }
      } else {
        setErrorMsg(json.error || "Unable to register account.");
      }
    } catch {
      setErrorMsg("Network error processing registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono selection:bg-cyber-purple selection:text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-[500px] h-[350px] bg-cyber-purple/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-cyber-cyan/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-cyber-purple/40 text-cyber-purple text-[11px]">
            <Shield className="w-3.5 h-3.5" />
            <span className="tracking-widest uppercase font-bold">OPERATOR ONBOARDING</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>CREATE ACCOUNT</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Provision workstation access with salted PBKDF2-SHA512 credential storage.
          </p>
        </div>

        <Card glow="purple" className="border-cyber-purple/30 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-4 border-b border-white/10">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyber-purple/10 border border-cyber-purple/40 flex items-center justify-center text-cyber-purple">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-xs uppercase font-bold text-slate-100">
                    Registration Form
                  </CardTitle>
                  <p className="text-[10px] text-slate-400">Server-Enforced Role Assignment (USER)</p>
                </div>
              </div>
              <Badge variant="purple" className="border-cyber-purple/40 text-cyber-purple text-[10px]">
                RBAC
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-cyber-cyan" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@domain.com"
                  disabled={isLoading}
                  className="w-full bg-slate-950/90 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition-all"
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
                    className="text-[10px] text-slate-400 hover:text-cyber-purple flex items-center gap-1 transition-colors"
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a high-entropy password"
                  disabled={isLoading}
                  className="w-full bg-slate-950/90 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition-all"
                />

                {/* Real-Time Password Strength Bar */}
                {password.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Entropy Score:</span>
                      <span className="font-bold text-slate-200">
                        {strengthLabels[strengthScore]}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                      {[0, 1, 2, 3].map((idx) => (
                        <div
                          key={idx}
                          className={`rounded-full transition-all duration-300 ${
                            strengthScore > idx ? strengthColors[strengthScore] : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-cyber-cyan" />
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  disabled={isLoading}
                  className="w-full bg-slate-950/90 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition-all"
                />
              </div>

              {/* Criteria Checklist */}
              {password.length > 0 && (
                <div className="p-3 rounded-lg bg-slate-950/80 border border-white/5 space-y-1.5 text-[10px]">
                  <div className="text-slate-400 font-semibold uppercase tracking-wider">
                    Password Requirements
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      {criteria.length ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-600" />
                      )}
                      <span>8+ characters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {criteria.lowerUpper ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-600" />
                      )}
                      <span>Upper & lowercase</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {criteria.number ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-600" />
                      )}
                      <span>Numeric digit</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {criteria.symbol ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-600" />
                      )}
                      <span>Special symbol</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none text-[11px] text-slate-400">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="rounded border-white/10 bg-slate-950 text-cyber-purple focus:ring-cyber-purple h-3.5 w-3.5 mt-0.5"
                  />
                  <span>
                    I accept the workstation access guidelines and user security policies.
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-[11px] text-red-300 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full h-10 gap-2 bg-gradient-to-r from-cyber-purple via-indigo-600 to-cyber-cyan hover:from-purple-500 hover:to-cyan-400 text-white font-bold tracking-wider uppercase text-xs shadow-glow-purple"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>CREATING ACCOUNT...</span>
                  </>
                ) : (
                  <>
                    <span>REGISTER ACCOUNT</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-white/5 text-center text-xs text-slate-400">
              <p>
                Existing Operator?{" "}
                <Link
                  href="/login"
                  className="text-cyber-cyan hover:text-cyan-300 font-semibold underline underline-offset-4 ml-1 transition-colors"
                >
                  Sign In →
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
