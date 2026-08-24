import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories, coupons } from "@/db/schema";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { clientKey, limit, tooMany } from "@/lib/rate-limit";
import { badRequest, readJson } from "@/lib/validation";

/**
 * MeowMeow AI Shopping Assistant
 *
 * Retrieval-first engine: every product, price, and rating comes from the
 * live catalog. No fabricated products or prices. Intent detection routes
 * to catalog queries; responses are grounded in real rows only.
 *
 * Optional: set OPENAI_API_KEY (or compatible) for richer natural-language
 * reasoning on top of the same tool results. Without a key the rule-based
 * path remains fully functional.
 */

type ChatProduct = {
  id: number;
  name: string;
  price: number;
  image: string | undefined;
  slug: string;
  rating: number;
  store?: string;
};

function mapProducts(rows: { id: number; name: string; price: number; images: string[]; slug: string; rating: number; store?: string }[]): ChatProduct[] {
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.images?.[0],
    slug: p.slug,
    rating: p.rating,
    store: p.store,
  }));
}

function extractBudget(message: string): number {
  // Pakistan-friendly: Rs 150000, under 150000, under 150k, under 1.5 lakh
  const lakh = message.match(/(?:under|below|less than|budget of|around|max|up to)\s*(\d+(?:\.\d+)?)\s*lakh/i);
  if (lakh) return Math.round(parseFloat(lakh[1]) * 100000);
  const rs = message.match(/(?:rs\.?|pkr)?\s*(\d{4,7})/i);
  const under = message.match(/(?:under|below|less than|budget of|around|max|up to)\s*(?:rs\.?|pkr)?\s*(\d+)/i);
  if (under) {
    let n = parseInt(under[1], 10);
    if (/\d+k\b/i.test(message)) n *= 1000;
    return Math.min(10_000_000, n);
  }
  if (rs) return Math.min(10_000_000, parseInt(rs[1], 10));
  return 150000; // sensible default for PK market
}

async function searchCatalog(query: string, limitN = 6, maxPrice?: number) {
  const tokens = query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !["the", "and", "for", "with", "best", "good", "find", "show", "need", "want", "under", "from"].includes(t));

  const conditions = [eq(products.published, true)];
  if (maxPrice != null) conditions.push(sql`${products.price} <= ${maxPrice}`);

  if (tokens.length === 0) {
    return db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.rating))
      .limit(limitN);
  }

  // Simple relevance: ILIKE any token in name/description/tags
  const orClauses = tokens.flatMap((t) => [
    ilike(products.name, `%${t}%`),
    ilike(products.description, `%${t}%`),
  ]);

  const rows = await db
    .select()
    .from(products)
    .where(and(...conditions, or(...orClauses)))
    .orderBy(desc(products.rating))
    .limit(40);

  // Score by token hits
  const scored = rows
    .map((p) => {
      const hay = `${p.name} ${p.description} ${(p.tags || []).join(" ")}`.toLowerCase();
      const score = tokens.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0) + p.rating * 0.1;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limitN)
    .map((x) => x.p);

  return scored;
}

