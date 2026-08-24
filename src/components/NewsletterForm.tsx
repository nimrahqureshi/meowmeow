"use client";

import { useState } from "react";
import { Check, Loader2, Send, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done"; message: string } | { kind: "error"; message: string };

/**
 * Newsletter signup, used in the footer and at the end of blog posts.
 *
 * Replaces two duplicated server-action forms that posted to the API over HTTP
 * and discarded the result — so a failure looked identical to a success. This
 * reports what actually happened and keeps the control disabled while in
 * flight, matching the app's other forms.
 *
 * @param tone "onDark" for the footer's dark panel, "onSurface" elsewhere.
 */
export default function NewsletterForm({ tone = "onSurface" }: { tone?: "onDark" | "onSurface" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.kind === "sending") return;

    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setStatus({ kind: "error", message: "Enter a valid email address, like name@example.com." });
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({
          kind: "error",
          message: res.status === 429 ? "Too many attempts. Try again in a minute." : (data.error ?? "That didn't go through. Try again."),
        });
        return;
      }
      setEmail("");
      setStatus({ kind: "done", message: data.message ?? "You're subscribed. Check your inbox to confirm." });
    } catch {
      setStatus({ kind: "error", message: "Couldn't reach the server. Check your connection and try again." });
    }
  };

  const onDark = tone === "onDark";
  const sending = status.kind === "sending";

  if (status.kind === "done") {
    return (
      <p
        role="status"
        className={cn(
          "flex items-center gap-2 mt-4 text-sm font-semibold",
          onDark ? "text-emerald-300" : "text-emerald-700 dark:text-emerald-300"
        )}
      >
        <Check size={16} className="shrink-0" /> {status.message}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4" noValidate>
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status.kind === "error") setStatus({ kind: "idle" });
          }}
          required
          disabled={sending}
          placeholder="your@email.com"
          aria-label="Email address for the newsletter"
          aria-invalid={status.kind === "error"}
          className={cn(
            "flex-1 min-w-0 h-11 px-4 rounded-xl border text-sm outline-none transition focus:ring-4 focus:ring-brand/20 disabled:opacity-60",
            onDark
              ? "bg-white/10 border-white/15 placeholder:text-white/40 focus:border-brand/60"
              : "bg-soft border-line placeholder:text-muted/70 focus:border-brand/60",
            status.kind === "error" && "border-danger/70"
          )}
        />
        <button
          type="submit"
          disabled={sending}
          className="h-11 px-4 rounded-xl bg-gradient-to-r from-brand to-brand-2 text-white text-sm font-bold btn-shine hover:opacity-95 transition shrink-0 flex items-center gap-1.5 disabled:opacity-70"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {sending ? "Joining" : "Join"}
        </button>
      </div>
      {status.kind === "error" && (
        <p role="alert" className={cn("flex items-center gap-1.5 mt-2 text-xs font-semibold", onDark ? "text-rose-300" : "text-danger")}>
          <AlertCircle size={12} className="shrink-0" /> {status.message}
        </p>
      )}
    </form>
  );
}
