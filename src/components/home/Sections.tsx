"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Zap, Flame, Star, Gem, BadgeDollarSign, Sparkles, MessageSquare, HelpCircle, Quote, ShoppingBag, MousePointerClick, Mail, Plus, PawPrint, Percent, ArrowRight, Layers, Store, Tag, MousePointer } from "lucide-react";
import ProductCard, { type CardProduct } from "@/components/ProductCard";
import { SectionHeader, RatingStars } from "@/components/ui";
import { cn } from "@/lib/utils";
import { CategoryIcon, stripEmoji } from "@/lib/category-icons";
import SmartImage from "@/components/SmartImage";

/* ---------------- Countdown ---------------- */


function FlashSale({ products }: { products: CardProduct[] }) {
  return (
    <section className="relative mt-6">
      <div className="relative rounded-4xl overflow-hidden bg-gradient-to-br from-[#1a1611] via-[#221c15] to-[#100d0a] p-6 md:p-10">
        <div className="aurora-blob w-80 h-80 bg-brand/25 -top-24 -right-16" />
        <div className="aurora-blob w-80 h-80 bg-amber-400/15 -bottom-28 -left-20" style={{ animationDelay: "-9s" }} />
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-300 flex items-center gap-2">
                <Percent size={12} /> Biggest markdowns
              </p>
              <h2 className="font-display text-2xl md:text-4xl font-extrabold text-white mt-2">
                Today&apos;s <span className="text-gradient-gold">Deals</span>
              </h2>
              {/* No countdown: the listings carry no merchant-supplied expiry,
                  so a timer would be manufactured urgency. */}
              <p className="text-white/60 text-sm mt-2">
                The largest discounts against list price across every category we cover.
              </p>
            </div>
            <Link
              href="/products?tag=deals"
              className="glass rounded-2xl px-5 h-12 inline-flex items-center gap-2 text-sm font-bold text-white shrink-0 hover:border-amber-300/40 transition"
            >
              See all deals <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.slice(0, 8).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Product rail ---------------- */

function ProductRail({ products, title, eyebrow, href, gradient }: { products: CardProduct[]; title: string; eyebrow?: string; href?: string; gradient?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <section className="mt-20">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {gradient && (
            <span className={cn("w-10 h-10 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shadow-lg", gradient)}>
              {title.includes("Trending") ? <Flame size={18} /> : title.includes("Seller") ? <Star size={18} /> : title.includes("Premium") ? <Gem size={18} /> : title.includes("Deal") ? <BadgeDollarSign size={18} /> : <Sparkles size={18} />}
            </span>
          )}
          <div>
            {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>}
            <h2 className="font-display text-2xl md:text-3xl font-bold">{title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {href && (
            <Link href={href} className="text-sm font-bold text-brand mr-2 hidden sm:inline-flex items-center min-h-[24px] hover:underline">
              View all
            </Link>
          )}
          <button onClick={() => scroll(-1)} className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:text-brand transition" aria-label="Scroll left">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll(1)} className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:text-brand transition" aria-label="Scroll right">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div ref={ref} className="flex gap-4 overflow-x-auto pb-4 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((p, i) => (
          <div key={p.id} className="snap-start w-[230px] sm:w-[250px] shrink-0">
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Categories ---------------- */

interface CatTile {
  id: number;
  slug: string;
  name: string;
  emoji: string;
  image: string | null;
  description: string | null;
  isCollection: boolean;
}

export function CategoryGrid({ categories }: { categories: CatTile[] }) {
  const real = categories.filter((c) => !c.isCollection);
  return (
    <section className="mt-20">
      <SectionHeader eyebrow="Browse" title="Shop by category" subtitle="Browse the full catalogue by department." href="/products" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {real.map((c, i) => (
          <Link
            key={c.id}
            href={`/products?category=${c.slug}`}
            className="group relative rounded-3xl overflow-hidden aspect-[4/5] card-hover reveal"
            style={{ animationDelay: `${Math.min(i, 10) * 50}ms` }}
          >
            {c.image ? (
              <SmartImage src={c.image} alt={c.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-brand-2/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-4">
              <span className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur border border-white/20 text-white flex items-center justify-center shadow-lg"><CategoryIcon slug={c.slug} size={16} /></span>
              <p className="text-white font-bold text-sm mt-2 leading-tight">{stripEmoji(c.name)}</p>
              <p className="text-white/60 text-[11px] mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">Shop now →</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Stats ---------------- */

/** 1,234 → "1.2K", 987 → "987" — honest at any scale, no fake zeros. */
function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 >= 100_000 ? 1 : 0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 >= 100 ? 1 : 0)}K`;
  return Math.round(n).toLocaleString("en-US");
}

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  // Starts at the real number so SSR and no-JS render the truth.
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const start = performance.now();
        const dur = 1600;
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(value * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);
  return (
    <span ref={ref}>
      {compact(display)}
      {suffix}
    </span>
  );
}

/* ---------------- Platform stats (live, verifiable) ---------------- */

/**
 * Social proof, but only where it is true.
 *
 * This replaced four invented customer testimonials. The platform has no real
 * customers to quote yet, and fabricated endorsements are both a trust problem
 * and, in the US, an FTC violation. Every figure below is read live from the
 * database by the caller, so the section cannot drift out of step with reality.
 */
export function PlatformStats({
  products,
  categories,
  merchants,
  clicks,
}: {
  products: number;
  categories: number;
  merchants: number;
  clicks: number;
}) {
  const figures = [
    { value: products, icon: ShoppingBag, label: "Products listed", note: "Every item currently in the catalogue" },
    { value: categories, icon: Layers, label: "Categories covered", note: "Browsable departments" },
    { value: merchants, icon: Store, label: "Merchants linked", note: "Retailers we route shoppers to" },
    { value: clicks, icon: MousePointer, label: "Deal links opened", note: "Outbound clicks tracked to date" },
  ];

  return (
    <section className="mt-20">
      <SectionHeader
        eyebrow="By the numbers"
        title="What's actually on the platform"
        subtitle="Live figures from our catalogue — no rounded-up marketing numbers."
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {figures.map((f) => (
          <div key={f.label} className="glass rounded-3xl p-6 card-hover">
            <span className="w-11 h-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
              <f.icon size={20} />
            </span>
            <p className="font-display text-3xl font-extrabold mt-4 tabular-nums">
              <CountUp value={f.value} />
            </p>
            <p className="text-sm font-semibold mt-1">{f.label}</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">{f.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

const FAQS = [
  { q: "How does MeowMeow make money?", a: "MeowMeow is an affiliate platform. When you buy through one of our links, the merchant may pay us a commission — it costs you nothing extra and never changes the price you pay. Every outbound link is marked, and the disclosure appears on product pages as well as in the footer." },
  { q: "How do you pick products?", a: "We curate. Listings are chosen from merchant catalogues using published specifications, merchant ratings and the size of the discount against list price. We do not currently test products in-house, and we will say so plainly rather than imply otherwise. No listing is paid placement." },
  { q: "Are the prices on this site live?", a: "Prices and availability are shown as last recorded and can change at any time. Always confirm the final price on the merchant's own page before buying — that page is the source of truth." },
  { q: "Can I buy directly on MeowMeow?", a: "No. MeowMeow is a discovery platform, not a shop. Your cart here is a shopping list: save what interests you, then tap through to the merchant, who handles payment, shipping, returns and support." },
  { q: "How does the shopping assistant work?", a: "It searches this site's own catalogue and answers from those records only — so it cannot invent a product, a price or a discount. It is free to use and your conversation is not stored." },
];

export function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="mt-20 max-w-3xl mx-auto">
      <SectionHeader eyebrow="Help" title="Frequently asked questions" subtitle="Everything you need to know about how MeowMeow works." />
      <div className="space-y-3">
        {FAQS.map((f, i) => (
          <div key={i} className={cn("glass rounded-2xl overflow-hidden transition", open === i && "border-brand/40")}>
            <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center gap-3 p-5 text-left" aria-expanded={open === i}>
              <HelpCircle size={18} className={cn("shrink-0 transition-colors", open === i ? "text-brand" : "text-muted")} />
              <span className="font-semibold text-sm flex-1">{f.q}</span>
              <span className={cn("text-brand transition-transform duration-300 inline-flex", open === i && "rotate-45")} aria-hidden="true"><Plus size={16} /></span>
            </button>
            <div className={cn("grid transition-all duration-300", open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="overflow-hidden">
                <p className="px-5 pb-5 pl-11 text-sm text-muted leading-relaxed">{f.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Blog preview + Pinterest-style gallery ---------------- */

interface BlogTile {
  slug: string;
  title: string;
  excerpt: string;
  cover: string | null;
  author: string;
  readTime: number;
  tags: string[];
  publishedAt: string;
}

export function BlogPreview({ posts }: { posts: BlogTile[] }) {
  const [feature, ...rest] = posts;
  return (
    <section className="mt-20">
      <SectionHeader eyebrow="The Journal" title="Fresh from the blog" subtitle="Buying guides, testing notes and deep dives from our editors." href="/blog" />
      <div className="grid lg:grid-cols-3 gap-4">
        {feature && (
          <Link href={`/blog/${feature.slug}`} className="lg:row-span-2 relative rounded-3xl overflow-hidden group min-h-[420px] card-hover">
            <SmartImage src={feature.cover ?? "/images/hero.jpg"} alt={feature.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute bottom-0 p-6">
              <div className="flex gap-2 mb-3">
                {feature.tags.slice(0, 2).map((t) => (
                  <span key={t} className="text-[10px] font-bold text-white bg-white/20 backdrop-blur px-2.5 py-1 rounded-full">{t}</span>
                ))}
              </div>
              <h3 className="text-white font-display font-bold text-xl md:text-2xl leading-snug">{feature.title}</h3>
              <p className="text-white/70 text-sm mt-2 line-clamp-2">{feature.excerpt}</p>
              <p className="text-white/50 text-[11px] mt-3">{feature.author} · {feature.readTime} min read</p>
            </div>
          </Link>
        )}
        {rest.slice(0, 4).map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="glass rounded-3xl overflow-hidden card-hover flex flex-col">
            <div className="relative aspect-[16/9] overflow-hidden">
              <SmartImage src={p.cover ?? "/images/hero.jpg"} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="p-5 flex flex-col flex-1">
              <p className="text-[11px] font-bold text-brand uppercase tracking-wider">{p.tags[0]}</p>
              <h3 className="font-bold text-sm leading-snug mt-1.5 line-clamp-2 group-hover:text-brand transition-colors">{p.title}</h3>
              <p className="text-xs text-muted mt-2 line-clamp-2">{p.excerpt}</p>
              <p className="text-[11px] text-muted/70 mt-auto pt-3">{p.author} · {p.readTime} min read</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function PinterestStrip({ images }: { images: string[] }) {
  return (
    <section className="mt-20">
      <SectionHeader eyebrow="Inspiration" title="Style feed" subtitle="What the MeowMeow community is saving this week." />
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {images.map((src, i) => (
          <div key={i} className={cn("relative rounded-2xl overflow-hidden group card-hover", i % 3 === 1 ? "aspect-[3/4]" : "aspect-square")}>
            <SmartImage src={src} alt={`Style inspiration ${i + 1}`} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"  />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="bg-white text-[#191621] text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1"><PawPrint size={12} /> Save</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export { FlashSale, ProductRail };