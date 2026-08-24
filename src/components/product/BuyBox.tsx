"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Scale, ShoppingBag, ExternalLink, Share2, Check, Truck, RotateCcw, ShieldCheck, BadgePercent, Info } from "lucide-react";
import { useStore } from "@/components/store";
import { cn, discountPercent, formatPrice } from "@/lib/utils";
import { RatingStars } from "@/components/ui";
import { SITE_URL } from "@/lib/utils";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";

export interface BuyBoxProduct {
  id: number;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  rating: number;
  reviewCount: number;
  store: string;
  badges: string[];
  inStock: boolean;
  description: string;
  /** Empty for demo catalogue entries that have no real merchant link. */
  affiliateUrl: string;
}

export default function BuyBox({ product, coupon }: { product: BuyBoxProduct; coupon?: { code: string; title: string; value: number; discountType: string } | null }) {
  const { wishlistIds, toggleWishlist, compareIds, toggleCompare, addToCart, cartCount } = useStore();
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const wished = wishlistIds.includes(product.id);
  const compared = compareIds.includes(product.id);
  const off = discountPercent(product.price, product.compareAtPrice);

  const handleAdd = async () => {
    await addToCart(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const couponText = coupon
    ? coupon.discountType === "percent"
      ? `${coupon.value}% off`
      : `$${coupon.value} off`
    : null;

  return (
    <div className="glass rounded-3xl p-6 md:p-7 sticky top-28">
      {/* Store + badges */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted">{product.store} · verified merchant</span>
        <div className="flex gap-1.5">
          {product.badges.slice(0, 2).map((b) => (
            <span key={b} className="text-[10px] font-bold px-2 py-1 rounded-full bg-brand/10 text-brand">{b}</span>
          ))}
        </div>
      </div>

      <h1 className="font-display text-2xl md:text-3xl font-extrabold leading-tight mt-3">{product.name}</h1>

      <div className="flex items-center gap-2 mt-3">
        <RatingStars rating={product.rating} />
        <a href="#reviews" className="text-sm font-semibold text-brand inline-flex items-center min-h-6 px-1">{product.rating}</a>
        <span className="text-xs text-muted">· {product.reviewCount.toLocaleString()} reviews</span>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3 mt-5">
        <span className="font-display text-4xl font-extrabold text-gradient">{formatPrice(product.price)}</span>
        {product.compareAtPrice && (
          <>
            <span className="text-lg text-muted line-through">{formatPrice(product.compareAtPrice)}</span>
            <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">Save {off}%</span>
          </>
        )}
      </div>
      <p className="text-[11px] text-muted mt-1.5 flex items-center gap-1">
        <ShieldCheck size={12} className="text-emerald-700 dark:text-emerald-300" /> Discount shown against the retailer’s list price
      </p>

      {/* Coupon */}
      {coupon && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-brand/40 bg-brand/5 p-3.5">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-2 text-white flex items-center justify-center shrink-0">
            <BadgePercent size={18} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">{couponText} with code</p>
            <p className="text-xs text-muted truncate">{coupon.title}</p>
          </div>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(coupon.code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            }}
            className="shrink-0 px-3 py-2 rounded-xl bg-brand/10 text-brand text-xs font-bold hover:bg-brand/20 transition"
          >
            {copied ? "Copied!" : coupon.code}
          </button>
        </div>
      )}

      {/* Stock */}
      <p className={cn("text-sm font-bold mt-5 flex items-center gap-2", product.inStock ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300")}>
        <span className={cn("w-2 h-2 rounded-full", product.inStock ? "bg-emerald-500" : "bg-rose-500")} />
        {product.inStock ? "In stock — ships within 24h" : "Currently out of stock"}
      </p>

      {/* Actions */}
      <div className="space-y-2.5 mt-5">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleAdd}
            className={cn("h-12 rounded-2xl font-bold text-sm btn-shine transition flex items-center justify-center gap-2", added ? "bg-emerald-500 text-white" : "bg-gradient-to-r from-brand to-brand-2 text-white hover:opacity-95")}
          >
            {added ? <Check size={16} /> : <ShoppingBag size={16} />}
            {added ? "Added!" : "Save to cart"}
          </button>
          <button
            onClick={() => toggleWishlist(product.id)}
            className={cn("h-12 rounded-2xl font-bold text-sm border transition flex items-center justify-center gap-2", wished ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/40" : "border-line hover:border-rose-500/40 hover:text-rose-700 dark:text-rose-300")}
          >
            <Heart size={16} fill={wished ? "currentColor" : "none"} />
            {wished ? "Saved" : "Wishlist"}
          </button>
        </div>

        {product.affiliateUrl ? (
          <>
            <a
              href={`/api/click/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex h-14 rounded-2xl bg-fg text-bg dark:bg-white dark:text-[#0a0812] font-extrabold text-sm items-center justify-center gap-2 btn-shine hover:opacity-90 transition shadow-xl shadow-fg/20"
            >
              <ExternalLink size={16} /> View deal at {product.store}
            </a>
            <AffiliateDisclosure />
          </>
        ) : (
          /* Demo catalogue entry: there is no merchant link behind it, so the
             control is disabled and says why rather than sending the shopper
             to a page that does not exist. */
          <>
            <div
              role="note"
              className="flex h-14 rounded-2xl border border-dashed border-line text-muted font-semibold text-sm items-center justify-center gap-2 cursor-not-allowed"
            >
              <Info size={16} /> Sample product — no retailer link
            </div>
            <p className="text-[11px] text-muted text-center leading-relaxed">
              This listing is demonstration data. Real products link straight through to the retailer.
            </p>
          </>
        )}

        <button
          onClick={() => toggleCompare(product.id)}
          className={cn("w-full h-11 rounded-2xl text-sm font-bold border transition flex items-center justify-center gap-2", compared ? "bg-brand/10 text-brand border-brand/40" : "border-line hover:border-brand/40 hover:text-brand")}
        >
          <Scale size={16} /> {compared ? "Added to compare" : "Add to compare"} {compared && <Check size={14} />}
        </button>
      </div>

      {/* Perks */}
      <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-line">
        {[
          { icon: Truck, t: "Best store routing" },
          { icon: RotateCcw, t: "Merchant returns" },
          { icon: ShieldCheck, t: "Price-gap alerts" },
        ].map((p) => (
          <div key={p.t} className="text-center">
            <p.icon size={16} className="mx-auto text-brand" />
            <p className="text-[10px] font-bold mt-1.5 leading-tight">{p.t}</p>
          </div>
        ))}
      </div>

      {/* Share */}
      <div className="flex items-center gap-2 mt-5">
        <button onClick={share} className="flex-1 h-10 rounded-xl border border-line text-xs font-bold hover:border-brand/40 hover:text-brand transition flex items-center justify-center gap-1.5">
          <Share2 size={12} /> {copied ? "Link copied!" : "Share"}
        </button>
        <a href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(`${SITE_URL}/products/${product.slug}`)}&description=${encodeURIComponent(product.name)}`} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-xl border border-line flex items-center justify-center hover:border-brand/40 hover:text-brand transition" aria-label="Save to Pinterest">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6.5 2 2 6.5 2 12c0 4.2 2.6 7.9 6.4 9.3-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.9 1.5 1.9 1.8 0 3.2-1.9 3.2-4.7 0-2.4-1.7-4.1-4.2-4.1-2.9 0-4.6 2.1-4.6 4.4 0 .9.3 1.8.8 2.3.1.1.1.2.1.3l-.3 1.2c0 .2-.2.2-.4.1-1.2-.6-2-2.4-2-3.9 0-3.2 2.3-6.1 6.7-6.1 3.5 0 6.2 2.5 6.2 5.8 0 3.5-2.2 6.3-5.2 6.3-1 0-2-.5-2.3-1.1l-.6 2.4c-.2.9-.8 2-1.2 2.6.9.3 1.9.4 2.9.4 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${SITE_URL}/products/${product.slug}`)}`} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-xl border border-line flex items-center justify-center hover:border-brand/40 hover:text-brand transition" aria-label="Share on Facebook">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0022 12z"/></svg>
        </a>
        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${product.name} on MeowMeow`)}&url=${encodeURIComponent(`${SITE_URL}/products/${product.slug}`)}`} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-xl border border-line flex items-center justify-center hover:border-brand/40 hover:text-brand transition" aria-label="Share on X">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L1.6 2h6.4l4.4 5.9L18.9 2zm-1.1 18.1h1.7L7.1 3.8H5.3l12.5 16.3z"/></svg>
        </a>
      </div>
      {cartCount > 0 && (
        <Link href="/cart" className="block mt-3 text-center text-xs font-bold text-brand hover:underline">
          You have {cartCount} item{cartCount > 1 ? "s" : ""} in your cart — review before you buy →
        </Link>
      )}
    </div>
  );
}
