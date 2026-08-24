import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/utils";
import { db } from "@/db";
import { products, categories, brands, blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";

/** Regenerated hourly so new products and posts get indexed. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;
  const [prodRows, catRows, brandRows, blogRows] = await Promise.all([
    db
      .select({ slug: products.slug, updated: products.updatedAt })
      .from(products)
      .where(eq(products.published, true)),
    db.select({ slug: categories.slug }).from(categories),
    db.select({ slug: brands.slug }).from(brands),
    db.select({ slug: blogPosts.slug, updated: blogPosts.publishedAt }).from(blogPosts),
  ]);

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/affiliate-disclosure`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    ...catRows.map((c) => ({
      url: `${base}/category/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.85,
    })),
    ...brandRows.map((b) => ({
      url: `${base}/brand/${b.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...prodRows.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: p.updated,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...blogRows.map((b) => ({
      url: `${base}/blog/${b.slug}`,
      lastModified: b.updated,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
