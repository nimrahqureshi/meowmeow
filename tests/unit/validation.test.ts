import { describe, expect, it } from "vitest";
import { parseCount, parseId, parseText, readJson } from "@/lib/validation";

/**
 * REGRESSION (rc.3): write endpoints trusted the shape of their JSON body, so
 * a non-numeric quantity or rating became NaN, reached Postgres as an integer,
 * and surfaced as an unhandled 500 instead of a validation error.
 */

describe("parseId", () => {
  it("accepts positive integers", () => {
    expect(parseId(1)).toBe(1);
    expect(parseId(4242)).toBe(4242);
  });

  it("accepts numeric strings, since query params arrive as text", () => {
    expect(parseId("7")).toBe(7);
  });

  it.each([
    ["a non-numeric string", "abc"],
    ["an empty string", ""],
    ["zero", 0],
    ["a negative number", -1],
    ["a fraction", 1.5],
    ["NaN", Number.NaN],
    ["Infinity", Number.POSITIVE_INFINITY],
    ["null", null],
    ["undefined", undefined],
    ["an object", { id: 1 }],
    ["an array", [1]],
    ["a boolean", true],
  ])("rejects %s", (_label, value) => {
    expect(parseId(value)).toBeNull();
  });
});

describe("parseCount", () => {
  const opts = { min: 1, max: 99, fallback: 1 };

  it("passes through an in-range value", () => {
    expect(parseCount(5, opts)).toBe(5);
  });

  it("clamps above the maximum", () => {
    expect(parseCount(5000, opts)).toBe(99);
  });

  it("clamps below the minimum — a negative quantity must never reach the cart", () => {
    expect(parseCount(-500, opts)).toBe(1);
  });

  it("rounds fractional input", () => {
    expect(parseCount(2.6, opts)).toBe(3);
  });

  it("returns the fallback for non-numeric input rather than producing NaN", () => {
    expect(parseCount("abc", opts)).toBe(1);
    expect(parseCount(undefined, opts)).toBe(1);
    expect(parseCount(Number.NaN, opts)).toBe(1);
    expect(parseCount({}, opts)).toBe(1);
  });

  it("never returns NaN for any input", () => {
    for (const v of ["x", null, undefined, {}, [], true, Number.NaN, Infinity, -Infinity]) {
      expect(Number.isNaN(parseCount(v, opts))).toBe(false);
    }
  });

  it("supports a sentinel fallback so callers can distinguish 'absent' from 'zero'", () => {
    expect(parseCount("nope", { min: 0, max: 99, fallback: -1 })).toBe(-1);
    expect(parseCount(0, { min: 0, max: 99, fallback: -1 })).toBe(0);
  });
});

describe("parseText", () => {
  it("trims surrounding whitespace", () => {
    expect(parseText("  hello  ", 50)).toBe("hello");
  });

  it("caps length so oversized bodies cannot be stored", () => {
    expect(parseText("x".repeat(500), 60)).toHaveLength(60);
  });

  it("treats blank and whitespace-only input as absent", () => {
    expect(parseText("", 50)).toBeNull();
    expect(parseText("   ", 50)).toBeNull();
  });

  it("rejects non-string input", () => {
    expect(parseText(42, 50)).toBeNull();
    expect(parseText(null, 50)).toBeNull();
    expect(parseText({}, 50)).toBeNull();
  });
});

describe("readJson", () => {
  it("parses a valid body", async () => {
    const req = new Request("http://test.local", { method: "POST", body: JSON.stringify({ a: 1 }) });
    await expect(readJson(req)).resolves.toEqual({ a: 1 });
  });

  it("returns null instead of throwing on malformed JSON", async () => {
    const req = new Request("http://test.local", { method: "POST", body: "{not json" });
    await expect(readJson(req)).resolves.toBeNull();
  });

  it("returns null on an empty body", async () => {
    const req = new Request("http://test.local", { method: "POST" });
    await expect(readJson(req)).resolves.toBeNull();
  });
});
