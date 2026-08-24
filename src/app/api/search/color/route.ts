import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { colorDistance } from "@/lib/utils";
import { badRequest, readJson } from "@/lib/validation";
import { clientKey, limit, tooMany } from "@/lib/rate-limit";

/** Visual search: match products by dominant color similarity. */
export async function POST(req: Request) {
  // Scans and ranks up to 500 rows per call, so it is throttled like the other
  // expensive read endpoints.
  const rl = limit(await clientKey("search-color"), { max: 30, windowMs: 60_000 });
  if (!rl.ok) return tooMany(rl.retryAfter);

  const body = await readJson<{ color?: unknown }>(req);
  if (!body) return badRequest("Invalid request body");
  if (typeof body.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(body.color)) {
    return NextResponse.json({ error: "Valid hex color required" }, { status: 400 });
  }
  const all = await db.select().from(products).limit(500);
  const ranked = all
    .map((p) => ({ product: p, dist: colorDistance(p.color, body.color as string) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 12)
    .map((r) => r.product);
  return NextResponse.json({ products: ranked, searched: body.color });
}
