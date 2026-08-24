import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productOffers, clicks, merchants } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { getSessionId } from "@/lib/session";
import { clientKey, limit, tooMany } from "@/lib/rate-limit";

/**
 * Affiliate click tracker: records the click, then redirects to the merchant.
 * Prefers the primary / lowest in-stock offer; falls back to legacy product.affiliateUrl.
 * Never invents a destination. Never open-redirects.
 */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const rl = limit(await clientKey("click"), { max: 40, windowMs: 60000 });
  if (!rl.ok) return tooMany(rl.retryAfter);

  const { slug } = await params;
  const sessionId = await getSessionId();
  const url = new URL(req.url);
  const offerIdParam = url.searchParams.get("offer");

  const product = (await db.select().from(products).where(eq(products.slug, slug)).limit(1))[0];
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  let affiliateUrl: string | null = null;
  let offerId: number | null = null;
  let merchantId: number | null = null;

  // Prefer explicit offer id when provided and belongs to this product
  if (offerIdParam) {
    const oid = Number(offerIdParam);
    if (Number.isFinite(oid)) {
      const offer = (
        await db
          .select()
          .from(productOffers)
          .where(and(eq(productOffers.id, oid), eq(productOffers.productId, product.id)))
          .limit(1)
      )[0];
      if (offer?.affiliateUrl) {
        affiliateUrl = offer.affiliateUrl;
        offerId = offer.id;
        merchantId = offer.merchantId;
      }
    }
  }

  // Otherwise pick primary / best available offer
  if (!affiliateUrl) {
    const offers = await db
      .select()
      .from(productOffers)
      .where(eq(productOffers.productId, product.id))
      .orderBy(asc(productOffers.price));
    const primary = offers.find((o) => o.isPrimary && o.affiliateUrl) ?? offers.find((o) => o.affiliateUrl);
    if (primary) {
      affiliateUrl = primary.affiliateUrl;
      offerId = primary.id;
      merchantId = primary.merchantId;
    }
  }

  // Legacy single-offer column (backward compatibility with seeded demo rows)
  if (!affiliateUrl && product.affiliateUrl) {
    affiliateUrl = product.affiliateUrl;
  }

  if (!affiliateUrl) {
    return NextResponse.json(
      { error: "No retailer link available for this product" },
      { status: 404 }
    );
  }

  let destination: URL;
  try {
    destination = new URL(affiliateUrl);
  } catch {
    return NextResponse.json({ error: "This product has no valid destination link" }, { status: 502 });
  }
  if (destination.protocol !== "https:" && destination.protocol !== "http:") {
    return NextResponse.json({ error: "This product has no valid destination link" }, { status: 502 });
  }

  // Record the click with full attribution context
  await db.insert(clicks).values({
    productId: product.id,
    offerId,
    merchantId,
    sessionId,
    sourcePage: url.searchParams.get("from") ?? undefined,
    placement: url.searchParams.get("placement") ?? "buy_box",
    campaign: url.searchParams.get("utm_campaign") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  // Attribution param for downstream analytics (does not replace network tracking)
  destination.searchParams.set("meowmeow_ref", "storefront");
  if (offerId) destination.searchParams.set("mm_offer", String(offerId));

  return NextResponse.redirect(destination.toString(), { status: 307 });
}