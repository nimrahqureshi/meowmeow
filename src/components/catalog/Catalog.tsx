"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X, Star, ChevronDown, SearchX, Loader2 } from "lucide-react";
import ProductCard, { type CardProduct } from "@/components/ProductCard";
import { EmptyState, SkeletonCard } from "@/components/ui";
import { cn } from "@/lib/utils";
import { CategoryIcon, stripEmoji } from "@/lib/category-icons";

export interface FilterState {
  category: string;
  tag: string;
  q: string;
  brand: string;
  min: string;
  max: string;
  rating: string;
  sort: string;
}

const PRICE_BUCKETS = [
  { label: "Under $50", min: "", max: "50" },
  { label: "$50 – $150", min: "50", max: "150" },
  { label: "$150 – $400", min: "150", max: "400" },
  { label: "$400+", min: "400", max: "" },
];

const SORTS = [
  { value: "popular", label: "Most reviewed" },
  { value: "rating", label: "Highest rated" },
  { value: "price-asc", label: "Price: low → high" },
  { value: "price-desc", label: "Price: high → low" },
  { value: "newest", label: "Newest" },
];

export function Catalog({
  categories,
  brands,
  initial,
  initialProducts,
}: {
  categories: { id: number; slug: string; name: string; emoji: string; isCollection: boolean }[];
  brands: { id: number; slug: string; name: string }[];
  initial: FilterState;
  initialProducts?: CardProduct[];
}) {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(initial);
  const [items, setItems] = useState<CardProduct[]>(initialProducts ?? []);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const pageRef = useRef(1);
  const firstLoad = useRef(true);

  const buildQuery = useCallback(
    (f: FilterState, page = 1, size = 24) => {
      const body: Record<string, unknown> = { page, pageSize: size, sort: f.sort || "popular" };
      if (f.category) body.category = f.category;
      if (f.tag) body.tag = f.tag;
      if (f.q) body.q = f.q;
      if (f.brand) body.brand = f.brand;
      if (f.min) body.min = Number(f.min);
      if (f.max) body.max = Number(f.max);
      if (f.rating) body.rating = Number(f.rating);
      return body;
    },
    []
  );

  const fetchPage = useCallback(
    async (f: FilterState, page: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildQuery(f, page)),
        });
        const data = await res.json();
        setItems((prev) => (append ? [...prev, ...data.products] : data.products));
        setTotal(data.total ?? 0);
        pageRef.current = page;
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildQuery]
  );

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      fetchPage(initial, 1, false);
    }
  }, [initial, fetchPage]);

  const applyFilters = (next: FilterState) => {
    setFilters(next);
    fetchPage(next, 1, false);
    const sp = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => v && sp.set(k, v));
    router.replace(`/products${sp.toString() ? `?${sp.toString()}` : ""}`, { scroll: false });
  };

  const toggle = (key: keyof FilterState, value: string) => {
    const next = { ...filters, [key]: filters[key] === value ? "" : value };
    applyFilters(next);
  };

  const activeCount = Object.values(filters).filter(Boolean).length;

  const filterPanel = (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3">Category</p>
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          <button onClick={() => toggle("category", "")} className={cn("w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition", !filters.category ? "bg-brand/10 text-brand font-bold" : "hover:bg-soft")}>
            All categories
          </button>
          {categories.filter((c) => !c.isCollection).map((c) => (
            <button key={c.id} onClick={() => toggle("category", c.slug)} className={cn("w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2", filters.category === c.slug ? "bg-brand/10 text-brand font-bold" : "hover:bg-soft")}>
              <CategoryIcon slug={c.slug} size={12} /> {stripEmoji(c.name)}
            </button>
          ))}
        </div>
      </div>

      {/* Collections */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3">Collections</p>
        <div className="flex flex-wrap gap-1.5">
          {categories.filter((c) => c.isCollection).map((c) => (
            <button key={c.id} onClick={() => toggle("tag", c.slug)} className={cn("px-3 py-1.5 rounded-full text-xs font-bold border transition inline-flex items-center gap-1.5", filters.tag === c.slug ? "bg-gradient-to-r from-brand to-brand-2 text-white border-transparent" : "border-line hover:border-brand/40")}>
              <CategoryIcon slug={c.slug} size={12} /> {stripEmoji(c.name)}
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3">Brand</p>
        <div className="space-y-1">
          <button onClick={() => toggle("brand", "")} className={cn("w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition", !filters.brand ? "bg-brand/10 text-brand font-bold" : "hover:bg-soft")}>
            All brands
          </button>
          {brands.map((b) => (
            <button key={b.id} onClick={() => toggle("brand", b.slug)} className={cn("w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition", filters.brand === b.slug ? "bg-brand/10 text-brand font-bold" : "hover:bg-soft")}>
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3">Price</p>
        <div className="flex flex-wrap gap-1.5">
          {PRICE_BUCKETS.map((b) => (
            <button
              key={b.label}
              onClick={() => togglePrice(b.min, b.max)}
              className={cn("px-3 py-1.5 rounded-full text-xs font-bold border transition", filters.min === b.min && filters.max === b.max ? "bg-brand/10 text-brand border-brand/40" : "border-line hover:border-brand/40")}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3">Rating</p>
        <div className="space-y-1">
          {[4.5, 4, 3].map((r) => (
            <button key={r} onClick={() => toggle("rating", String(r))} className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition", filters.rating === String(r) ? "bg-brand/10 text-brand font-bold" : "hover:bg-soft")}>
              <span className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} fill="currentColor" strokeWidth={0} className={i < Math.floor(r) ? "" : "opacity-25"} />
                ))}
              </span>
              {r}+
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const togglePrice = (min: string, max: string) => {
    if (filters.min === min && filters.max === max) applyFilters({ ...filters, min: "", max: "" });
    else applyFilters({ ...filters, min, max });
  };

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-8">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-28 glass rounded-3xl p-5 max-h-[calc(100vh-130px)] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-sm flex items-center gap-2"><SlidersHorizontal size={16} /> Filters {activeCount > 0 && <span className="text-[10px] bg-brand text-white rounded-full px-1.5 py-0.5">{activeCount}</span>}</p>
            {activeCount > 0 && (
              <button onClick={() => applyFilters({ category: "", tag: "", q: "", brand: "", min: "", max: "", rating: "", sort: "popular" })} className="text-[11px] font-bold text-brand hover:underline min-h-[24px] px-2 -mr-2 inline-flex items-center rounded-lg">
                Clear all
              </button>
            )}
          </div>
          {filterPanel}
        </div>
      </aside>

      {/* Main */}
      <div>
        {/* Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6 min-w-0">
          <button onClick={() => setMobileFilters(true)} className="lg:hidden h-10 px-3 sm:px-4 rounded-xl glass flex items-center gap-2 text-sm font-bold shrink-0">
            <SlidersHorizontal size={16} /> Filters {activeCount > 0 && <span className="text-[10px] bg-brand text-white rounded-full px-1.5">{activeCount}</span>}
          </button>
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <select
              value={filters.sort}
              onChange={(e) => applyFilters({ ...filters, sort: e.target.value })}
              className="appearance-none w-full sm:w-auto h-10 pl-3 sm:pl-4 pr-9 rounded-xl glass text-sm font-semibold cursor-pointer truncate focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              aria-label="Sort products"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
          </div>
          <p className="ml-auto text-sm text-muted hidden sm:block">{total.toLocaleString()} products</p>
        </div>

        {/* Active filter chips */}
        {activeCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {Object.entries(filters).filter(([, v]) => v && v !== "popular").map(([k, v]) => (
              <button key={k} onClick={() => applyFilters({ ...filters, [k]: "" })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand/10 text-brand text-xs font-bold hover:bg-brand/20 transition">
                {k === "sort" ? "Sort" : k}: {v} <X size={12} />
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4" aria-busy="true">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No products match those filters"
            description="Try widening the price range, or clear a filter or two to see more results."
            action={{ label: "Clear all filters", onClick: () => applyFilters({ category: "", tag: "", q: "", brand: "", min: "", max: "", rating: "", sort: "popular" }) }}
          />
        ) : (
          <>
            <h2 className="sr-only">Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
            {items.length < total && (
              <div className="text-center mt-10">
                <button
                  onClick={() => fetchPage(filters, pageRef.current + 1, true)}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl glass font-bold text-sm hover:border-brand/40 hover:text-brand transition disabled:opacity-60"
                >
                  {loadingMore ? <Loader2 size={16} className="animate-spin" /> : null}
                  Load more ({total - items.length} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile filter drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[95] lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[300px] bg-bg p-5 overflow-y-auto pop-in">
            <div className="flex items-center justify-between mb-5">
              <p className="font-bold">Filters</p>
              <button onClick={() => setMobileFilters(false)} className="w-9 h-9 rounded-xl bg-soft flex items-center justify-center" aria-label="Close filters">
                <X size={16} />
              </button>
            </div>
            {filterPanel}
            <button onClick={() => setMobileFilters(false)} className="mt-6 w-full h-11 rounded-xl bg-gradient-to-r from-brand to-brand-2 text-white font-bold text-sm btn-shine">
              Show {total.toLocaleString()} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
