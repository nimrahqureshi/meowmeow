"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { History } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { parseJson, useStorageValue, writeStorage } from "@/lib/client-store";
import { RatingStars } from "@/components/ui";
import SmartImage from "@/components/SmartImage";

export interface RecentEntry {
  id: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  rating: number;
}

const KEY = "mm-recent";

/**
 * "Recently viewed" rail. The product page passes the full current product so
 * we persist real data (image, price, rating) instead of scraping the DOM.
 * Reads are SSR-safe via the external storage hook; the write is a pure
 * side-effect with no state updates, so it's compiler-clean.
 */
export default function RecentlyViewed({ current }: { current: RecentEntry }) {
  const raw = useStorageValue(KEY);
  const items = useMemo(
    () => parseJson<RecentEntry[]>(raw, []).filter((s) => s.id !== current.id).slice(0, 6),
    [raw, current.id]
  );

  useEffect(() => {
    const stored = parseJson<RecentEntry[]>(localStorage.getItem(KEY), []);
    const next = [current, ...stored.filter((s) => s.id !== current.id)].slice(0, 8);
    writeStorage(KEY, JSON.stringify(next));
  }, [current]);

  if (items.length === 0) return null;

  return (
    <section className="mt-20">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center"><History size={16} /></span>
        <h2 className="font-display font-bold text-xl">Recently viewed</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((p) => (
          <Link key={p.id} href={`/products/${p.slug}`} className="shrink-0 w-40 glass rounded-2xl overflow-hidden card-hover group">
            <div className="aspect-square bg-soft overflow-hidden">
              <SmartImage src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold line-clamp-2 leading-snug">{p.name}</p>
              <div className="flex items-center justify-between mt-1.5">
                {p.price > 0 && <p className="text-sm font-bold text-brand">{formatPrice(p.price)}</p>}
                {p.rating > 0 && <RatingStars rating={p.rating} size={10} />}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
