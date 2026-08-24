import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { products, categories, brands } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { Catalog } from "@/components/catalog/Catalog";
import { SITE_URL } from "@/lib/utils";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [cat] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  if (!cat) return { title: "Category not found" };
  const title = `${cat.name} — Shop curated picks`;
  const description =
    cat.description ||
    `Browse ${cat.name} on MeowMeow. Compare prices across merchants, read specs, and find the best deal.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/category/${slug}` },
    openGraph: {
      title,
      description,
      url: `/category/${slug}`,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [cat] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  if (!cat) notFound();

  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.categoryId, cat.id), eq(products.published, true)))
    .orderBy(desc(products.rating))
    .limit(48);

  const brandRows = await db.select({ id: brands.id, slug: brands.slug, name: brands.name }).from(brands).limit(40);
  const allCats = await db.select({ id: categories.id, slug: categories.slug, name: categories.name, emoji: categories.emoji, isCollection: categories.isCollection }).from(categories);

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
      { "@type": "ListItem", position: 3, name: cat.name, item: `${SITE_URL}/category/${slug}` },
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
            {cat.name}
          </li>
        </ol>
      </nav>

      <header className="mb-8">
        <p className="text-3xl mb-2" aria-hidden="true">
          {cat.emoji}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">{cat.name}</h1>
        {cat.description && <p className="mt-3 text-muted max-w-2xl leading-relaxed">{cat.description}</p>}
        <p className="mt-2 text-sm text-muted">{rows.length} product{rows.length === 1 ? "" : "s"}</p>
      </header>

      {brandRows.length > 0 && (
        <section className="mb-8" aria-labelledby="brands-heading">
          <h2 id="brands-heading" className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
            Popular brands
          </h2>
          <div className="flex flex-wrap gap-2">
            {brandRows.slice(0, 12).map((b) => (
              <Link
                key={b.id}
                href={`/brand/${b.slug}`}
                className="px-3 py-1.5 rounded-full border border-border text-sm hover:bg-muted/40 transition"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <Catalog
        categories={allCats}
        brands={brandRows}
        initial={{ category: slug, tag: "", q: "", brand: "", min: "", max: "", rating: "", sort: "rating" }}
        initialProducts={cards}
      />
    </div>
  );
}
