import { redirect } from "next/navigation";
import { db } from "@/db";
import { products, categories, brands, users, coupons, clicks, reviews, newsletterSubscribers, messages, blogPosts } from "@/db/schema";
import { desc, count, eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import AdminClient from "@/components/admin/AdminClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin dashboard", description: "MeowMeow admin — analytics, products, coupons, users." };

export default async function AdminPage() {
  // Authorisation reads the current role from the database — a token issued
  // while the account was an admin must not outlive the privilege.
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") redirect("/login");

  const [
    productRows,
    catRows,
    brandRows,
    userRows,
    couponRows,
    clickRows,
    reviewCount,
    subRows,
    msgRows,
    blogCount,
  ] = await Promise.all([
    db.select().from(products).orderBy(desc(products.reviewCount)),
    db.select().from(categories).orderBy(categories.sortOrder),
    db.select().from(brands).orderBy(brands.name),
    db.select().from(users).orderBy(desc(users.createdAt)),
    db.select().from(coupons).orderBy(desc(coupons.active)),
    db.select({ productId: clicks.productId, c: count() }).from(clicks).groupBy(clicks.productId),
    db.select({ c: count() }).from(reviews),
    db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt)),
    db.select().from(messages).orderBy(desc(messages.createdAt)),
    db.select({ c: count() }).from(blogPosts),
  ]);

  const totalClicks = clickRows.reduce((a, r) => a + Number(r.c), 0);
  const clickMap = new Map(clickRows.map((r) => [r.productId, Number(r.c)]));
  const enriched = productRows.map((p) => ({ ...p, clicks: clickMap.get(p.id) ?? 0 })).sort((a, b) => b.clicks - a.clicks);

  return (
    <AdminClient
      products={enriched.map((p) => ({ id: p.id, name: p.name, price: p.price, rating: p.rating, reviewCount: p.reviewCount, store: p.store, clicks: p.clicks, slug: p.slug }))}
      categories={catRows.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji, slug: c.slug, isCollection: c.isCollection }))}
      brands={brandRows.map((b) => ({ id: b.id, name: b.name }))}
      users={userRows.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt.toISOString() }))}
      coupons={couponRows.map((c) => ({ id: c.id, code: c.code, title: c.title, discountType: c.discountType, value: c.value, active: c.active, validUntil: c.validUntil?.toISOString() ?? null }))}
      subscribers={subRows.map((s) => ({ id: s.id, email: s.email, createdAt: s.createdAt.toISOString() }))}
      messages={msgRows.map((m) => ({ id: m.id, name: m.name, email: m.email, subject: m.subject, body: m.body, createdAt: m.createdAt.toISOString() }))}
      stats={{
        products: productRows.length,
        users: userRows.length,
        clicks: totalClicks,
        reviews: Number(reviewCount[0]?.c ?? 0),
        subscribers: subRows.length,
        messages: msgRows.length,
        blogs: Number(blogCount[0]?.c ?? 0),
        avgRating: productRows.length ? productRows.reduce((a, p) => a + p.rating, 0) / productRows.length : 0,
        inventory: productRows.reduce((a, p) => a + (p.inStock ? 1 : 0), 0),
      }}
      topByClicks={enriched.slice(0, 10).map((p) => ({ name: p.name, clicks: p.clicks, price: p.price }))}
      topByRevenue={[]}
    />
  );
}
