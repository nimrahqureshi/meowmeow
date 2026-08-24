import Link from "next/link";
import { db } from "@/db";
import { wishlistItems, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionId } from "@/lib/session";
import ProductCard from "@/components/ProductCard";
import { Heart, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState } from "@/components/ui";

export const metadata: Metadata = { title: "Your wishlist", description: "Products you've saved — they'll be waiting when you're ready." };

export default async function WishlistPage() {
  const sessionId = await getSessionId();
  const rows = await db
    .select({ product: products })
    .from(wishlistItems)
    .innerJoin(products, eq(wishlistItems.productId, products.id))
    .where(eq(wishlistItems.sessionId, sessionId));

  const items = rows.map((r) => ({
    id: r.product.id,
    slug: r.product.slug,
    name: r.product.name,
    price: r.product.price,
    compareAtPrice: r.product.compareAtPrice,
    rating: r.product.rating,
    reviewCount: r.product.reviewCount,
    images: r.product.images,
    badges: r.product.badges,
    store: r.product.store,
    inStock: r.product.inStock,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">Wishlist</p>
      <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-1 flex items-center gap-3">
        Saved for later <Heart size={24} className="text-rose-700 dark:text-rose-300 fill-rose-500" />
      </h1>
      <p className="text-muted text-sm mt-2">{items.length} product{items.length === 1 ? "" : "s"} — synced across your devices.</p>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Heart}
            title="Nothing saved yet"
            description="Tap the heart on any product to save it here. Your wishlist stays with you across devices."
            action={{ label: "Browse products", href: "/products" }}
            secondaryAction={{ label: "See today's deals", href: "/products?tag=deals" }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
