import { db } from "@/db";
import { priceAlerts, productOffers, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { enqueueEmail } from "@/lib/email/queue";

export async function processPriceAlerts(limit = 100) {
  const active = await db.select().from(priceAlerts).where(eq(priceAlerts.active, true)).limit(limit);
  let notified = 0;
  let checked = 0;

  for (const alert of active) {
    checked += 1;
    const offers = await db.select().from(productOffers).where(eq(productOffers.productId, alert.productId));
    if (!offers.length) continue;

    const best = offers.reduce((a, b) => (a.price < b.price ? a : b));
    const product = (await db.select().from(products).where(eq(products.id, alert.productId)).limit(1))[0];
    if (!product) continue;

    const previous = alert.lastKnownPrice;
    const previousAvailability = alert.lastKnownAvailability;
    const dropped = previous != null && best.price < previous;
    const percentDrop = previous && previous > 0 ? ((previous - best.price) / previous) * 100 : 0;
    const backInStock = previousAvailability === "out_of_stock" && best.availability === "in_stock";

    let triggered = false;
    switch (alert.alertType) {
      case "percent_drop":
        triggered = dropped && percentDrop >= (alert.targetPercentDrop ?? Number.POSITIVE_INFINITY);
        break;
      case "any_drop":
        triggered = dropped;
        break;
      case "back_in_stock":
        triggered = backInStock;
        break;
      default:
        triggered = alert.targetPrice != null && best.price <= alert.targetPrice;
    }

    await db.update(priceAlerts).set({
      lastKnownPrice: best.price,
      lastKnownAvailability: best.availability,
    }).where(eq(priceAlerts.id, alert.id));

    if (!triggered) continue;

    if (alert.email) {
      await enqueueEmail(alert.email, backInStock ? "back_in_stock" : "price_drop", {
        subject: backInStock ? `${product.name} is back in stock` : `${product.name} price alert`,
        body: backInStock
          ? `${product.name} is currently available again. Current price: ${alert.currency || "PKR"} ${best.price.toLocaleString()}.`
          : `${product.name} is now ${alert.currency || "PKR"} ${best.price.toLocaleString()}${previous != null ? `, down ${percentDrop.toFixed(1)}% from ${previous.toLocaleString()}.` : "."}`,
        productName: product.name,
        productSlug: product.slug,
        targetPrice: alert.targetPrice,
        currentPrice: best.price,
        currency: alert.currency || "PKR",
      });
    }

    await db.update(priceAlerts).set({ active: false, notifiedAt: new Date() }).where(eq(priceAlerts.id, alert.id));
    notified += 1;
  }
  return { checked, notified };
}
