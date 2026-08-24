import { Suspense } from "react";
import { db } from "@/db";
import { products, categories, brands } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { Catalog } from "@/components/catalog/Catalog";
import { SkeletonCard } from "@/components/ui";

const toCard = (p: typeof products.$inferSelect) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  price: p.price,
  compareAtPrice: p.compareAtPrice,
  rating: p.rating,
  reviewCount: p.reviewCount,
  images: p.images,
  badges: p.badges,
  color: p.color,
  store: p.store,
  inStock: p.inStock,
});

/**
 * Filter state lives in the query string, so every combination of category,
 * brand, price band and sort order is a distinct crawlable URL for the same
 * catalogue. Canonicalising to the category (or the bare catalogue) collapses
 * those permutations into one indexable page and stops them consuming crawl
 * budget as duplicate content.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string; q?: string }>;
}) {
  const { category, tag, q } = await searchParams;
  const canonical = category
    ? `/products?category=${category}`
    : tag
      ? `/products?tag=${tag}`
      : "/products";

  const title = q ? `Search results for “${q}”` : category ? `${category.replace(/-/g, " ")}` : tag ? `${tag.replace(/-/g, " ")}` : "Shop everything";

  return {
    title,
    description: "Browse the full MeowMeow catalogue — filter by category, brand, price and rating, and compare products side by side.",
    alternates: { canonical },
    // Keyword-search result pages shouldn't be indexed, but their links should
    // still be followed through to the products themselves.
    robots: q ? { index: false, follow: true } : undefined,
    openGraph: { title: `${title} · MeowMeow`, url: canonical },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string; q?: string; brand?: string; min?: string; max?: string; rating?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const [cats, brandRows] = await Promise.all([db.select().from(categories).orderBy(categories.sortOrder), db.select().from(brands).orderBy(brands.name)]);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">The catalog</p>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-1">
          {params.q ? `Results for “${params.q}”` : params.tag ? `${params.tag.replace(/-/g, " ")}` : "Shop everything"}
        </h1>
        <p className="text-muted text-sm mt-2">Every product below was tested by our editors and tracked for 90 days of price history.</p>
      </div>

      <Suspense fallback={<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}</div>}>
        <Catalog
          categories={cats}
          brands={brandRows}
          initial={{
            category: params.category ?? "",
            tag: params.tag ?? "",
            q: params.q ?? "",
            brand: params.brand ?? "",
            min: params.min ?? "",
            max: params.max ?? "",
            rating: params.rating ?? "",
            sort: params.sort ?? "popular",
          }}
          initialProducts={[]}
        />
      </Suspense>
    </div>
  );
}
