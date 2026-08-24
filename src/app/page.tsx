import { db } from "@/db";
import { products, categories, blogPosts, clicks, brands } from "@/db/schema";
import { desc, sql, count } from "drizzle-orm";
import Hero from "@/components/home/Hero";
import { FlashSale, ProductRail, CategoryGrid, PlatformStats, FAQ, BlogPreview, PinterestStrip } from "@/components/home/Sections";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/utils";

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
 * Incremental regeneration: the homepage renders live pricing and flash-sale
 * discounts, so it must not stay frozen at the build-time snapshot. Ten
 * minutes keeps it cheap to serve while staying accurate enough to advertise
 * a price against.
 */
export const revalidate = 600;

export const metadata = {
  title: "MeowMeow — Find Better Deals, Faster",
  description:
    "A curated affiliate shopping platform. Browse hand-picked products across fashion, tech, beauty and home, compare them side by side, and jump straight to the merchant.",
};

export default async function HomePage() {
  const [all, cats, blogs, clickCount, brandCount, stats] = await Promise.all([
    db.select().from(products).orderBy(desc(products.rating)),
    db.select().from(categories).orderBy(categories.sortOrder),
    db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt)).limit(5),
    db.select({ c: count() }).from(clicks),
    db.select({ c: count() }).from(brands),
    db
      .select({
        total: count(),
        avgRating: sql<number>`avg(${products.rating})`,
        min: sql<number>`min(${products.price})`,
        max: sql<number>`max(${products.price})`,
      })
      .from(products),
  ]);

  const deals = all.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);
  const trending = all.filter((p) => p.trending).slice(0, 12);
  const bestSellers = all.filter((p) => p.bestSeller).slice(0, 12);
  const premium = all.filter((p) => p.tags.includes("premium")).slice(0, 12);
  const aiPicks = [...all].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 10);

  const feedImages = [...cats.filter((c) => c.image && !c.isCollection).map((c) => c.image as string), ...all.slice(0, 3).flatMap((p) => p.images)].slice(0, 12);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MeowMeow",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Hero />

      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <FlashSale products={deals.slice(0, 8).map(toCard)} />
        <ProductRail
          products={trending.map(toCard)}
          title="Trending now"
          eyebrow="Hot this week"
          href="/products?tag=trending"
          gradient="from-orange-500 to-rose-500"
        />
        <CategoryGrid categories={cats} />
        <ProductRail
          products={bestSellers.map(toCard)}
          title="Best sellers"
          eyebrow="Community favorites"
          href="/products?tag=best-sellers"
          gradient="from-amber-500 to-yellow-500"
        />
        <ProductRail
          products={premium.map(toCard)}
          title="Premium picks"
          eyebrow="The investment tier"
          href="/products?tag=premium-picks"
          gradient="from-violet-500 to-fuchsia-500"
        />
        <ProductRail
          products={aiPicks.map(toCard)}
          title="AI picks for you"
          eyebrow="Recommended by Meow"
          href="/products"
          gradient="from-cyan-500 to-blue-500"
        />
        <PlatformStats
          products={stats[0]?.total ?? 0}
          categories={cats.length}
          merchants={brandCount[0]?.c ?? 0}
          clicks={clickCount[0]?.c ?? 0}
        />
        <BlogPreview
          posts={blogs.map((b) => ({
            slug: b.slug,
            title: b.title,
            excerpt: b.excerpt,
            cover: b.cover,
            author: b.author,
            readTime: b.readTime,
            tags: b.tags,
            publishedAt: b.publishedAt.toISOString(),
          }))}
        />
        <FAQ />
        <PinterestStrip images={feedImages} />
      </div>
    </>
  );
}
