/**
 * Product & offer normalization pipeline.
 * Never invents data. Validates and normalizes only what is supplied.
 */

import type { NormalizedOffer } from "@/lib/providers/types";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function normalizePrice(value: unknown, _currency = "PKR"): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.round(value * 100) / 100;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.]/g, "");
    const n = Number(cleaned);
    if (Number.isFinite(n) && n >= 0) return Math.round(n * 100) / 100;
  }
  return null;
}

export function normalizeAvailability(
  value: unknown
): "in_stock" | "out_of_stock" | "unknown" | "preorder" {
  if (typeof value !== "string") return "unknown";
  const v = value.toLowerCase().trim();
  if (["in_stock", "instock", "available", "in stock", "yes", "true", "1"].includes(v))
    return "in_stock";
  if (["out_of_stock", "outofstock", "sold out", "unavailable", "no", "false", "0"].includes(v))
    return "out_of_stock";
  if (["preorder", "pre-order", "pre order"].includes(v)) return "preorder";
  return "unknown";
}

export function normalizeImages(urls: unknown): string[] {
  if (!Array.isArray(urls)) return [];
  return urls
    .filter((u): u is string => typeof u === "string" && /^https?:\/\//i.test(u))
    .slice(0, 12);
}

export function validateNormalizedOffer(offer: Partial<NormalizedOffer>): string[] {
  const errors: string[] = [];
  if (!offer.externalProductId) errors.push("externalProductId required");
  if (!offer.merchantSlug) errors.push("merchantSlug required");
  if (!offer.title || offer.title.trim().length < 2) errors.push("title required");
  if (offer.price == null || !Number.isFinite(offer.price) || offer.price < 0)
    errors.push("valid price required");
  if (!offer.currency) errors.push("currency required");
  if (!offer.affiliateUrl || !/^https?:\/\//i.test(offer.affiliateUrl))
    errors.push("valid affiliateUrl required");
  return errors;
}

/** Conservative identity key for deduplication — never merge solely on title similarity */
export function productIdentityKey(offer: NormalizedOffer): string {
  if (offer.gtin) return `gtin:${offer.gtin}`;
  if (offer.mpn && offer.brand) return `mpn:${offer.brand.toLowerCase()}:${offer.mpn}`;
  if (offer.sku && offer.merchantSlug)
    return `sku:${offer.merchantSlug}:${offer.sku}`;
  return `ext:${offer.merchantSlug}:${offer.externalProductId}`;
}
