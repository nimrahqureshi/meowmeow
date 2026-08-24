import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { clientKey, limit, tooMany } from "@/lib/rate-limit";
import { badRequest, notFound, parseCount, parseId, parseText, readJson } from "@/lib/validation";

export async function POST(req: Request) {
  const rl = limit(await clientKey("reviews"), { max: 6, windowMs: 300000 });
  if (!rl.ok) return tooMany(rl.retryAfter);

  const payload = await readJson<{ productId?: unknown; author?: unknown; rating?: unknown; title?: unknown; body?: unknown }>(req);
  if (!payload) return badRequest("Invalid request body");

  const productId = parseId(payload.productId);
  const author = parseText(payload.author, 60);
  const title = parseText(payload.title, 120);
  const text = parseText(payload.body, 2000);
  if (!productId || !author || !title || !text) {
    return badRequest("productId, author, title and body are all required");
  }
  // A non-numeric rating previously became NaN and hit the database as an
  // integer, producing a 500. Reject it instead of silently defaulting.
  const rating = parseCount(payload.rating, { min: 1, max: 5, fallback: 0 });
  if (rating < 1) return badRequest("rating must be a number between 1 and 5");

  const product = await db.select({ id: products.id }).from(products).where(eq(products.id, productId)).limit(1);
  if (!product[0]) return notFound("Product not found");

  const created = await db
    .insert(reviews)
    .values({
      productId,
      author,
      rating,
      title,
      body: text,
      // Never trust a client-supplied "verified" flag — it is earned, not claimed.
      verified: false,
    })
    .returning();

  await db
    .update(products)
    .set({
      reviewCount: sql`${products.reviewCount} + 1`,
      rating: sql`((${products.rating} * ${products.reviewCount}) + ${rating}) / (${products.reviewCount} + 1)`,
    })
    .where(eq(products.id, productId));

  return NextResponse.json({ ok: true, review: created[0] });
}
