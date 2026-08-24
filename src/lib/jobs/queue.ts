/**
 * Serverless-compatible job queue with locks, retries, and idempotency.
 * Designed for Vercel / short-lived workers. Long syncs should be chunked.
 */

import { db } from "@/db";
import { jobs } from "@/db/schema";
import { eq, and, lte, or, isNull, lt } from "drizzle-orm";
import { randomBytes } from "crypto";

export type JobType =
  | "product_sync"
  | "price_sync"
  | "stock_sync"
  | "price_alerts"
  | "email_queue"
  | "social_queue"
  | "content_queue"
  | "broken_link_check"
  | "catalog_cleanup"
  | "sitemap_refresh"
  | "analytics_rollup";

export type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

function makeJobId(type: string): string {
  return `${type}_${Date.now()}_${randomBytes(6).toString("hex")}`;
}

export async function enqueueJob(
  type: JobType,
  payload: Record<string, unknown> = {},
  options: { maxRetries?: number; timeoutMs?: number; scheduledFor?: Date; idempotencyKey?: string } = {}
) {
  const jobId = options.idempotencyKey ?? makeJobId(type);

  // Idempotency: if a job with this key already exists and is not failed/cancelled, reuse it
  if (options.idempotencyKey) {
    const existing = (
      await db.select().from(jobs).where(eq(jobs.jobId, jobId)).limit(1)
    )[0];
    if (existing && existing.status !== "failed" && existing.status !== "cancelled") {
      return existing;
    }
  }

  const [row] = await db
    .insert(jobs)
    .values({
      jobId,
      type,
      status: "queued",
      payload,
      maxRetries: options.maxRetries ?? 3,
      timeoutMs: options.timeoutMs ?? 300_000,
      scheduledFor: options.scheduledFor ?? new Date(),
    })
    .returning();

  return row;
}

/**
 * Claim the next available job of a given type (or any).
 * Uses a lock token so concurrent workers do not process the same job.
 */
export async function claimNextJob(types?: JobType[]): Promise<typeof jobs.$inferSelect | null> {
  const lockToken = randomBytes(16).toString("hex");
  const now = new Date();

  // Find candidates
  const candidates = await db
    .select()
    .from(jobs)
    .where(
      and(
        or(eq(jobs.status, "queued"), eq(jobs.status, "failed")),
        or(isNull(jobs.scheduledFor), lte(jobs.scheduledFor, now)),
        // Allow retry of failed jobs under max retries
        or(eq(jobs.status, "queued"), lt(jobs.retryCount, jobs.maxRetries))
      )
    )
    .limit(20);

  for (const candidate of candidates) {
    if (types && !types.includes(candidate.type as JobType)) continue;
    if (candidate.status === "failed" && candidate.retryCount >= candidate.maxRetries) continue;

    // Attempt lock
    const updated = await db
      .update(jobs)
      .set({
        status: "running",
        lockToken,
        lockedAt: now,
        startedAt: now,
        retryCount: candidate.status === "failed" ? candidate.retryCount + 1 : candidate.retryCount,
      })
      .where(and(eq(jobs.id, candidate.id), or(eq(jobs.status, "queued"), eq(jobs.status, "failed"))))
      .returning();

    if (updated[0]) return updated[0];
  }

  return null;
}

export async function completeJob(jobId: string, result?: Record<string, unknown>) {
  await db
    .update(jobs)
    .set({
      status: "completed",
      result: result ?? {},
      finishedAt: new Date(),
      lockToken: null,
    })
    .where(eq(jobs.jobId, jobId));
}

export async function failJob(jobId: string, errorMessage: string) {
  const row = (await db.select().from(jobs).where(eq(jobs.jobId, jobId)).limit(1))[0];
  if (!row) return;

  const finalFail = row.retryCount >= row.maxRetries;
  await db
    .update(jobs)
    .set({
      status: finalFail ? "failed" : "queued",
      errorMessage,
      finishedAt: finalFail ? new Date() : null,
      lockToken: null,
      lockedAt: null,
      // exponential backoff via scheduledFor
      scheduledFor: finalFail
        ? null
        : new Date(Date.now() + Math.min(60_000 * Math.pow(2, row.retryCount), 30 * 60_000)),
    })
    .where(eq(jobs.jobId, jobId));
}

export async function cancelJob(jobId: string) {
  await db
    .update(jobs)
    .set({ status: "cancelled", finishedAt: new Date(), lockToken: null })
    .where(eq(jobs.jobId, jobId));
}

/** Release locks that have exceeded timeout (stale worker) */
export async function releaseStaleLocks() {
  const rows = await db.select().from(jobs).where(eq(jobs.status, "running"));
  const now = Date.now();
  for (const row of rows) {
    if (!row.lockedAt) continue;
    const age = now - new Date(row.lockedAt).getTime();
    if (age > row.timeoutMs) {
      await db
        .update(jobs)
        .set({
          status: "queued",
          lockToken: null,
          lockedAt: null,
          errorMessage: "Lock timed out — released for retry",
        })
        .where(eq(jobs.id, row.id));
    }
  }
}
