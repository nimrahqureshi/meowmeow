/**
 * Authorized CSV / JSON product feed importer.
 * Expects well-formed rows; never scrapes or invents fields.
 */

import type { NormalizedOffer } from "@/lib/providers/types";
import { normalizePrice, normalizeAvailability, normalizeImages } from "./normalize";


export interface FeedRow {
  external_product_id?: string;
  externalProductId?: string;
  merchant_slug?: string;
  merchantSlug?: string;
  title?: string;
  name?: string;
  description?: string;
  brand?: string;
  category?: string;
  price?: number | string;
  compare_at_price?: number | string;
  compareAtPrice?: number | string;
  currency?: string;
  availability?: string;
  image_urls?: string[] | string;
  imageUrls?: string[] | string;
  images?: string[] | string;
  merchant_url?: string;
  merchantUrl?: string;
  affiliate_url?: string;
  affiliateUrl?: string;
  sku?: string;
  mpn?: string;
  gtin?: string;
  specs?: Record<string, string>;
}

function parseImageField(value: unknown): string[] {
  if (Array.isArray(value)) return normalizeImages(value);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return normalizeImages(parsed);
    } catch {
      /* pipe or comma separated */
    }
    return normalizeImages(value.split(/[|,]/).map((s) => s.trim()));
  }
  return [];
}

export function rowToNormalizedOffer(row: FeedRow): NormalizedOffer | null {
  const externalProductId =
    row.external_product_id || row.externalProductId || row.sku || "";
  const merchantSlug = (row.merchant_slug || row.merchantSlug || "").toLowerCase().trim();
  const title = (row.title || row.name || "").trim();
  const price = normalizePrice(row.price);
  const affiliateUrl = row.affiliate_url || row.affiliateUrl || "";

  if (!externalProductId || !merchantSlug || !title || price == null || !affiliateUrl) {
    return null;
  }

  return {
    externalProductId: String(externalProductId),
    merchantSlug,
    title,
    description: row.description,
    brand: row.brand,
    category: row.category,
    price,
    currency: (row.currency || "PKR").toUpperCase(),
    compareAtPrice: normalizePrice(row.compare_at_price ?? row.compareAtPrice),
    availability: normalizeAvailability(row.availability),
    imageUrls: parseImageField(row.image_urls ?? row.imageUrls ?? row.images),
    merchantUrl: row.merchant_url || row.merchantUrl,
    affiliateUrl,
    specs: row.specs,
    sku: row.sku,
    mpn: row.mpn,
    gtin: row.gtin,
  };
}

/** Import an array of feed rows (from JSON body or parsed CSV). */
export async function importFeedRows(
  rows: FeedRow[],
  source = "json_import"
) {
  const { processOfferBatch } = await import("./engine");
  
  const offers: NormalizedOffer[] = [];
  for (const row of rows) {
    const offer = rowToNormalizedOffer(row);
    if (offer) offers.push(offer);
  }
  return processOfferBatch(offers, source);
}

/** Minimal CSV parser (header row required). Handles quoted fields. */
export function parseCsv(text: string): FeedRow[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(Boolean);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const rows: FeedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] ?? "";
    });
    rows.push(row as FeedRow);
  }
  return rows;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
