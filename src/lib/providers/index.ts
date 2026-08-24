import type { ProductProvider, ProviderRuntimeStatus, SyncResult, NormalizedOffer } from "./types";
import { importFeedRows, parseCsv, type FeedRow } from "@/lib/sync/import";

function hasEnv(keys: string[]) {
  return keys.every((k) => Boolean(process.env[k]?.trim()));
}

function safeUrl(raw: string) {
  try {
    const u = new URL(raw);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

async function fetchFeed(url: string): Promise<{ contentType: string; body: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json,text/csv,application/xml,text/xml;q=0.9,*/*;q=0.1" },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Feed returned HTTP ${res.status}`);
    return { contentType: res.headers.get("content-type") || "", body: await res.text() };
  } finally {
    clearTimeout(timeout);
  }
}

function parseSimpleXml(xml: string): FeedRow[] {
  const productBlocks = [...xml.matchAll(/<product\b[^>]*>([\s\S]*?)<\/product>/gi)].map((m) => m[1]);
  const value = (block: string, names: string[]) => {
    for (const name of names) {
      const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
      if (m) return m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim();
    }
    return undefined;
  };
  return productBlocks.map((b) => ({
    external_product_id: value(b, ["external_product_id", "externalProductId", "id", "sku"]),
    merchant_slug: value(b, ["merchant_slug", "merchantSlug", "merchant"]),
    title: value(b, ["title", "name"]),
    description: value(b, ["description"]),
    brand: value(b, ["brand"]),
    category: value(b, ["category"]),
    price: value(b, ["price"]),
    compare_at_price: value(b, ["compare_at_price", "compareAtPrice", "sale_price"]),
    currency: value(b, ["currency"]),
    availability: value(b, ["availability", "stock"]),
    image_urls: value(b, ["image_urls", "imageUrls", "images"]),
    merchant_url: value(b, ["merchant_url", "merchantUrl", "url"]),
    affiliate_url: value(b, ["affiliate_url", "affiliateUrl", "affiliate"]),
    sku: value(b, ["sku"]),
    mpn: value(b, ["mpn"]),
    gtin: value(b, ["gtin", "ean", "upc"]),
  }));
}

async function syncFeed(url: string, source: string, limit?: number): Promise<SyncResult> {
  const started = Date.now();
  const { contentType, body } = await fetchFeed(url);
  let rows: FeedRow[];
  if (contentType.includes("json") || body.trim().startsWith("[") || body.trim().startsWith("{")) {
    const parsed = JSON.parse(body);
    rows = Array.isArray(parsed) ? parsed : (parsed.products ?? parsed.rows ?? []);
  } else if (contentType.includes("xml") || body.trim().startsWith("<")) {
    rows = parseSimpleXml(body);
  } else {
    rows = parseCsv(body);
  }
  if (limit) rows = rows.slice(0, limit);
  const stats = await importFeedRows(rows, source);
  return {
    status: stats.failed ? (stats.imported || stats.updated ? "partial" : "failed") : "success",
    fetched: stats.fetched,
    imported: stats.imported,
    updated: stats.updated,
    skipped: stats.skipped,
    failed: stats.failed,
    durationMs: Date.now() - started,
  };
}

function feedProvider(id: ProductProvider["id"], name: string, envKeys: string[], country = "PK"): ProductProvider {
  return {
    id, name, country,
    getStatus() {
      return hasEnv(envKeys) ? "configured" : "not_configured";
    },
    async testConnection() {
      const url = process.env[envKeys.find((k) => k.endsWith("FEED_URL")) || ""];
      if (!url) return { ok: false, message: `NOT_CONFIGURED — set ${envKeys.join(", ")}` };
      if (!safeUrl(url)) return { ok: false, message: "Invalid feed URL — HTTPS is recommended and only HTTP(S) is accepted." };
      try {
        await fetchFeed(url);
        return { ok: true, message: "Connection tested successfully; feed is reachable." };
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : "Feed connection failed" };
      }
    },
    async sync(options = {}) {
      const url = process.env[envKeys.find((k) => k.endsWith("FEED_URL")) || ""];
      if (!url || !safeUrl(url)) {
        return { status: "skipped", fetched: 0, imported: 0, updated: 0, skipped: 0, failed: 0, errorMessage: "NOT_CONFIGURED", durationMs: 0 };
      }
      return syncFeed(url, id, options.limit);
    },
  };
}

const darazProvider: ProductProvider = {
  id: "daraz",
  name: "Daraz Pakistan (authorized affiliate/product feed)",
  country: "PK",
  getStatus() {
    return process.env.DARAZ_FEED_URL?.trim() ? "configured" : "not_configured";
  },
  async testConnection() {
    const url = process.env.DARAZ_FEED_URL?.trim();
    if (!url) return { ok: false, message: "NOT_CONFIGURED — set DARAZ_FEED_URL for an authorized feed." };
    if (!safeUrl(url)) return { ok: false, message: "Invalid DARAZ_FEED_URL." };
    try { await fetchFeed(url); return { ok: true, message: "Authorized Daraz feed is reachable." }; }
    catch (error) { return { ok: false, message: error instanceof Error ? error.message : "Daraz feed connection failed" }; }
  },
  async sync(options = {}) {
    const url = process.env.DARAZ_FEED_URL?.trim();
    if (!url || !safeUrl(url)) return { status:"skipped", fetched:0, imported:0, updated:0, skipped:0, failed:0, errorMessage:"NOT_CONFIGURED", durationMs:0 };
    return syncFeed(url, "daraz", options.limit);
  },
};

export const providers: ProductProvider[] = [
  darazProvider,
  feedProvider("csv", "CSV Product Feed", ["CSV_FEED_URL"], "PK"),
  feedProvider("json", "JSON Product Feed", ["JSON_FEED_URL"], "PK"),
  feedProvider("amazon", "Amazon Associates / Product Advertising API", ["AMAZON_ASSOCIATE_TAG"], "US"),
  feedProvider("impact", "Impact", ["IMPACT_ACCOUNT_SID", "IMPACT_AUTH_TOKEN"]),
  feedProvider("cj", "Commission Junction", ["CJ_API_KEY"]),
  feedProvider("shareasale", "ShareASale", ["SHAREASALE_AFFILIATE_ID", "SHAREASALE_API_TOKEN"]),
  feedProvider("rakuten", "Rakuten Advertising", ["RAKUTEN_API_KEY"]),
];

export function getProvider(id: string): ProductProvider | undefined { return providers.find((p) => p.id === id); }
export function listProviders(): ProductProvider[] { return providers; }
export type { ProductProvider, SyncResult, ProviderRuntimeStatus, NormalizedOffer } from "./types";
