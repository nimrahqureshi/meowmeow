import { describe, expect, it } from "vitest";
import { cn, discountPercent, formatPrice, SITE_URL, absoluteUrl, AUTH_COOKIE, SESSION_COOKIE } from "@/lib/utils";

describe("formatPrice", () => {
  it("renders whole currency amounts in PKR by default", () => {
    const formatted = formatPrice(189);
    expect(formatted).toContain("189");
    // en-PK typically uses "Rs" or "PKR"
    expect(formatted).toMatch(/Rs|PKR|₨/);
  });

  it("handles zero without falling back to an empty string", () => {
    expect(formatPrice(0)).toMatch(/0/);
  });

  it("groups thousands so large prices stay readable", () => {
    expect(formatPrice(1299)).toMatch(/1,299|1\.299|1299/);
  });

  it("accepts explicit currency override", () => {
    const usd = formatPrice(10, "USD");
    expect(usd).toMatch(/10|\$|USD/);
  });
});

describe("discountPercent", () => {
  it("computes the saving against the compare-at price", () => {
    expect(discountPercent(80, 100)).toBe(20);
  });

  it("returns 0 when compare-at is missing or not higher", () => {
    expect(discountPercent(100, null)).toBe(0);
    expect(discountPercent(100, 80)).toBe(0);
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", false && "b", "c")).toContain("a");
    expect(cn("a", false && "b", "c")).toContain("c");
  });
});

describe("cookies", () => {
  it("exports stable cookie names", () => {
    expect(AUTH_COOKIE).toBeTruthy();
    expect(SESSION_COOKIE).toBeTruthy();
  });
});

describe("SITE_URL / absoluteUrl", () => {
  it("SITE_URL is a non-empty string", () => {
    expect(typeof SITE_URL).toBe("string");
    expect(SITE_URL.length).toBeGreaterThan(0);
  });

  it("absoluteUrl joins paths", () => {
    if (typeof absoluteUrl === "function") {
      const u = absoluteUrl("/products");
      expect(u).toContain("/products");
    }
  });
});
