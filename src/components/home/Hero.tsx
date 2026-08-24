"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Sparkles, ArrowRight, Star, ShieldCheck, TrendingUp, TrendingDown, Cat } from "lucide-react";
import { CategoryIcon } from "@/lib/category-icons";
import { RatingStars } from "@/components/ui";
import { motion } from "framer-motion";
import { useState } from "react";
import SmartImage from "@/components/SmartImage";

export default function Hero() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <section className="relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-brand/8 via-transparent to-transparent" />
        <div className="aurora-blob w-[480px] h-[480px] bg-brand/25 -top-40 -left-32" />
        <div className="aurora-blob w-[420px] h-[420px] bg-brand-2/25 top-10 right-[-120px]" style={{ animationDelay: "-7s" }} />
        <div className="aurora-blob w-[380px] h-[380px] bg-cyan-400/15 bottom-[-160px] left-1/3" style={{ animationDelay: "-14s" }} />
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(14)].map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-brand/30 float-slow"
              style={{
                width: 4 + (i % 3) * 3,
                height: 4 + (i % 3) * 3,
                left: `${(i * 7.3) % 100}%`,
                top: `${(i * 13.7) % 90}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${6 + (i % 5)}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-10 md:pt-16 pb-16 md:pb-24 grid lg:grid-cols-2 gap-12 items-center">
        {/* Copy */}
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-bold text-brand mb-6">
              <Sparkles size={12} /> Discover better deals
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight"
          >
            Shop the <span className="text-gradient">best of everything,</span> without the guesswork.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-muted text-base md:text-lg mt-5 max-w-lg leading-relaxed"
          >
            A curated shortlist instead of endless scrolling. Compare products side by side, see how a
            discount stacks up against list price, then jump straight to the merchant to buy.
          </motion.p>

          {/* Search */}
          <motion.form
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
            }}
            className="relative max-w-lg mt-8"
          >
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try “wireless headphones” or “gift under $100”…"
              className="w-full h-12 md:h-14 pl-12 pr-28 rounded-2xl glass-strong shadow-xl shadow-brand/5 outline-none text-sm md:text-base focus:border-brand/50 focus:ring-4 focus:ring-brand/10 transition"
              aria-label="Search products"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 md:h-10 px-4 rounded-xl bg-gradient-to-r from-brand to-brand-2 text-white text-sm font-bold btn-shine hover:opacity-95 transition flex items-center gap-1.5">
              Search <ArrowRight size={14} />
            </button>
          </motion.form>

          {/* Trust stats */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-wrap gap-x-8 gap-y-4 mt-9"
          >
            {[
              { icon: Star, value: "Rated", label: "sorted by merchant rating" },
              { icon: ShieldCheck, value: "Disclosed", label: "every link marked affiliate" },
              { icon: TrendingUp, value: "Compared", label: "side-by-side specs" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center"><s.icon size={16} /></span>
                <div>
                  <p className="font-display font-bold text-sm leading-none">{s.value}</p>
                  <p className="text-[11px] text-muted mt-1">{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="relative hidden lg:block"
        >
          <div className="relative rounded-4xl overflow-hidden shadow-2xl shadow-brand/20 rotate-1 hover:rotate-0 transition-transform duration-700">
            <SmartImage src="/images/hero.jpg" alt="Abstract aurora of MeowMeow brand colors" loading="eager" fetchPriority="high" className="w-full aspect-[4/4.6] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#100d0a]/70 via-transparent to-transparent" />
          </div>

          {/* Floating glass cards */}
          <div className="absolute -left-8 top-12 glass-strong rounded-2xl p-3.5 shadow-2xl float-slow max-w-[190px]">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center"><TrendingDown size={16} /></span>
              <div>
                <p className="text-xs font-bold">Discount tracked</p>
                <p className="text-[10px] text-muted">Aurora ANC headphones -24%</p>
              </div>
            </div>
          </div>

          <div className="absolute -right-6 bottom-24 glass-strong rounded-2xl p-3.5 shadow-2xl float-slower max-w-[200px]">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-brand/15 text-brand flex items-center justify-center"><Cat size={16} /></span>
              <div>
                <p className="text-xs font-bold">Compare before you buy</p>
                <div className="flex items-center gap-1 mt-0.5 text-[10px]">
                  <RatingStars rating={5} size={10} /> <span className="text-muted">2,134 reviews</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute left-10 -bottom-6 glass-strong rounded-2xl px-4 py-3 shadow-2xl float-slow" style={{ animationDelay: "-3s" }}>
            <p className="text-[11px] font-bold flex items-center gap-1.5"><Sparkles size={12} className="text-brand" /> AI Gift Finder</p>
            <p className="text-[10px] text-muted">“gift under $100” → 5 perfect picks</p>
          </div>
        </motion.div>
      </div>

      {/* Category quick chips */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 pb-4 flex gap-2.5 overflow-x-auto pb-6 -mt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          ["Fashion", "womens-fashion"],
          ["Watches", "watches"],
          ["Electronics", "electronics"],
          ["Beauty", "beauty"],
          ["Home", "home-kitchen"],
          ["Shoes", "shoes"],
          ["Pets", "pet-supplies"],
          ["Gifts", "gifts"],
        ].map(([label, slug]) => (
          <Link
            key={slug}
            href={`/products?category=${slug}`}
            className="shrink-0 glass rounded-full pl-3 pr-4 py-2 text-xs font-bold hover:border-brand/40 hover:text-brand hover:-translate-y-0.5 transition inline-flex items-center gap-1.5"
          >
            <CategoryIcon slug={slug} size={12} className="text-brand" /> {label}
          </Link>
        ))}
      </div>
    </section>
  );
}