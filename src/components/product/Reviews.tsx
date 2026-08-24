"use client";

import { useState } from "react";
import { Check, ThumbsUp, MessageSquare, Star } from "lucide-react";
import { RatingStars } from "@/components/ui";
import { cn, timeAgo } from "@/lib/utils";

export interface ReviewItem {
  id: number;
  author: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  helpful: number;
  createdAt: string;
}

export default function Reviews({ productId, initial, rating, reviewCount }: { productId: number; initial: ReviewItem[]; rating: number; reviewCount: number }) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initial);
  const [sort, setSort] = useState<"recent" | "helpful" | "highest" | "lowest">("recent");
  const [form, setForm] = useState({ author: "", rating: 5, title: "", body: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const sorted = [...reviews].sort((a, b) => {
    if (sort === "helpful") return b.helpful - a.helpful;
    if (sort === "highest") return b.rating - a.rating;
    if (sort === "lowest") return a.rating - b.rating;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const bars = [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct: reviews.length ? Math.round((reviews.filter((r) => Math.round(r.rating) === star).length / reviews.length) * 100) : 0,
  }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.author.trim() || !form.title.trim() || !form.body.trim()) {
      setError("Please fill in your name, title and review.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...form, rating: form.rating }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setReviews((prev) => [data.review, ...prev]);
      setDone(true);
      setForm({ author: "", rating: 5, title: "", body: "" });
      setTimeout(() => setDone(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="reviews" className="scroll-mt-28">
      <div className="grid lg:grid-cols-[320px_1fr] gap-8">
        {/* Summary */}
        <div className="glass rounded-3xl p-6 h-fit">
          <h2 className="font-display font-bold text-xl">Customer reviews</h2>
          <div className="flex items-center gap-4 mt-4">
            <p className="font-display text-5xl font-extrabold text-gradient">{rating.toFixed(1)}</p>
            <div>
              <RatingStars rating={rating} size={16} />
              <p className="text-xs text-muted mt-1.5">{reviewCount.toLocaleString()} ratings</p>
            </div>
          </div>
          <div className="space-y-1.5 mt-5">
            {bars.map((b) => (
              <div key={b.star} className="flex items-center gap-2 text-xs">
                <span className="w-8 font-semibold flex items-center gap-0.5">{b.star}<Star size={10} className="fill-current text-amber-500" /></span>
                <div className="flex-1 h-2 rounded-full bg-soft overflow-hidden">
                  <div className="h-full rounded-full bg-amber-400 transition-all duration-700" style={{ width: `${b.pct}%` }} />
                </div>
                <span className="w-8 text-muted text-right">{b.pct}%</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted mt-4 leading-relaxed">
            <Check size={12} className="inline text-emerald-700 dark:text-emerald-300" /> Reviews marked verified come from confirmed buyers routed through MeowMeow.
          </p>
        </div>

        {/* List + form */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold flex items-center gap-2"><MessageSquare size={16} /> {reviews.length} reviews</p>
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-10 px-3 rounded-xl glass text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg" aria-label="Sort reviews">
              <option value="recent">Most recent</option>
              <option value="helpful">Most helpful</option>
              <option value="highest">Highest rated</option>
              <option value="lowest">Lowest rated</option>
            </select>
          </div>

          <div className="space-y-4">
            {sorted.map((r) => (
              <article key={r.id} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-gradient-to-br from-brand/20 to-brand-2/20 text-brand font-bold text-sm flex items-center justify-center">
                    {r.author.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-bold">{r.author} {r.verified && <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded-full ml-1"><Check size={10} className="inline" /> Verified</span>}</p>
                    <RatingStars rating={r.rating} size={12} />
                  </div>
                  <span className="ml-auto text-[11px] text-muted">{timeAgo(r.createdAt)}</span>
                </div>
                <h3 className="font-bold text-sm mt-3">{r.title}</h3>
                <p className="text-sm text-muted mt-1.5 leading-relaxed">{r.body}</p>
                <button className="mt-3 inline-flex items-center gap-1.5 min-h-6 py-1 text-[11px] font-bold text-muted hover:text-brand transition">
                  <ThumbsUp size={12} /> Helpful ({r.helpful})
                </button>
              </article>
            ))}
          </div>

          {/* Add review */}
          <form onSubmit={submit} className="glass rounded-3xl p-6 mt-6">
            <h3 className="font-display font-bold text-lg">Write a review</h3>
            <p className="text-xs text-muted mt-1">Your experience helps other shoppers decide.</p>

            <div className="flex items-center gap-1.5 mt-4">
              <span className="text-xs font-bold text-muted mr-1">Your rating:</span>
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setForm((f) => ({ ...f, rating: s }))} aria-label={`${s} stars`} className="w-6 h-6 flex items-center justify-center">
                  <Star size={20} className={cn("transition", s <= form.rating ? "text-amber-400" : "text-soft")} fill={s <= form.rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <label htmlFor="review-author" className="sr-only">Your name</label>
          <input value={form.author} id="review-author" autoComplete="name" onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} placeholder="Your name" className="h-11 px-4 rounded-xl bg-soft border border-line outline-none text-sm focus:border-brand/50 transition" />
              <label htmlFor="review-title" className="sr-only">Review title</label>
          <input value={form.title} id="review-title" onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Review title" className="h-11 px-4 rounded-xl bg-soft border border-line outline-none text-sm focus:border-brand/50 transition" />
            </div>
            <label htmlFor="review-body" className="sr-only">Your review</label>
          <textarea value={form.body} id="review-body" onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} placeholder="What did you love? What should others know?" rows={4} className="mt-3 w-full p-4 rounded-xl bg-soft border border-line outline-none text-sm focus:border-brand/50 transition resize-none" />

            {error && <p className="text-rose-700 dark:text-rose-300 text-xs font-bold mt-2">{error}</p>}
            {done && <p className="text-emerald-700 dark:text-emerald-300 text-xs font-bold mt-2">Thanks! Your review has been published.</p>}

            <button type="submit" disabled={submitting} className="mt-4 h-11 px-6 rounded-xl bg-gradient-to-r from-brand to-brand-2 text-white text-sm font-bold btn-shine hover:opacity-95 transition disabled:opacity-60">
              {submitting ? "Publishing…" : "Submit review"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
