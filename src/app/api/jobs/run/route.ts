import { NextResponse } from "next/server";
import { claimNextJob, completeJob, failJob, releaseStaleLocks, type JobType } from "@/lib/jobs/queue";
import { processPriceAlerts } from "@/lib/sync/price-alerts";
import { processEmailQueue } from "@/lib/email/queue";
import { getProvider } from "@/lib/providers";
import { db } from "@/db";
import { productOffers } from "@/db/schema";
import { eq, and, lte, isNull } from "drizzle-orm";

/**
 * Cron / worker entrypoint.
 * Protect with CRON_SECRET header. Never leave unauthenticated.
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  const provided =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    req.headers.get("x-cron-secret") ||
    "";

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await releaseStaleLocks();

  const body = await req.json().catch(() => ({}));
  const types = (body.types as JobType[] | undefined) ?? undefined;
  const max = Math.min(Number(body.max) || 5, 20);

  const results: Array<{ jobId: string; type: string; status: string; detail?: string }> = [];

  for (let i = 0; i < max; i++) {
    const job = await claimNextJob(types);
    if (!job) break;

    try {
      let detail: Record<string, unknown> = {};

      switch (job.type as JobType) {
        case "price_alerts": {
          detail = await processPriceAlerts();
          break;
        }
        case "email_queue": {
          detail = await processEmailQueue();
          break;
        }
        case "product_sync":
        case "price_sync":
        case "stock_sync": {
          const providerId = (job.payload?.providerId as string) || "csv";
          const provider = getProvider(providerId);
          if (!provider) {
            throw new Error(`Unknown provider: ${providerId}`);
          }
          const syncResult = await provider.sync({
            full: Boolean(job.payload?.full),
            limit: typeof job.payload?.limit === "number" ? job.payload.limit : undefined,
          });
          detail = { ...syncResult };
          break;
        }
        case "broken_link_check": {
          const offers = await db.select().from(productOffers).where(isNull(productOffers.lastCheckedAt)).limit(50);
          let checked = 0, failed = 0;
          for (const offer of offers) {
            if (!offer.merchantUrl) continue;
            checked++;
            try {
              const controller = new AbortController();
              const timer = setTimeout(() => controller.abort(), 8000);
              const res = await fetch(offer.merchantUrl, { method: "HEAD", redirect: "manual", signal: controller.signal });
              clearTimeout(timer);
              if (!res.ok && ![301,302,303,307,308].includes(res.status)) failed++;
            } catch { failed++; }
            await db.update(productOffers).set({ lastCheckedAt: new Date() }).where(eq(productOffers.id, offer.id));
          }
          detail = { checked, failed };
          break;
        }
        case "catalog_cleanup": {
          const expired = await db.select({ id: productOffers.id }).from(productOffers).where(
            and(lte(productOffers.lastSyncedAt, new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)), eq(productOffers.availability, "unknown"))
          ).limit(100);
          detail = { staleOffersReviewed: expired.length };
          break;
        }
        case "sitemap_refresh":
        case "analytics_rollup":
        case "social_queue":
        case "content_queue": {
          detail = { status: "completed", message: `${job.type} has no external side effect until the corresponding authorized integration is configured.` };
          break;
        }
        default:
          throw new Error(`Unhandled job type: ${job.type}`);
      }

      await completeJob(job.jobId, detail);
      results.push({ jobId: job.jobId, type: job.type, status: "completed" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      await failJob(job.jobId, msg);
      results.push({ jobId: job.jobId, type: job.type, status: "failed", detail: msg });
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, results });
}
