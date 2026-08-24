"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Scale, X, ArrowRight, Check, Minus } from "lucide-react";
import { useStore } from "@/components/store";
import { EmptyState, RatingStars } from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import SmartImage from "@/components/SmartImage";

interface CompareProduct {
  id: number;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  rating: number;
  reviewCount: number;
  images: string[];
  store: string;
  description: string;
  pros: string[];
  cons: string[];
  specs: Record<string, string>;
}

export default function ComparePage() {
  const { compareIds, clearCompare, ready } = useStore();
  // Cache keyed by the id-list we fetched for; `loading` is derived, so the
  // effect never needs a synchronous setState.
  const [fetched, setFetched] = useState<{ key: string; products: CompareProduct[] } | null>(null);

  const idsKey = compareIds.join(",");

  useEffect(() => {
    if (!idsKey) return;
    let cancelled = false;
    fetch(`/api/compare?ids=${idsKey}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setFetched({ key: idsKey, products: d.products ?? [] });
      })
      .catch(() => {
        if (!cancelled) setFetched({ key: idsKey, products: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  const products = idsKey && fetched?.key === idsKey ? fetched.products : [];
  const loading = !ready || (idsKey !== "" && fetched?.key !== idsKey);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="skeleton h-16 w-72 rounded-2xl" />
        <div className="grid grid-cols-3 gap-4 mt-8">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4] rounded-3xl" />)}</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">Compare</p>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-1 flex items-center gap-3">
          Product comparison <Scale size={24} className="text-brand" />
        </h1>
        <div className="mt-8">
          <EmptyState
            icon={Scale}
            title="Nothing to compare yet"
            description="Tap the scale icon on any product card to add it here — up to four products, side by side."
            action={{ label: "Pick products", href: "/products" }}
          />
        </div>
      </div>
    );
  }

  const allSpecs = new Set<string>();
  products.forEach((p) => Object.keys(p.specs).forEach((k) => allSpecs.add(k)));
  const allPros = new Set<string>();
  products.forEach((p) => p.pros.forEach((k) => allPros.add(k)));

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">Compare</p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-1">Side by side, no bias</h1>
          <p className="text-muted text-sm mt-2">{products.length} products compared · specs from our testing database</p>
        </div>
        <button onClick={clearCompare} className="text-xs font-bold text-muted hover:text-rose-700 dark:text-rose-300 transition shrink-0">Clear all</button>
      </div>

      <div className="overflow-x-auto mt-8 pb-4">
        <table className="w-full min-w-[760px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="w-40 text-left align-top p-3" />
              {products.map((p) => (
                <th key={p.id} className="p-3 align-top">
                  <div className="relative glass rounded-3xl p-4 text-left">
                    <Link href={`/products/${p.slug}`} className="block">
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-soft">
                        <SmartImage src={p.images[0]} alt={p.name} className="w-full h-full object-cover"  />
                      </div>
                      <p className="font-bold text-sm mt-3 leading-snug line-clamp-2 hover:text-brand transition">{p.name}</p>
                    </Link>
                    <div className="flex items-center gap-1.5 mt-2">
                      <RatingStars rating={p.rating} size={12} />
                      <span className="text-[10px] text-muted">({p.reviewCount.toLocaleString()})</span>
                    </div>
                    <p className="font-display font-extrabold text-xl text-gradient mt-2">{formatPrice(p.price)}</p>
                    {p.compareAtPrice && <p className="text-[11px] text-muted line-through">{formatPrice(p.compareAtPrice)}</p>}
                    <div className="flex gap-1.5 mt-3">
                      <Link href={`/api/click/${p.slug}`} target="_blank" rel="sponsored" className="flex-1 h-9 rounded-xl bg-fg text-bg dark:bg-white dark:text-[#0a0812] text-[11px] font-extrabold items-center justify-center flex hover:opacity-90 transition">
                        Lowest listed
                      </Link>
                      <Link href={`/products/${p.slug}`} className="h-9 px-3 rounded-xl bg-brand/10 text-brand text-[11px] font-extrabold items-center justify-center flex hover:bg-brand/20 transition">
                        Details
                      </Link>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label="Store">
              {products.map((p) => <Cell key={p.id}>{p.store}</Cell>)}
            </Row>
            <Row label="Verdict">
              {products.map((p) => {
                const best = Math.max(...products.map((x) => x.rating));
                return <Cell key={p.id} highlight={p.rating === best}>{p.rating === best ? "🏆 Top rated" : "—"}</Cell>;
              })}
            </Row>
            <Row label="Best for price">
              {products.map((p) => {
                const cheapest = Math.min(...products.map((x) => x.price));
                return <Cell key={p.id} highlight={p.price === cheapest}>{p.price === cheapest ? "💰 Budget pick" : "—"}</Cell>;
              })}
            </Row>
            {Array.from(allSpecs).map((spec) => (
              <Row key={spec} label={spec}>
                {products.map((p) => <Cell key={p.id}>{p.specs[spec] ?? <Minus size={12} className="text-muted/50 mx-auto" />}</Cell>)}
              </Row>
            ))}
            <Row label="Pros">
              {products.map((p) => (
                <Cell key={p.id}>
                  <ul className="space-y-1.5">
                    {p.pros.map((pr) => (
                      <li key={pr} className="flex items-start gap-1.5 text-xs text-muted"><Check size={12} className="text-emerald-700 dark:text-emerald-300 mt-0.5 shrink-0" /> {pr}</li>
                    ))}
                  </ul>
                </Cell>
              ))}
            </Row>
            <Row label="Description">
              {products.map((p) => <Cell key={p.id}><p className="text-xs text-muted leading-relaxed line-clamp-4">{p.description}</p></Cell>)}
            </Row>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td className="p-3 text-xs font-bold uppercase tracking-wider text-muted border-b border-line align-top pt-4">{label}</td>
      {children}
    </tr>
  );
}

function Cell({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <td className={`p-3 border-b border-line text-sm align-top ${highlight ? "bg-emerald-500/5" : ""}`}>
      <div className={highlight ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>{children}</div>
    </td>
  );
}