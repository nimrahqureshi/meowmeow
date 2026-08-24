import { NextResponse } from "next/server";
import { db } from "@/db";
import { cartItems, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionId } from "@/lib/session";
import { badRequest, notFound, parseCount, parseId, readJson } from "@/lib/validation";

export async function GET() {
  const sessionId = await getSessionId();
  const rows = await db
    .select({
      id: cartItems.id,
      qty: cartItems.qty,
      product: products,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.sessionId, sessionId));

  const subtotal = rows.reduce((a, r) => a + r.product.price * r.qty, 0);
  const savings = rows.reduce((a, r) => a + ((r.product.compareAtPrice ?? r.product.price) - r.product.price) * r.qty, 0);
  return NextResponse.json({ items: rows, subtotal, savings });
}

export async function POST(req: Request) {
  const sessionId = await getSessionId();
  const body = await readJson<{ productId?: unknown; qty?: unknown }>(req);
  if (!body) return badRequest("Invalid request body");

  const productId = parseId(body.productId);
  if (!productId) return badRequest("A valid productId is required");
  const qty = parseCount(body.qty, { min: 1, max: 99, fallback: 1 });

  // Confirm the product exists so a bad id is a 404 rather than a foreign-key
  // violation surfacing as a 500.
  const product = await db.select({ id: products.id }).from(products).where(eq(products.id, productId)).limit(1);
  if (!product[0]) return notFound("Product not found");

  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.sessionId, sessionId), eq(cartItems.productId, productId)))
    .limit(1);

  if (existing[0]) {
    await db.update(cartItems).set({ qty: Math.min(99, existing[0].qty + qty) }).where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({ sessionId, productId, qty });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const sessionId = await getSessionId();
  const body = await readJson<{ productId?: unknown }>(req);
  const productId = parseId(body?.productId);
  if (!productId) return badRequest("A valid productId is required");
  await db.delete(cartItems).where(and(eq(cartItems.sessionId, sessionId), eq(cartItems.productId, productId)));
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const sessionId = await getSessionId();
  const body = await readJson<{ productId?: unknown; qty?: unknown }>(req);
  if (!body) return badRequest("Invalid request body");

  const productId = parseId(body.productId);
  if (!productId) return badRequest("A valid productId is required");
  // 0 removes the line; anything non-numeric is rejected rather than coerced.
  const qty = parseCount(body.qty, { min: 0, max: 99, fallback: -1 });
  if (qty < 0) return badRequest("A valid qty is required");

  if (qty === 0) {
    await db.delete(cartItems).where(and(eq(cartItems.sessionId, sessionId), eq(cartItems.productId, productId)));
  } else {
    await db
      .update(cartItems)
      .set({ qty })
      .where(and(eq(cartItems.sessionId, sessionId), eq(cartItems.productId, productId)));
  }
  return NextResponse.json({ ok: true });
}
