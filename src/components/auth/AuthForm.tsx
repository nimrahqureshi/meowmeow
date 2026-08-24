"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Authentication failed");
      setSuccess(`Welcome to the pack${mode === "signup" ? " — account created" : ""}`);
      setTimeout(() => {
        router.push("/account");
        router.refresh();
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Social sign-in is intentionally inert until OAuth credentials are
  // configured; the server rejects the flow with 501 either way.
  const social = () => setError("Social sign-in isn't available yet — please use your email and password.");

  return (
    <div className="w-full max-w-md">
      <div className="glass-strong rounded-3xl p-8 shadow-2xl shadow-brand/10 relative overflow-hidden">
        <div className="aurora-blob w-48 h-48 bg-brand/20 -top-16 -right-12" />
        <div className="relative">
          <h1 className="font-display text-2xl font-extrabold">{mode === "login" ? "Welcome back" : "Join the pack"}</h1>
          <p className="text-sm text-muted mt-1.5">
            {mode === "login" ? "Sign in to sync your wishlist, cart and reviews." : "Free forever. Your wishlist follows you everywhere."}
          </p>

          {error && <p className="mt-4 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-500/10 rounded-xl px-4 py-3">{error}</p>}
          {success && <p className="mt-4 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 rounded-xl px-4 py-3">{success}</p>}

          <form onSubmit={submit} className="space-y-3.5 mt-6">
            {mode === "signup" && (
              <div className="relative">
                <label htmlFor="auth-name" className="sr-only">Full name</label>
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input
                  id="auth-name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name"
                  className="w-full h-12 pl-11 pr-4 rounded-2xl bg-soft border border-line outline-none text-sm focus:border-brand/50 focus:ring-4 focus:ring-brand/10 transition"
                />
              </div>
            )}
            <div className="relative">
              <label htmlFor="auth-email" className="sr-only">Email address</label>
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                id="auth-email"
                autoComplete="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email address"
                required
                className="w-full h-12 pl-11 pr-4 rounded-2xl bg-soft border border-line outline-none text-sm focus:border-brand/50 focus:ring-4 focus:ring-brand/10 transition"
              />
            </div>
            <div className="relative">
              <label htmlFor="auth-password" className="sr-only">Password</label>
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                id="auth-password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                type={show ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={mode === "signup" ? "Password (8+ characters)" : "Password"}
                required
                minLength={8}
                className="w-full h-12 pl-11 pr-12 rounded-2xl bg-soft border border-line outline-none text-sm focus:border-brand/50 focus:ring-4 focus:ring-brand/10 transition"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-muted hover:text-brand hover:bg-card transition"
                aria-label={show ? "Hide password" : "Show password"}
                aria-pressed={show}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="w-full h-12 rounded-2xl bg-gradient-to-r from-brand to-brand-2 text-white font-bold text-sm btn-shine hover:opacity-95 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-line flex-1" />
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">or continue with</span>
            <div className="h-px bg-line flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={social} aria-describedby="social-unavailable" className="h-11 rounded-2xl border border-line font-bold text-sm flex items-center justify-center gap-2 hover:border-brand/40 hover:bg-soft transition">
              <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 010-4.2V7.06H2.18a11 11 0 000 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 002.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
              Google
            </button>
            <button type="button" onClick={social} aria-describedby="social-unavailable" className="h-11 rounded-2xl border border-line font-bold text-sm flex items-center justify-center gap-2 hover:border-brand/40 hover:bg-soft transition">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.58 9.58 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0012 2z"/></svg>
              GitHub
            </button>
          </div>

          <p className={cn("text-center text-sm text-muted mt-6")}>
            {mode === "login" ? (
              <>New here? <Link href="/signup" className="font-bold text-brand hover:underline">Create an account</Link></>
            ) : (
              <>Already a member? <Link href="/login" className="font-bold text-brand hover:underline">Sign in</Link></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
