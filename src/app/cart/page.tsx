import { db } from "@/db";
import { cartItems, products, coupons } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionId } from "@/lib/session";
import CartClient from "@/components/cart/CartClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Your cart", description: "Review your saved products before heading to the best store." };

export default async function CartPage() {
  const sessionId = await getSessionId();
  const [rows, activeCoupons] = await Promise.all([
    db
      .select({ id: cartItems.id, qty: cartItems.qty, product: products })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.sessionId, sessionId)),
    db.select().from(coupons).where(eq(coupons.active, true)),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">Your cart</p>
      <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-1">Saved for later</h1>
      <p className="text-muted text-sm mt-2">MeowMeow doesn&apos;t take payment. Save what interests you here, then buy from the retailer when you&apos;re ready.</p>
      <CartClient
        initial={rows.map((r) => ({ id: r.id, qty: r.qty, product: { ...r.product, images: r.product.images, badges: r.product.badges, specs: r.product.specs } }))}
        coupons={activeCoupons.map((c) => ({ code: c.code, title: c.title, discountType: c.discountType, value: c.value, minSpend: c.minSpend }))}
      />
    </div>
  );
}
