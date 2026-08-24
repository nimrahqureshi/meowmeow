import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories, brands } from "@/db/schema";
import { ilike, or, and, eq, desc, asc, sql } from "drizzle-orm";
import { clientKey, limit, tooMany } from "@/lib/rate-limit";

const SUGGESTIONS = [
  "wireless headphones",
  "smartwatch",
  "silk dress",
  "espresso machine",
  "sneakers",
  "gift box",
  "diamond bracelet",
  "mechanical keyboard",
  "carry-on luggage",
  "cashmere",
];

export async function GET(req: Request) {
  // Type-ahead fires per keystroke (debounced), so this ceiling sits well above normal use.
  const rl = limit(await clientKey("search"), { max: 60, windowMs: 60000 });
  if (!rl.ok) return tooMany(rl.retryAfter);

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();

  if (!q) return NextResponse.json({ products: [], categories: [], suggestions: SUGGESTIONS });

  const pattern = `%${q}%`;
  const [prodRows, catRows, brandRows] = await Promise.all([
    db
      .select()
      .from(products)
      .where(or(ilike(products.name, pattern), ilike(products.description, pattern), ilike(products.store, pattern)))
      .limit(8),
    db.select().from(categories).where(or(ilike(categories.name, pattern), ilike(categories.slug, pattern))).limit(4),
    db.select().from(brands).where(ilike(brands.name, pattern)).limit(3),
  ]);

  return NextResponse.json({ products: prodRows, categories: catRows, brands: brandRows });
}

/** Advanced filtered listing endpoint used for catalog browsing + infinite scroll. */
export async function POST(req: Request) {
  const body = (await req.json()) as {
    category?: string;
    tag?: string;
    q?: string;
    brand?: string;
    min?: number;
    max?: number;
    rating?: number;
    sort?: string;
    page?: number;
    pageSize?: number;
  };
  const page = Math.max(1, body.page ?? 1);
  const pageSize = Math.min(48, body.pageSize ?? 24);
  const conds = [];

  if (body.category) {
    const cat = (await db.select().from(categories).where(eq(categories.slug, body.category)).limit(1))[0];
    if (cat) conds.push(eq(products.categoryId, cat.id));
  }
  if (body.tag) {
    const tagMap: Record<string, string> = {
      trending: "trending",
      "best-sellers": "bestSeller",
      "premium-picks": "premium",
      deals: "deal",
      seasonal: "seasonal",
    };
    const field = tagMap[body.tag];
    if (field === "trending") conds.push(eq(products.trending, true));
    else if (field === "bestSeller") conds.push(eq(products.bestSeller, true));
    else if (field === "premium" || field === "deal" || field === "seasonal") conds.push(sql`${products.tags} @> ${JSON.stringify([field])}::jsonb`);
    else if (body.tag === "new") conds.push(eq(products.isNew, true));
    else conds.push(sql`${products.tags} @> ${JSON.stringify([body.tag])}::jsonb`);
  }
  if (body.q) {
    const pattern = `%${body.q}%`;
    conds.push(or(ilike(products.name, pattern), ilike(products.description, pattern)));
  }
  if (body.brand) {
    const brand = (await db.select().from(brands).where(eq(brands.slug, body.brand)).limit(1))[0];
    if (brand) conds.push(eq(products.brandId, brand.id));
  }
  if (body.min != null) conds.push(sql`${products.price} >= ${body.min}`);
  if (body.max != null) conds.push(sql`${products.price} <= ${body.max}`);
  if (body.rating) conds.push(sql`${products.rating} >= ${body.rating}`);

  const orderBy =
    body.sort === "price-asc"
      ? asc(products.price)
      : body.sort === "price-desc"
        ? desc(products.price)
        : body.sort === "rating"
          ? desc(products.rating)
          : body.sort === "newest"
            ? desc(products.createdAt)
            : desc(products.reviewCount);

  const where = conds.length ? and(...conds) : undefined;
  const [rows, total] = await Promise.all([
    db.select().from(products).where(where).orderBy(orderBy).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ count: sql<number>`count(*)` }).from(products).where(where),
  ]);

  return NextResponse.json({ products: rows, total: Number(total[0]?.count ?? 0), page, pageSize });
}
