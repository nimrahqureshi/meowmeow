import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { products, brands, categories } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { Catalog } from "@/components/catalog/Catalog";
import { SITE_URL } from "@/lib/utils";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [brand] = await db.select().from(brands).where(eq(brands.slug, slug)).limit(1);
  if (!brand) return { title: "Brand not found" };
  const title = `${brand.name}${brand.tagline ? ` — ${brand.tagline}` : ""}`;
  const description =
    brand.description ||
    `Shop ${brand.name} products on MeowMeow. Compare offers, track prices, and find the best deal.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/brand/${slug}` },
    openGraph: { title, description, url: `/brand/${slug}`, type: "website" },
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const [brand] = await db.select().from(brands).where(eq(brands.slug, slug)).limit(1);
  if (!brand) notFound();

  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.brandId, brand.id), eq(products.published, true)))
    .orderBy(desc(products.rating))
    .limit(48);

  const allCats = await db.select({ id: categories.id, slug: categories.slug, name: categories.name, emoji: categories.emoji, isCollection: categories.isCollection }).from(categories);
  const brandRows = await db.select({ id: brands.id, slug: brands.slug, name: brands.name }).from(brands).limit(40);

  const cards = rows.map((p) => ({
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
  }));

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Products", item: `${SITE_URL}/products` },
      { "@type": "ListItem", position: 3, name: brand.name, item: `${SITE_URL}/brand/${slug}` },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      <JsonLd data={breadcrumbLd} />
      <nav className="text-sm text-muted mb-4" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-fg transition">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/products" className="hover:text-fg transition">
              Products
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-fg font-medium" aria-current="page">
            {brand.name}
          </li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">{brand.name}</h1>
        {brand.tagline && <p className="mt-2 text-lg text-muted">{brand.tagline}</p>}
        {brand.description && <p className="mt-3 text-muted max-w-2xl leading-relaxed">{brand.description}</p>}
        <p className="mt-2 text-sm text-muted">{rows.length} product{rows.length === 1 ? "" : "s"}</p>
      </header>

      <Catalog
        categories={allCats}
        brands={brandRows}
        initial={{ category: "", tag: "", q: "", brand: slug, min: "", max: "", rating: "", sort: "rating" }}
        initialProducts={cards}
      />
    </div>
  );
}
