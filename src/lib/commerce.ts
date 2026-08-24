/**
 * Commerce helpers — multi-merchant offers, price intelligence, freshness.
 * Prefer product_offers when present; fall back to product.price/store for
 * backward compatibility with legacy single-offer rows.
 */

import type { Product, ProductOffer, Merchant } from "@/db/schema";

export type Availability = "in_stock" | "out_of_stock" | "unknown" | "preorder";

export type OfferWithMerchant = ProductOffer & {
  merchant?: Pick<Merchant, "id" | "slug" | "name" | "logo" | "currency"> | null;
};

export type PriceFreshness = "fresh" | "recent" | "aging" | "stale" | "unknown";

const FRESH_MS = 30 * 60 * 1000; // 30 min
const RECENT_MS = 6 * 60 * 60 * 1000; // 6 h
const AGING_MS = 24 * 60 * 60 * 1000; // 24 h

export function getPriceFreshness(lastCheckedAt: Date | string | null | undefined): PriceFreshness {
  if (!lastCheckedAt) return "unknown";
  const t = typeof lastCheckedAt === "string" ? new Date(lastCheckedAt).getTime() : lastCheckedAt.getTime();
  if (Number.isNaN(t)) return "unknown";
  const age = Date.now() - t;
  if (age <= FRESH_MS) return "fresh";
  if (age <= RECENT_MS) return "recent";
  if (age <= AGING_MS) return "aging";
  return "stale";
}

export function formatPriceFreshness(lastCheckedAt: Date | string | null | undefined): string {
  const f = getPriceFreshness(lastCheckedAt);
  if (!lastCheckedAt) return "Price check time unknown";
  const d = typeof lastCheckedAt === "string" ? new Date(lastCheckedAt) : lastCheckedAt;
  if (Number.isNaN(d.getTime())) return "Price check time unknown";
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (f === "fresh") return mins < 2 ? "Price checked just now" : `Price checked ${mins} minutes ago`;
  if (f === "recent") {
    const hrs = Math.round(mins / 60);
    return `Price checked ${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  }
  return `Price last checked ${d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

export function formatCurrency(amount: number, currency = "PKR", locale = "en-PK"): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "PKR" ? 0 : 2,
    }).format(amount);
  } catch {
    return `Rs ${amount.toFixed(0)}`;
  }
}

export function discountPercent(price: number, compareAt: number | null | undefined): number | null {
  if (!compareAt || compareAt <= price || price <= 0) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/** Pick the best (lowest in-stock) offer, or primary, or first. */
export function selectBestOffer(offers: OfferWithMerchant[]): OfferWithMerchant | null {
  if (!offers.length) return null;
  const inStock = offers.filter((o) => o.availability === "in_stock");
  const pool = inStock.length ? inStock : offers;
  const primary = pool.find((o) => o.isPrimary);
  if (primary) return primary;
  return [...pool].sort((a, b) => a.price - b.price)[0] ?? null;
}

/** Legacy single-offer shape from product row when no product_offers exist. */
export function legacyOfferFromProduct(product: Product): OfferWithMerchant {
  return {
    id: 0,
    productId: product.id,
    merchantId: 0,
    externalProductId: null,
    merchantUrl: null,
    affiliateUrl: product.affiliateUrl,
    currency: "USD",
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    availability: product.inStock ? "in_stock" : "out_of_stock",
    shippingInfo: null,
    condition: "new",
    source: "legacy",
    isPrimary: true,
    lastCheckedAt: product.lastPriceCheckedAt ?? product.updatedAt ?? product.createdAt,
    lastSyncedAt: null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt ?? product.createdAt,
    merchant: {
      id: 0,
      slug: product.store.toLowerCase().replace(/\s+/g, "-"),
      name: product.store,
      logo: null,
      currency: "USD",
    },
  };
}

export function resolveOffers(
  product: Product,
  offers: OfferWithMerchant[] | null | undefined
): OfferWithMerchant[] {
  if (offers && offers.length > 0) return offers;
  return [legacyOfferFromProduct(product)];
}

export function priceStats(
  history: { price: number; date: Date | string }[]
): {
  current: number | null;
  previous: number | null;
  lowest: number | null;
  highest: number | null;
  average: number | null;
  changePercent: number | null;
} {
  if (!history.length) {
    return { current: null, previous: null, lowest: null, highest: null, average: null, changePercent: null };
  }
  const sorted = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const prices = sorted.map((h) => h.price);
  const current = prices[prices.length - 1] ?? null;
  const previous = prices.length > 1 ? prices[prices.length - 2]! : null;
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  const average = prices.reduce((s, p) => s + p, 0) / prices.length;
  const changePercent =
    current != null && previous != null && previous > 0
      ? Math.round(((current - previous) / previous) * 1000) / 10
      : null;
  return { current, previous, lowest, highest, average, changePercent };
}

/** Transparent rule-based "winner" for compare — never fabricated AI authority. */
export function compareWinner(
  products: { id: number; price: number; rating: number; reviewCount: number; inStock: boolean }[]
): { bestOverallId: number | null; bestValueId: number | null } {
  if (!products.length) return { bestOverallId: null, bestValueId: null };
  const available = products.filter((p) => p.inStock);
  const pool = available.length ? available : products;
  const bestOverall = [...pool].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
    return a.price - b.price;
  })[0];
  const bestValue = [...pool].sort((a, b) => {
    const score = (p: typeof a) => (p.rating > 0 ? p.rating / Math.max(p.price, 1) : 0);
    return score(b) - score(a);
  })[0];
  return {
    bestOverallId: bestOverall?.id ?? null,
    bestValueId: bestValue?.id ?? null,
  };
}
