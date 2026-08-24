import "server-only";
import { headers } from "next/headers";

/**
 * Fixed-window in-memory rate limiter.
 *
 * Adequate for a single-instance deployment and for blunting scripted abuse of
 * the write endpoints (auth, newsletter, contact, reviews). For multi-instance
 * or serverless deployments swap the Map for Redis/Upstash — the call sites
 * stay identical because the interface is just `limit(key, opts)`.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

/** Drop expired buckets occasionally so the Map can't grow unbounded. */
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfter: number;
}

export function limit(key: string, { max = 10, windowMs = 60_000 } = {}): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > max) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, remaining: max - bucket.count, retryAfter: 0 };
}

/**
 * Identify the caller for rate-limiting purposes.
 *
 * SECURITY: `x-forwarded-for` is attacker-controlled unless a trusted proxy
 * overwrites it. Reading it unconditionally let anyone defeat every limit on
 * the site — including login brute-force protection — simply by sending a
 * different value on each request.
 *
 * Resolution order:
 *   1. Platform headers the edge sets itself and a client cannot forge.
 *   2. `x-forwarded-for`, but only when TRUST_PROXY says a proxy is in front,
 *      and then taking the hop the proxy appended (the last entry) rather
 *      than the first, which the client controls.
 *   3. A single shared bucket. Stricter than per-IP, and the safe default:
 *      an unidentified caller cannot mint itself unlimited identities.
 */
export async function clientKey(scope: string) {
  const h = await headers();

  // Set by the platform edge; overwritten on every request, so unforgeable.
  const platformIp =
    h.get("cf-connecting-ip") ??
    h.get("true-client-ip") ??
    h.get("x-vercel-forwarded-for") ??
    h.get("x-real-ip");

  if (platformIp) return `${scope}:${platformIp.trim()}`;

  if (process.env.TRUST_PROXY === "1") {
    const chain = h.get("x-forwarded-for");
    if (chain) {
      // The proxy appends the peer it saw; earlier entries came from the client.
      const hops = chain.split(",").map((v) => v.trim()).filter(Boolean);
      const trusted = hops[hops.length - 1];
      if (trusted) return `${scope}:${trusted}`;
    }
  }

  return `${scope}:shared`;
}

/** 429 response with the standard Retry-After header. */
export function tooMany(retryAfter: number) {
  return Response.json(
    { error: "Too many requests. Please slow down and try again shortly." },
    { status: 429, headers: { "Retry-After": String(Math.max(1, retryAfter)) } }
  );
}
