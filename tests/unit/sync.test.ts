import { describe, expect, it } from "vitest";
import { rowToNormalizedOffer } from "@/lib/sync/import";

describe("authorized feed normalization", () => {
  it("normalizes a valid PKR feed row without inventing fields", () => {
    const offer = rowToNormalizedOffer({
      external_product_id: "SKU-123",
      merchant_slug: "daraz-pk",
      title: "Example Laptop",
      price: "149,999",
      currency: "PKR",
      availability: "in stock",
      image_urls: "https://example.com/a.jpg|https://example.com/b.jpg",
      merchant_url: "https://example.com/product",
      affiliate_url: "https://example.com/affiliate",
      brand: "Example",
      gtin: "1234567890123",
    });
    expect(offer).not.toBeNull();
    expect(offer?.price).toBe(149999);
    expect(offer?.currency).toBe("PKR");
    expect(offer?.availability).toBe("in_stock");
    expect(offer?.imageUrls).toHaveLength(2);
    expect(offer?.gtin).toBe("1234567890123");
  });

  it("rejects rows without a real affiliate destination", () => {
    expect(rowToNormalizedOffer({
      external_product_id: "1",
      merchant_slug: "merchant",
      title: "Example",
      price: 1000,
    })).toBeNull();
  });
});
