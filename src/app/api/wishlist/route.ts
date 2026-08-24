import { NextResponse } from "next/server";
import { db } from "@/db";
import { wishlistItems, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionId } from "@/lib/session";
import { badRequest, notFound, parseId, readJson } from "@/lib/validation";

export async function GET() {
  const sessionId = await getSessionId();
  const rows = await db
    .select({ id: wishlistItems.id, product: products })
    .from(wishlistItems)
    .innerJoin(products, eq(wishlistItems.productId, products.id))
    .where(eq(wishlistItems.sessionId, sessionId));
  return NextResponse.json({ items: rows.map((r) => r.product) });
}

export async function POST(req: Request) {
  const sessionId = await getSessionId();
  const body = await readJson<{ productId?: unknown }>(req);
  const productId = parseId(body?.productId);
  if (!productId) return badRequest("A valid productId is required");

  const product = await db.select({ id: products.id }).from(products).where(eq(products.id, productId)).limit(1);
  if (!product[0]) return notFound("Product not found");

  const existing = await db
    .select()
    .from(wishlistItems)
    .where(and(eq(wishlistItems.sessionId, sessionId), eq(wishlistItems.productId, productId)))
    .limit(1);
  if (!existing[0]) {
    await db.insert(wishlistItems).values({ sessionId, productId });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const sessionId = await getSessionId();
  const body = await readJson<{ productId?: unknown }>(req);
  const productId = parseId(body?.productId);
  if (!productId) return badRequest("A valid productId is required");
  await db.delete(wishlistItems).where(and(eq(wishlistItems.sessionId, sessionId), eq(wishlistItems.productId, productId)));
  return NextResponse.json({ ok: true });
}