export async function POST(req: Request) {
  const rl = limit(await clientKey("chat"), { max: 20, windowMs: 60_000 });
  if (!rl.ok) return tooMany(rl.retryAfter);

  const payload = await readJson<{ message?: unknown }>(req);
  if (!payload) return badRequest("Invalid request body");
  const raw = typeof payload.message === "string" ? payload.message.trim() : "";
  if (!raw) return NextResponse.json({ error: "Empty message" }, { status: 400 });
  if (raw.length > 2000) return NextResponse.json({ error: "Message too long" }, { status: 400 });

  const message = raw.toLowerCase();

  // Safety: refuse medical / legal / financial advice framing
  if (/(diagnose|prescription|lawsuit|invest in|stock tip|crypto tip)/.test(message)) {
    return NextResponse.json({
      reply:
        "I can only help with product discovery and shopping on MeowMeow. For medical, legal, or investment advice, please consult a qualified professional.",
    });
  }

  // Greeting
  if (/^(hi|hello|hey|yo|hola|sup)\b/.test(message) || message === "help") {
    return NextResponse.json({
      reply:
        "Hi! I'm Meow, your shopping assistant. Everything I suggest comes from our live catalog — real products and prices only.\n\nTry:\n• “Wireless headphones under $150”\n• “Gift for her under $80”\n• “Compare these two laptops”\n• “Any active coupons?”\n• “What's trending?”",
    });
  }

  // Coupons / deals
  if (/(coupon|promo code|discount code|active deal)/.test(message)) {
    const active = await db.select().from(coupons).where(eq(coupons.active, true)).limit(8);
    const deals = await db
      .select()
      .from(products)
      .where(and(eq(products.published, true), sql`${products.compareAtPrice} > ${products.price}`))
      .orderBy(desc(sql`${products.compareAtPrice} - ${products.price}`))
      .limit(4);
    if (!active.length && !deals.length) {
      return NextResponse.json({ reply: "No active coupons or marked-down products right now. Check back soon." });
    }
    const couponLines = active.map((c) => `• **${c.code}** — ${c.title}${c.minSpend ? ` (min Rs ${c.minSpend.toLocaleString?.() ?? c.minSpend})` : ""}`).join("\n");
    const dealLines = deals
      .map((p) => {
        const price = p.price?.toLocaleString?.() ?? p.price;
        const compareAtPrice =
          p.compareAtPrice != null
            ? p.compareAtPrice.toLocaleString?.() ?? p.compareAtPrice
            : null;

        return compareAtPrice
          ? `• ${p.name} — Rs ${price} (was Rs ${compareAtPrice})`
          : `• ${p.name} — Rs ${price}`;
      })
      .join("\n");
    return NextResponse.json({
      reply: `Current savings from the catalog:\n\n${couponLines ? `Coupons:\n${couponLines}\n\n` : ""}${dealLines ? `Price drops:\n${dealLines}` : ""}`,
      products: mapProducts(deals),
    });
  }

  // Gift finder
  if (/(gift|present|birthday|anniversary|for my|for her|for him|for sister|for wife|for mom)/.test(message)) {
    const budget = extractBudget(message);
    const rows = await searchCatalog(message, 5, budget);
    if (!rows.length) {
      return NextResponse.json({
        reply: `I couldn't find catalog products under Rs ${budget.toLocaleString?.() ?? budget} matching that. Try a higher budget or a different category.`,
      });
    }
    const picks = rows.map((p, i) => `${i + 1}. ${p.name} — Rs ${p.price.toLocaleString?.() ?? p.price} (${p.rating}★)`).join("\n");
    return NextResponse.json({
      reply: `Gift ideas under Rs ${budget.toLocaleString?.() ?? budget} from the catalog:\n\n${picks}\n\nPrices and availability come from our database; always confirm on the merchant site before buying.`,
      products: mapProducts(rows),
    });
  }

  // Compare
  if (/(compare|vs\.?|versus|difference between)/.test(message)) {
    const cleaned = message
      .replace(/compare|vs\.?|versus|difference between|and|with|the|a |an /gi, " ")
      .replace(/[?,.]/g, " ")
      .trim();
    const rows = await searchCatalog(cleaned, 8);
    if (rows.length < 2) {
      return NextResponse.json({
        reply: "I need at least two matching products to compare. Try naming them more specifically, or use the Compare feature on product pages.",
      });
    }
    const [a, b] = rows;
    const verdict =
      a.price <= b.price
        ? `${a.name} is lower priced (Rs ${a.price.toLocaleString()} vs Rs ${b.price.toLocaleString()}). ${b.rating >= a.rating ? `${b.name} has a higher rating (${b.rating}★).` : `${a.name} also leads on rating.`}`
        : `${b.name} is lower priced (Rs ${b.price.toLocaleString()} vs Rs ${a.price.toLocaleString()}). ${a.rating >= b.rating ? `${a.name} has a higher rating (${a.rating}★).` : `${b.name} also leads on rating.`}`;
    return NextResponse.json({
      reply: `Catalog comparison:\n\n• ${a.name} — Rs ${a.price.toLocaleString()} · ${a.rating}★ · ${a.reviewCount} reviews\n• ${b.name} — Rs ${b.price.toLocaleString()} · ${b.rating}★ · ${b.reviewCount} reviews\n\n${verdict}\n\nUse the on-site Compare tool for a full specification table.`,
      products: mapProducts([a, b]),
    });
  }

  // Category
  const cats = await db.select().from(categories);
  const catHit = cats.find(
    (c) => message.includes(c.name.toLowerCase()) || message.includes(c.slug.replace(/-/g, " "))
  );
  if (catHit && /(best|recommend|top|show|find|looking|want|buy|need|under)/.test(message)) {
    const budget = extractBudget(message);
    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.categoryId, catHit.id), eq(products.published, true), sql`${products.price} <= ${budget}`))
      .orderBy(desc(products.rating))
      .limit(5);
    if (!rows.length) {
      return NextResponse.json({ reply: `No published products in ${catHit.name} under Rs ${budget.toLocaleString?.() ?? budget} right now.` });
    }
    const picks = rows.map((p, i) => `${i + 1}. ${p.name} — Rs ${p.price.toLocaleString?.() ?? p.price} (${p.rating}★)`).join("\n");
    return NextResponse.json({
      reply: `Top-rated in ${catHit.emoji} ${catHit.name} (≤ Rs ${budget.toLocaleString?.() ?? budget}):\n\n${picks}`,
      products: mapProducts(rows),
    });
  }

  // Trending
  if (/(trending|popular|best seller|bestseller|hot right now|what's hot)/.test(message)) {
    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.published, true), eq(products.trending, true)))
      .orderBy(desc(products.reviewCount))
      .limit(5);
    if (!rows.length) {
      return NextResponse.json({ reply: "No trending products flagged in the catalog at the moment." });
    }
    const picks = rows.map((p, i) => `${i + 1}. ${p.name} — Rs ${p.price.toLocaleString?.() ?? p.price} (${p.reviewCount.toLocaleString()} reviews)`).join("\n");
    return NextResponse.json({
      reply: `Currently marked trending:\n\n${picks}`,
      products: mapProducts(rows),
    });
  }


  // Support escalation
  if (/(speak to (a )?human|talk to (a )?human|contact support|customer service|help me with (an )?order|complaint|refund|where is my order)/i.test(message)) {
    return NextResponse.json({
      reply: "I can create a support ticket for you. Please reply with your email and a short description of the issue (or use the Contact page). A human agent will follow up. I will not invent order statuses or refund outcomes.",
      action: "create_support_ticket",
    });
  }

  // General catalog search / recommendation
  const budget = extractBudget(message);
  const rows = await searchCatalog(message, 5, budget);
  if (!rows.length) {
    return NextResponse.json({
      reply: "I couldn't find matching products in the catalog. Try a broader query, a different category, or a higher budget.",
    });
  }
  const picks = rows.map((p, i) => `${i + 1}. ${p.name} — Rs ${p.price.toLocaleString?.() ?? p.price} (${p.rating}★)`).join("\n");
  return NextResponse.json({
    reply: `From the catalog (≤ Rs ${budget.toLocaleString?.() ?? budget} where applicable):\n\n${picks}\n\nAll prices and ratings are from our database. Confirm on the merchant site before purchasing.`,
    products: mapProducts(rows),
  });
}
