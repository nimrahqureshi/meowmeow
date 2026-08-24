import { db } from "@/db";
import { products, productOffers, merchants } from "@/db/schema";
import { sql, count, eq } from "drizzle-orm";
import { getIntegrationStatuses, isDemoMode } from "@/lib/integrations";
import { SITE_URL } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * System health — safe diagnostics. Never returns secrets.
 */
export async function GET() {
  const started = Date.now();
  let dbOk = false;
  let productCount = 0;
  let offerCount = 0;
  let merchantCount = 0;
  let dbError: string | null = null;

  try {
    await db.execute(sql`select 1`);
    dbOk = true;
    const [p, o, m] = await Promise.all([
      db.select({ c: count() }).from(products).where(eq(products.published, true)),
      db.select({ c: count() }).from(productOffers),
      db.select({ c: count() }).from(merchants).where(eq(merchants.active, true)),
    ]);
    productCount = Number(p[0]?.c ?? 0);
    offerCount = Number(o[0]?.c ?? 0);
    merchantCount = Number(m[0]?.c ?? 0);
  } catch (e) {
    dbError = e instanceof Error ? e.message.slice(0, 200) : "database error";
  }

  const integrations = getIntegrationStatuses().map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    status: i.status,
    detail: i.detail,
  }));

  const catalogReady = dbOk && productCount > 0;
  const overall = !dbOk ? "failed" : !catalogReady ? "warning" : "healthy";

  return Response.json({
    ok: dbOk,
    overall,
    demoMode: isDemoMode(),
    siteUrl: SITE_URL,
    latencyMs: Date.now() - started,
    database: {
      status: dbOk ? "healthy" : "failed",
      error: dbError,
    },
    catalog: {
      publishedProducts: productCount,
      offers: offerCount,
      activeMerchants: merchantCount,
      ready: catalogReady,
      note: catalogReady
        ? "Catalog has published products"
        : "No published products — run migrations and seed/import against this DATABASE_URL",
    },
    integrations,
  });
}
