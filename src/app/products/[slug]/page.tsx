import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { products, categories, reviews, priceHistory, coupons, brands } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { ChevronRight, Check, X as XIcon, Truck } from "lucide-react";
import Gallery from "@/components/product/Gallery";
import BuyBox from "@/components/product/BuyBox";
import PriceChart from "@/components/product/PriceChart";
import Reviews from "@/components/product/Reviews";
import RecentlyViewed from "@/components/product/RecentlyViewed";
import ProductCard from "@/components/ProductCard";
import { JsonLd } from "@/components/JsonLd";
import { SectionHeader } from "@/components/ui";
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = (await db.select().from(products).where(eq(products.slug, slug)).limit(1))[0];
  // notFound() here (rather than only in the page body) aborts before the
  // response begins streaming, so the status really is 404.
  if (!product) notFound();
  const path = `/products/${product.slug}`;
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    // Without this, any tracking or referral query string on a product link
    // becomes a separate indexable duplicate of the same page.
    alternates: { canonical: path },
    openGraph: {
      title: `${product.name} · MeowMeow`,
      description: product.description.slice(0, 160),
      url: path,
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
      // Next rejects "product" as an OpenGraph type and throws, which silently
      // discarded the entire metadata object for every product page — no title,
      // description, canonical or card. Product semantics are carried by the
      // Product JSON-LD below, which is what search engines actually consume.
      type: "website",
    },
    twitter: { card: "summary_large_image", title: product.name, images: product.images[0] ? [product.images[0]] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = (await db.select().from(products).where(eq(products.slug, slug)).limit(1))[0];
  if (!product) notFound();

  const [cat, brand, reviewRows, history, activeCoupons, related] = await Promise.all([
    product.categoryId ? db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1) : Promise.resolve([]),
    product.brandId ? db.select().from(brands).where(eq(brands.id, product.brandId)).limit(1) : Promise.resolve([]),
    db.select().from(reviews).where(eq(reviews.productId, product.id)).orderBy(desc(reviews.createdAt)).limit(30),
    db.select().from(priceHistory).where(eq(priceHistory.productId, product.id)).orderBy(priceHistory.date),
    db.select().from(coupons).where(eq(coupons.active, true)).limit(3),
    product.categoryId
      ? db.select().from(products).where(sql`${products.categoryId} = ${product.categoryId} AND ${products.id} != ${product.id}`).orderBy(desc(products.rating)).limit(8)
      : Promise.resolve([]),
  ]);

  const coupon = activeCoupons[0] ?? null;
  const chartData = history.map((h) => ({ date: h.date.toISOString(), price: h.price }));
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: cat[0]?.name ?? "Shop", item: `${SITE_URL}/products?category=${cat[0]?.slug ?? ""}` },
      { "@type": "ListItem", position: 3, name: product.name },
    ],
  };
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: String(product.id),
    brand: { "@type": "Brand", name: brand[0]?.name ?? product.store },
    // Ratings and reviews in the demo catalogue are sample data. Publishing
    // them as AggregateRating/Review would assert to search engines that they
    // are genuine customer feedback — which is both untrue and a review-snippet
    // policy violation. They are omitted entirely while demo mode is on.
    ...(isDemo
      ? {}
      : {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
          review: reviewRows.slice(0, 5).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            reviewRating: { "@type": "Rating", ratingValue: r.rating },
            reviewBody: r.body,
          })),
        }),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: "USD",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: product.store },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={productJsonLd} />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted mb-6 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-brand font-medium inline-flex items-center min-h-6">Home</Link>
        <ChevronRight size={12} />
        <Link href={`/products?category=${cat[0]?.slug ?? ""}`} className="hover:text-brand font-medium inline-flex items-center min-h-6">{cat[0]?.name ?? "Shop"}</Link>
        <ChevronRight size={12} />
        <span className="text-fg font-semibold truncate max-w-[220px]">{product.name}</span>
      </nav>

      {/* Top grid */}
      <div className="grid lg:grid-cols-[1fr_440px] gap-8 xl:gap-12">
        <div className="min-w-0">
          <Gallery images={product.images} name={product.name} />
        </div>
        <div className="min-w-0">
          <BuyBox
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              rating: product.rating,
              reviewCount: product.reviewCount,
              store: product.store,
              badges: product.badges,
              inStock: product.inStock,
              description: product.description,
            affiliateUrl: product.affiliateUrl,
            }}
            coupon={coupon ? { code: coupon.code, title: coupon.title, value: coupon.value, discountType: coupon.discountType } : null}
          />
        </div>
      </div>

      {/* Info columns */}
      <div className="grid lg:grid-cols-[1fr_440px] gap-8 xl:gap-12 mt-10">
        <div className="space-y-8 min-w-0">
          {/* Description */}
          <section className="glass rounded-3xl p-6 md:p-8">
            <h2 className="font-display font-bold text-xl mb-3">About this product</h2>
            <p className="text-sm text-muted leading-relaxed">{product.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {product.tags.map((t) => (
                <Link key={t} href={`/products?tag=${t}`} className="text-[11px] font-bold px-3 py-1 rounded-full bg-soft hover:bg-brand/10 hover:text-brand transition">
                  #{t}
                </Link>
              ))}
            </div>
          </section>

          {/* Pros & Cons */}
          <div className="grid sm:grid-cols-2 gap-4">
            <section className="rounded-3xl border border-emerald-500/25 bg-emerald-500/5 p-6">
              <h3 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2"><Check size={16} /> Pros — after 200h of testing</h3>
              <ul className="space-y-2.5">
                {product.pros.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-muted"><Check size={14} className="text-emerald-700 dark:text-emerald-300 mt-0.5 shrink-0" /> {p}</li>
                ))}
              </ul>
            </section>
            <section className="rounded-3xl border border-rose-500/25 bg-rose-500/5 p-6">
              <h3 className="font-bold text-sm text-rose-700 dark:text-rose-300 mb-3 flex items-center gap-2"><XIcon size={16} /> Cons — be honest with yourself</h3>
              <ul className="space-y-2.5">
                {product.cons.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-muted"><XIcon size={14} className="text-rose-700 dark:text-rose-300 mt-0.5 shrink-0" /> {c}</li>
                ))}
              </ul>
            </section>
          </div>

          {/* Specs */}
          <section className="glass rounded-3xl p-6 md:p-8">
            <h2 className="font-display font-bold text-xl mb-4">Specifications</h2>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2 border-b border-line/60">
                  <dt className="text-sm text-muted">{k}</dt>
                  <dd className="text-sm font-semibold text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Reviews */}
          <Reviews
            productId={product.id}
            initial={reviewRows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
        </div>

        {/* Side column */}
        <div className="space-y-8 min-w-0">
          <PriceChart history={chartData} current={product.price} />

          <div className="glass rounded-3xl p-6">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Truck size={16} className="text-brand" /> Why buy through MeowMeow?</h3>
            <ul className="space-y-3 text-sm text-muted">
              <li className="flex gap-2.5"><span className="text-brand">①</span> We route you to the merchant with the best total price today.</li>
              <li className="flex gap-2.5"><span className="text-brand">②</span> Your cart & wishlist follow you across devices.</li>
              <li className="flex gap-2.5"><span className="text-brand">③</span> Save it to your wishlist to find it again quickly.</li>
              <li className="flex gap-2.5"><span className="text-brand">④</span> We earn a commission — you never pay more.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeader eyebrow="You might also like" title={`More from ${cat[0]?.name ?? "the catalog"}`} href={`/products?category=${cat[0]?.slug ?? ""}`} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={toCard(p)} index={i} />
            ))}
          </div>
        </section>
      )}

      <RecentlyViewed current={{ id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.images[0] ?? "", rating: product.rating }} />
    </div>
  );
}
