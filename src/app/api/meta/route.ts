import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, cartItems, wishlistItems, notifications, users, products } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSessionId } from "@/lib/session";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const sessionId = await getSessionId();
  const session = await getSessionUser();

  const [cats, cart, wish, notifs, user, featured] = await Promise.all([
    db.select().from(categories).orderBy(categories.sortOrder),
    db.select({ id: cartItems.id, productId: cartItems.productId, qty: cartItems.qty }).from(cartItems).where(eq(cartItems.sessionId, sessionId)),
    db.select({ id: wishlistItems.id, productId: wishlistItems.productId }).from(wishlistItems).where(eq(wishlistItems.sessionId, sessionId)),
    db.select().from(notifications).orderBy(notifications.createdAt).limit(6),
    session ? db.select({ id: users.id, name: users.name, email: users.email, role: users.role, avatar: users.avatar }).from(users).where(eq(users.id, session.uid)).limit(1) : Promise.resolve([]),
    // A small set of highly-rated products for the mega menu preview column.
    db
      .select({ id: products.id, slug: products.slug, name: products.name, price: products.price, images: products.images, color: products.color })
      .from(products)
      .orderBy(desc(products.rating))
      .limit(3),
  ]);

  return NextResponse.json({
    categories: cats,
    cartCount: cart.reduce((a, c) => a + c.qty, 0),
    wishlistCount: wish.length,
    wishlistIds: wish.map((w) => w.productId),
    notifications: notifs,
    user: user[0] ?? null,
    featured,
  });
}
