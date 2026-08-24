import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { inArray } from "drizzle-orm";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ids = (url.searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n > 0)
    .slice(0, 4);
  if (!ids.length) return NextResponse.json({ products: [] });
  const rows = await db.select().from(products).where(inArray(products.id, ids));
  return NextResponse.json({ products: rows });
}
