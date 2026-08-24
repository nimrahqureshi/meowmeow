"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, X, Send, Sparkles, Mic, Gift, Flame, BadgePercent, Scale, Gem, User, Star } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import SmartImage from "@/components/SmartImage";

interface Msg {
  role: "user" | "bot";
  text: string;
  products?: { id: number; name: string; price: number; image: string; slug: string; rating: number }[];
}

const QUICK = [
  { icon: Gift, label: "Recommend a gift under $100" },
  { icon: Flame, label: "What's trending?" },
  { icon: BadgePercent, label: "Any coupons?" },
  { icon: Scale, label: "Compare headphones vs earbuds" },
  { icon: Gem, label: "Best jewelry?" },
];

export default function Assistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "bot",
      text: "Hi, I'm Meow — your AI shopping assistant. Ask me for gift ideas, product recommendations, comparisons, or the best deals right now.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, open]);

  const send = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || typing) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: message }]);
    setTyping(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setTimeout(() => {
        setMsgs((m) => [...m, { role: "bot", text: data.reply ?? "I couldn't find an answer for that. Try rephrasing your question.", products: data.products }]);
        setTyping(false);
      }, 500);
    } catch {
      setMsgs((m) => [...m, { role: "bot", text: "Something went wrong reaching the assistant. Check your connection and try again." }]);
      setTyping(false);
    }
  };

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-[85] w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-brand-2 text-white shadow-2xl shadow-brand/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        aria-label={open ? "Close AI assistant" : "Open AI shopping assistant"}
      >
        {open ? <X size={24} /> : <Bot size={24} />}
        {!open && <span className="absolute inset-0 rounded-2xl bg-brand/40 ping-slow" />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-bg flex items-center justify-center">
            <Sparkles size={10} className="text-white" />
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-5 sm:w-[400px] z-[85] glass-strong rounded-3xl shadow-2xl flex flex-col overflow-hidden pop-in" style={{ height: "min(600px, calc(100dvh - 140px))" }}>
          {/* Header */}
          <div className="relative bg-gradient-to-r from-brand to-brand-2 text-white p-4 flex items-center gap-3">
            <div className="aurora-blob w-24 h-24 bg-white/20 -top-8 -right-4" />
            <div className="relative w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div className="relative flex-1">
              <p className="font-bold text-sm">Meow · AI Shopping Assistant</p>
              <p className="text-[11px] text-white/70 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block" /> Online · answers in seconds
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="relative w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition" aria-label="Close">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-bg/40">
            {msgs.map((m, i) => (
              <div key={i} className={cn("flex gap-2.5", m.role === "user" && "flex-row-reverse")}>
                <span className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0", m.role === "bot" ? "bg-gradient-to-br from-brand to-brand-2 text-white" : "bg-soft")}>
                  {m.role === "bot" ? <Bot size={14} /> : <User size={14} />}
                </span>
                <div className={cn("max-w-[80%]", m.role === "user" && "text-right")}>
                  <div className={cn("inline-block text-left px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line", m.role === "bot" ? "bg-card border border-line rounded-tl-sm" : "bg-gradient-to-r from-brand to-brand-2 text-white rounded-tr-sm")}>
                    {m.text}
                  </div>
                  {m.products && m.products.length > 0 && (
                    <div className="mt-2 space-y-1.5 text-left">
                      {m.products.slice(0, 3).map((p) => (
                        <Link key={p.id} href={`/products/${p.slug}`} className="flex items-center gap-2.5 bg-card border border-line rounded-xl p-2 hover:border-brand/40 transition">
                          <SmartImage src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover"  />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold truncate">{p.name}</p>
                            <p className="text-[11px] text-muted flex items-center gap-1"><Star size={10} className="fill-current text-amber-500" /> {p.rating} · {formatPrice(p.price)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-brand-2 text-white flex items-center justify-center text-xs"><Bot size={14} /></span>
                <div className="bg-card border border-line rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted/50 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted/50 animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted/50 animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick chips */}
          <div className="px-3 pt-2 flex gap-1.5 overflow-x-auto pb-1 shrink-0">
            {QUICK.map((q) => (
                <button key={q.label} onClick={() => send(q.label)} className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-soft hover:bg-brand/10 hover:text-brand border border-line transition">
                  <q.icon size={12} /> {q.label}
                </button>
              ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="p-3 border-t border-line flex gap-2 shrink-0"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Meow anything…"
              className="flex-1 h-11 px-4 rounded-xl bg-soft border border-line outline-none text-sm focus:border-brand/50 transition"
              aria-label="Message the assistant"
            />
            <button type="submit" className="w-11 h-11 rounded-xl bg-gradient-to-r from-brand to-brand-2 text-white flex items-center justify-center hover:opacity-95 transition disabled:opacity-50" disabled={!input.trim() || typing} aria-label="Send">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}