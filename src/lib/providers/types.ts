/**
 * Product/offer provider adapter contract.
 * Implementations fetch from official APIs or authorized feeds only — no unauthorized scraping.
 */

export type ProviderId =
  | "amazon"
  | "impact"
  | "cj"
  | "shareasale"
  | "rakuten"
  | "daraz"
  | "csv"
  | "json"
  | "manual";

export type ProviderRuntimeStatus =
  | "not_configured"
  | "configured"
  | "connection_tested"
  | "connected"
  | "syncing"
  | "healthy"
  | "warning"
  | "failed"
  | "disabled"
  | "rate_limited"
  | "error";

export interface NormalizedOffer {
  externalProductId: string;
  merchantSlug: string;
  title: string;
  description?: string;
  brand?: string;
  category?: string;
  price: number;
  currency: string;
  compareAtPrice?: number | null;
  availability: "in_stock" | "out_of_stock" | "unknown" | "preorder";
  imageUrls: string[];
  merchantUrl?: string;
  affiliateUrl: string;
  specs?: Record<string, string>;
  sku?: string;
  mpn?: string;
  gtin?: string;
}

export interface SyncResult {
  status: "success" | "partial" | "failed" | "skipped";
  fetched: number;
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  removed?: number;
  errorMessage?: string;
  durationMs: number;
  lastSuccessfulSync?: string | null;
}

export interface ProductProvider {
  id: ProviderId;
  name: string;
  country?: string;
  /** Configuration-only status (no network). */
  getStatus(): ProviderRuntimeStatus;
  /** Optional live probe — returns false if not configured. */
  testConnection(): Promise<{ ok: boolean; message: string }>;
  /** Fetch + normalize batch. Must no-op with skipped status when not configured. */
  sync(options?: { full?: boolean; limit?: number }): Promise<SyncResult>;
  /** Build a tracked affiliate URL when the network supports it. */
  buildAffiliateUrl?(baseUrl: string, extraParams?: Record<string, string>): string;
}
