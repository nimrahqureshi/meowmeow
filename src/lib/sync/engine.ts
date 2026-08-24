/**
 * Product synchronization engine.
 * Idempotent create/update of products + offers + price history.
 * Never fabricates data. Only processes validated NormalizedOffer records.
 */

import { db } from "@/db";
import {
  products,
  productOffers,
  merchants,
  brands,
  categories,
  priceHistory,
  syncLogs,
} from "@/db/schema";
import { eq, and, or, isNotNull, asc } from "drizzle-orm";
import type { NormalizedOffer } from "@/lib/providers/types";
import {
  slugify,
  normalizePrice,
  normalizeAvailability,
  normalizeImages,
  validateNormalizedOffer,
  productIdentityKey,
} from "./normalize";

export interface SyncStats {
  fetched: number;
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  priceChanges: number;
}

async function ensureMerchant(slug: string, name?: string, currency = "PKR") {
  const existing = (
    await db.select().from(merchants).where(eq(merchants.slug, slug)).limit(1)
  )[0];
  if (existing) return existing;
  const [row] = await db
    .insert(merchants)
    .values({
      slug,
      name: name ?? slug,
      country: "PK",
      currency,
      active: true,
    })
    .returning();
  return row;
}

async function ensureBrand(name?: string) {
  if (!name || !name.trim()) return null;
  const slug = slugify(name);
  const existing = (
    await db.select().from(brands).where(eq(brands.slug, slug)).limit(1)
  )[0];
  if (existing) return existing;
  const [row] = await db
    .insert(brands)
    .values({ name: name.trim(), slug })
    .returning();
  return row;
}

async function ensureCategory(name?: string) {
  if (!name || !name.trim()) return null;
  const slug = slugify(name);
  const existing = (
    await db.select().from(categories).where(eq(categories.slug, slug)).limit(1)
  )[0];
  if (existing) return existing;
  const [row] = await db
    .insert(categories)
    .values({
      slug,
      name: name.trim(),
      emoji: "📦",
      description: `${name.trim()} products`,
    })
    .returning();
  return row;
}

async function findExistingProduct(offer: NormalizedOffer) {
  if (offer.gtin) {
    const row = (await db.select().from(products).where(eq(products.gtin, offer.gtin)).limit(1))[0];
    if (row) return row;
  }
  if (offer.mpn && offer.brand) {
    const brand = await ensureBrand(offer.brand);
    if (brand) {
      const row = (
        await db.select().from(products).where(and(eq(products.mpn, offer.mpn), eq(products.brandId, brand.id))).limit(1)
      )[0];
      if (row) return row;
    }
  }
  return null;
}

/**
 * Upsert a single normalized offer into products + product_offers + price_history.
 * Idempotent on (merchant, externalProductId) and conservative product matching.
 */
