"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Scale, Eye } from "lucide-react";
import { useStore } from "@/components/store";
import { cn, discountPercent, formatPrice } from "@/lib/utils";
import { Badge, RatingStars } from "@/components/ui";
import SmartImage from "@/components/SmartImage";

export interface CardProduct {
  id: number;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  rating: number;
  reviewCount: number;
  images: string[];
  badges: string[];
  store: string;
  inStock: boolean;
  color?: string | null;
}

/**
 * ProductCard — premium catalog card.
 *
 * DOM contract (hydration + a11y): interactive elements are NEVER nested.
 * The media link, the badges, and the hover actions are absolutely-positioned
 * *siblings* inside the media region — no <a> inside <a>, no <button> inside
 * <a> — so the browser's parsed tree always matches React's, and every
 * control is independently keyboard-reachable.
 */
export default function ProductCard({ product, index = 0 }: { product: CardProduct; index?: number }) {
  const { wishlistIds, toggleWishlist, toggleCompare, compareIds, addToCart } = useStore();
  const wished = wishlistIds.includes(product.id);
  const compared = compareIds.includes(product.id);
  const off = discountPercent(product.price, product.compareAtPrice);

  const badgeTone = (b: string) => {
    if (/best seller/i.test(b)) return "gold" as const;
    if (/deal|sale/i.test(b)) return "green" as const;
    if (/new/i.test(b)) return "dark" as const;
    if (/trending/i.test(b)) return "rose" as const;
    return "brand" as const;
  };

  return (
    <article
      className="group relative rounded-3xl bg-card border border-line overflow-hidden card-hover reveal flex flex-col"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      {/* Media region — link and controls are siblings, never nested */}
      <div className="relative aspect-[4/5] overflow-hidden bg-soft">
        <Link href={`/products/${product.slug}`} className="absolute inset-0 block" aria-label={product.name} tabIndex={-1}>
          <SmartImage
            src={product.images[0]}
            alt=""
            tint={product.color}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {product.images[1] && (
            <SmartImage
              src={product.images[1]}
              alt=""
              tint={product.color}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        {/* Badges (decorative, click-through) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none">
          {product.badges.slice(0, 2).map((b) => (
            <Badge key={b} tone={badgeTone(b)}>{b}</Badge>
          ))}
        </div>
        {off > 0 && (
          <span className="absolute top-3 right-3 bg-rose-500 text-white text-[11px] font-bold px-2 py-1 rounded-full shadow-lg pointer-events-none">
            -{off}%
          </span>
        )}

        {/* Hover actions — siblings of the link, shown on hover/focus */}
        <div className="absolute bottom-3 inset-x-3 flex gap-2 transition-all duration-300 [@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => addToCart(product.id)}
            className="flex-1 h-10 rounded-xl bg-white/95 backdrop-blur text-[#191621] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-white transition shadow-lg"
          >
            <ShoppingBag size={14} /> Add to cart
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur flex items-center justify-center text-[#191621] shadow-lg hover:bg-white transition"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye size={16} />
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{product.store}</p>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => toggleCompare(product.id)}
              className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition", compared ? "text-brand bg-brand/10" : "text-muted hover:text-brand hover:bg-soft")}
              aria-label={compared ? `Remove ${product.name} from compare` : `Add ${product.name} to compare`}
              aria-pressed={compared}
              title="Compare"
            >
              <Scale size={14} />
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition", wished ? "text-rose-700 dark:text-rose-300" : "text-muted hover:text-rose-700 dark:text-rose-300 hover:bg-soft")}
              aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
              aria-pressed={wished}
              title="Wishlist"
            >
              <Heart size={14} fill={wished ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        <h3 className="mt-1.5 text-sm font-semibold leading-snug line-clamp-2">
          <Link href={`/products/${product.slug}`} className="group-hover:text-brand transition-colors focus-visible:text-brand rounded-sm">
            {product.name}
          </Link>
        </h3>

        <div className="flex items-center gap-1.5 mt-2">
          <RatingStars rating={product.rating} size={12} />
          <span className="text-[11px] text-muted">({product.reviewCount.toLocaleString("en-US")})</span>
        </div>

        <div className="flex items-baseline gap-2 mt-auto pt-3">
          <span className="font-display font-bold text-lg text-gradient">{formatPrice(product.price)}</span>
          {product.compareAtPrice && <span className="text-xs text-muted line-through">{formatPrice(product.compareAtPrice)}</span>}
        </div>

        {!product.inStock && <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300 mt-1">Out of stock</p>}
      </div>
    </article>
  );
}
