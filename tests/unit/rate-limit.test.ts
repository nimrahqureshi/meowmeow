import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { limit, tooMany } from "@/lib/rate-limit";

/**
 * REGRESSION (rc.2/rc.3): public write endpoints were unthrottled, and the
 * expensive read endpoints (chat, search) plus click tracking could be driven
 * without limit — inflating affiliate analytics and amplifying database load.
 */

let counter = 0;
/** Unique key per test so buckets from other tests never bleed in. */
const key = () => `test-scope-${counter++}`;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("limit", () => {
  it("allows requests up to the maximum", () => {
    const k = key();
    for (let i = 0; i < 5; i++) {
      expect(limit(k, { max: 5, windowMs: 60_000 }).ok).toBe(true);
    }
  });

  it("blocks the request after the maximum", () => {
    const k = key();
    for (let i = 0; i < 5; i++) limit(k, { max: 5, windowMs: 60_000 });
    expect(limit(k, { max: 5, windowMs: 60_000 }).ok).toBe(false);
  });

  it("counts down the remaining allowance", () => {
    const k = key();
    expect(limit(k, { max: 3, windowMs: 60_000 }).remaining).toBe(2);
    expect(limit(k, { max: 3, windowMs: 60_000 }).remaining).toBe(1);
    expect(limit(k, { max: 3, windowMs: 60_000 }).remaining).toBe(0);
  });

  it("reports a positive retryAfter once blocked", () => {
    const k = key();
    for (let i = 0; i < 3; i++) limit(k, { max: 3, windowMs: 60_000 });
    expect(limit(k, { max: 3, windowMs: 60_000 }).retryAfter).toBeGreaterThan(0);
  });

  it("refills once the window has elapsed", () => {
    const k = key();
    for (let i = 0; i < 3; i++) limit(k, { max: 3, windowMs: 1_000 });
    expect(limit(k, { max: 3, windowMs: 1_000 }).ok).toBe(false);

    vi.advanceTimersByTime(1_001);
    expect(limit(k, { max: 3, windowMs: 1_000 }).ok).toBe(true);
  });

  it("keeps separate callers in separate buckets", () => {
    const a = key();
    const b = key();
    for (let i = 0; i < 3; i++) limit(a, { max: 3, windowMs: 60_000 });

    expect(limit(a, { max: 3, windowMs: 60_000 }).ok).toBe(false);
    expect(limit(b, { max: 3, windowMs: 60_000 }).ok).toBe(true);
  });
});

describe("tooMany", () => {
  it("responds 429 with a Retry-After header", async () => {
    const res = tooMany(42);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("42");
    await expect(res.json()).resolves.toHaveProperty("error");
  });

  it("never emits a Retry-After below one second", () => {
    expect(tooMany(0).headers.get("Retry-After")).toBe("1");
  });
});