export async function upsertOffer(offer: NormalizedOffer): Promise<"imported" | "updated" | "skipped" | "failed"> {
  const errors = validateNormalizedOffer(offer);
  if (errors.length) return "failed";

  const price = normalizePrice(offer.price);
  if (price == null) return "failed";

  const merchant = await ensureMerchant(offer.merchantSlug, offer.merchantSlug, offer.currency || "PKR");
  const brand = await ensureBrand(offer.brand);
  const category = await ensureCategory(offer.category);
  const images = normalizeImages(offer.imageUrls);
  const availability = normalizeAvailability(offer.availability);
  const compareAt = offer.compareAtPrice != null ? normalizePrice(offer.compareAtPrice) : null;

  // Look for existing offer by merchant + external id
  const existingOffer = (
    await db
      .select()
      .from(productOffers)
      .where(
        and(
          eq(productOffers.merchantId, merchant.id),
          eq(productOffers.externalProductId, offer.externalProductId)
        )
      )
      .limit(1)
  )[0];

  let productId: number;
  let isNew = false;

  if (existingOffer) {
    productId = existingOffer.productId;
  } else {
    const matchedProduct = await findExistingProduct(offer);
    if (matchedProduct) {
      productId = matchedProduct.id;
    } else {
      // Create a new product (conservative — never merge on fuzzy title)
    const baseSlug = slugify(offer.title);
    let slug = baseSlug;
    let attempt = 0;
    while (true) {
      const clash = (
        await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1)
      )[0];
      if (!clash) break;
      attempt += 1;
      slug = `${baseSlug}-${attempt}`;
    }

      const [product] = await db
        .insert(products)
        .values({
          slug,
          name: offer.title.trim(),
          brandId: brand?.id,
          categoryId: category?.id,
          description: offer.description?.trim() || offer.title.trim(),
          sku: offer.sku,
          mpn: offer.mpn,
          gtin: offer.gtin,
          source: "feed",
          sourceId: `${offer.merchantSlug}:${offer.externalProductId}`,
          price,
          compareAtPrice: compareAt,
          images: images.length ? images : [],
          affiliateUrl: offer.affiliateUrl,
          store: merchant.name,
          inStock: availability === "in_stock",
          specs: offer.specs ?? {},
          published: true,
          lastPriceCheckedAt: new Date(),
        })
        .returning();
      productId = product.id;
      isNew = true;
    }
  }

  // Upsert offer
  if (existingOffer) {
    const priceChanged = Math.abs(existingOffer.price - price) > 0.009;
    await db
      .update(productOffers)
      .set({
        price,
        compareAtPrice: compareAt,
        availability,
        affiliateUrl: offer.affiliateUrl,
        merchantUrl: offer.merchantUrl,
        lastCheckedAt: new Date(),
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(productOffers.id, existingOffer.id));

    // Keep canonical product price in sync with lowest known
    const offersForProduct = await db
      .select({ price: productOffers.price, availability: productOffers.availability })
      .from(productOffers)
      .where(eq(productOffers.productId, productId));
    const lowest = Math.min(price, ...offersForProduct.map((o) => o.price));
    const anyInStock = offersForProduct.some((o) => o.availability === "in_stock") || availability === "in_stock";
    await db
      .update(products)
      .set({
        price: lowest,
        compareAtPrice: compareAt ?? undefined,
        inStock: anyInStock,
        sku: offer.sku ?? undefined,
        mpn: offer.mpn ?? undefined,
        gtin: offer.gtin ?? undefined,
        lastPriceCheckedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));

    if (priceChanged) {
      await db.insert(priceHistory).values({
        productId,
        offerId: existingOffer.id,
        merchantId: merchant.id,
        price,
        currency: offer.currency || "PKR",
        date: new Date(),
      });
    }
    return "updated";
  }

  // New offer
  const [newOffer] = await db
    .insert(productOffers)
    .values({
      productId,
      merchantId: merchant.id,
      externalProductId: offer.externalProductId,
      merchantUrl: offer.merchantUrl,
      affiliateUrl: offer.affiliateUrl,
      currency: offer.currency || "PKR",
      price,
      compareAtPrice: compareAt,
      availability,
      source: "feed",
      isPrimary: isNew,
      lastCheckedAt: new Date(),
      lastSyncedAt: new Date(),
    })
    .returning();

  await db.insert(priceHistory).values({
    productId,
    offerId: newOffer.id,
    merchantId: merchant.id,
    price,
    currency: offer.currency || "PKR",
    date: new Date(),
  });

  const allOffers = await db
    .select({ id: productOffers.id, price: productOffers.price, availability: productOffers.availability })
    .from(productOffers)
    .where(eq(productOffers.productId, productId))
    .orderBy(asc(productOffers.price));
  const cheapest = allOffers[0];
  await db
    .update(products)
    .set({
      price: cheapest?.price ?? price,
      inStock: allOffers.some((o) => o.availability === "in_stock"),
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));
  if (cheapest) {
    await db.update(productOffers).set({ isPrimary: false }).where(eq(productOffers.productId, productId));
    await db.update(productOffers).set({ isPrimary: true }).where(eq(productOffers.id, cheapest.id));
  }

  return isNew ? "imported" : "updated";
}

export async function processOfferBatch(
  offers: NormalizedOffer[],
  source: string,
  merchantId?: number | null
): Promise<SyncStats> {
  const stats: SyncStats = {
    fetched: offers.length,
    imported: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    priceChanges: 0,
  };

  const [log] = await db
    .insert(syncLogs)
    .values({
      merchantId: merchantId ?? null,
      source,
      status: "running",
      productsProcessed: 0,
    })
    .returning();

  for (const offer of offers) {
    try {
      const result = await upsertOffer(offer);
      if (result === "imported") stats.imported += 1;
      else if (result === "updated") stats.updated += 1;
      else if (result === "skipped") stats.skipped += 1;
      else stats.failed += 1;
    } catch {
      stats.failed += 1;
    }
  }

  await db
    .update(syncLogs)
    .set({
      status: stats.failed > 0 && stats.imported + stats.updated === 0 ? "failed" : "success",
      productsProcessed: stats.fetched,
      productsUpdated: stats.updated + stats.imported,
      productsFailed: stats.failed,
      finishedAt: new Date(),
    })
    .where(eq(syncLogs.id, log.id));

  return stats;
}
