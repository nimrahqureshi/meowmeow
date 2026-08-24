"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send, Loader2, Check, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", body: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setStatus("done");
      setMsg(data.message);
      setForm({ name: "", email: "", subject: "", body: "" });
    } catch (err) {
      setStatus("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">Contact</p>
      <h1 className="font-display text-3xl md:text-5xl font-extrabold mt-1">Talk to a human</h1>
      <p className="text-muted mt-3 max-w-xl">Questions about a product, a price alert, or our testing process? We reply within 24 hours.</p>

      <div className="grid lg:grid-cols-[380px_1fr] gap-8 mt-10 items-start">
        <div className="space-y-4">
          {[
            { icon: Mail, t: "Email us", s: "hello@meowmeow.shop" },
            { icon: MessageSquare, t: "Live chat", s: "Use the assistant — Meow answers instantly" },
            { icon: Clock, t: "Response time", s: "Under 24h, 7 days a week" },
            { icon: MapPin, t: "HQ", s: "Remote-first · Planet Earth 🌍" },
          ].map((c) => (
            <div key={c.t} className="glass rounded-2xl p-5 flex items-start gap-4 card-hover">
              <span className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0"><c.icon size={16} /></span>
              <div>
                <p className="font-bold text-sm">{c.t}</p>
                <p className="text-xs text-muted mt-1">{c.s}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="glass-strong rounded-3xl p-7 md:p-9 relative overflow-hidden">
          <div className="aurora-blob w-56 h-56 bg-brand/15 -top-16 -right-10" />
          <div className="relative grid sm:grid-cols-2 gap-4">
            <label htmlFor="contact-name" className="sr-only">Your name</label>
          <input value={form.name} id="contact-name" autoComplete="name" onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" required className="h-12 px-4 rounded-2xl bg-soft border border-line outline-none text-sm focus:border-brand/50 transition" />
            <label htmlFor="contact-email" className="sr-only">Email address</label>
          <input type="email" value={form.email} id="contact-email" autoComplete="email" onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" required className="h-12 px-4 rounded-2xl bg-soft border border-line outline-none text-sm focus:border-brand/50 transition" />
          </div>
          <label htmlFor="contact-subject" className="sr-only">Subject</label>
          <input value={form.subject} id="contact-subject" onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="mt-4 w-full h-12 px-4 rounded-2xl bg-soft border border-line outline-none text-sm focus:border-brand/50 transition" />
          <label htmlFor="contact-body" className="sr-only">How can we help?</label>
          <textarea value={form.body} id="contact-body" onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="How can we help?" required rows={6} className="mt-4 w-full p-4 rounded-2xl bg-soft border border-line outline-none text-sm focus:border-brand/50 transition resize-none" />

          {msg && (
            <p className={`mt-3 text-xs font-bold ${status === "done" ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"} flex items-center gap-1.5`}>
              {status === "done" ? <Check size={12} /> : null} {msg}
            </p>
          )}

          <button type="submit" disabled={status === "sending"} className="mt-5 h-12 px-7 rounded-2xl bg-gradient-to-r from-brand to-brand-2 text-white font-bold text-sm btn-shine hover:opacity-95 transition disabled:opacity-60 flex items-center gap-2">
            {status === "sending" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Send message
          </button>
        </form>
      </div>
    </div>
  );
}
