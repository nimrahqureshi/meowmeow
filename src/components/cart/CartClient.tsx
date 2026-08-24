"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, BadgePercent, Check, Sparkles, AlertCircle } from "lucide-react";
import { useStore } from "@/components/store";
import { discountPercent, formatPrice } from "@/lib/utils";
import { EmptyState, RatingStars } from "@/components/ui";
import { cn } from "@/lib/utils";
import SmartImage from "@/components/SmartImage";

interface CartItem {
  id: number;
  qty: number;
  product: {
    id: number;
    slug: string;
    name: string;
    price: number;
    compareAtPrice: number | null;
    rating: number;
    reviewCount: number;
    images: string[];
    store: string;
  };
}

interface Coupon {
  code: string;
  title: string;
  discountType: string;
  value: number;
  minSpend: number;
}

export default function CartClient({ initial, coupons }: { initial: CartItem[]; coupons: Coupon[] }) {
  const { removeFromCart } = useStore();
  const [items, setItems] = useState<CartItem[]>(initial);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<Coupon | null>(null);
  const [couponMsg, setCouponMsg] = useState("");

  const refresh = async () => {
    const res = await fetch("/api/cart");
    const data = await res.json();
    setItems(data.items);
  };

  // Sync with fresh server data on navigation (adjust-state-during-render).
  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setItems(initial);
  }

  const changeQty = async (productId: number, qty: number) => {
    await fetch("/api/cart", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, qty }) });
    refresh();
  };

  const remove = async (productId: number) => {
    await removeFromCart(productId);
    refresh();
  };

  const applyCoupon = () => {
    const found = coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
    if (!found) {
      setCouponMsg("That code isn't valid. Try MEOW10 or FLASH25.");
      setApplied(null);
      return;
    }
    setApplied(found);
    setCouponMsg(`${found.code} applied — ${found.title.toLowerCase()}`);
  };

  const subtotal = items.reduce((a, i) => a + i.product.price * i.qty, 0);
  const original = items.reduce((a, i) => a + (i.product.compareAtPrice ?? i.product.price) * i.qty, 0);
  const savings = Math.max(0, original - subtotal);
  const discount = applied
    ? applied.discountType === "percent"
      ? (subtotal * applied.value) / 100
      : applied.value
    : 0;

  if (items.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add products here before you head to the store — they'll be waiting when you get back."
          action={{ label: "Start browsing", href: "/products" }}
          secondaryAction={{ label: "View wishlist", href: "/wishlist" }}
        />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-8 mt-8 items-start">
      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => {
          const off = discountPercent(item.product.price, item.product.compareAtPrice);
          return (
            <div key={item.id} className="glass rounded-3xl p-4 flex gap-4 card-hover">
              <Link href={`/products/${item.product.slug}`} className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-soft shrink-0">
                <SmartImage src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover"  />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{item.product.store}</p>
                    <Link href={`/products/${item.product.slug}`} className="font-bold text-sm md:text-base leading-snug line-clamp-1 hover:text-brand transition">
                      {item.product.name}
                    </Link>
                    <div className="flex items-center gap-1.5 mt-1">
                      <RatingStars rating={item.product.rating} size={12} />
                      <span className="text-[10px] text-muted">({item.product.reviewCount.toLocaleString()})</span>
                    </div>
                  </div>
                  <button onClick={() => remove(item.product.id)} className="w-8 h-8 rounded-lg hover:bg-rose-500/10 text-muted hover:text-rose-700 dark:text-rose-300 flex items-center justify-center transition shrink-0" aria-label="Remove item">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => changeQty(item.product.id, item.qty - 1)} className="w-8 h-8 rounded-lg bg-soft hover:bg-brand/10 flex items-center justify-center transition" aria-label="Decrease quantity">
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{item.qty}</span>
                    <button onClick={() => changeQty(item.product.id, item.qty + 1)} className="w-8 h-8 rounded-lg bg-soft hover:bg-brand/10 flex items-center justify-center transition" aria-label="Increase quantity">
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-lg text-gradient">{formatPrice(item.product.price * item.qty)}</p>
                    {off > 0 && <p className="text-[10px] text-muted line-through">{formatPrice((item.product.compareAtPrice ?? item.product.price) * item.qty)}</p>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:underline mt-2">
          ← Continue browsing
        </Link>
      </div>

      {/* Summary */}
      <aside className="glass rounded-3xl p-6 sticky top-28">
        <h2 className="font-display font-bold text-lg">Order summary</h2>

        <div className="space-y-2.5 mt-4 text-sm">
          <div className="flex justify-between text-muted">
            <span>Original price</span>
            <span className="line-through">{formatPrice(original)}</span>
          </div>
          <div className="flex justify-between text-emerald-700 dark:text-emerald-300 font-semibold">
            <span>Markdowns saved</span>
            <span>-{formatPrice(savings)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-brand font-semibold">
              <span>Coupon {applied?.code}</span>
              <span>-{formatPrice(Math.min(discount, subtotal))}</span>
            </div>
          )}
          <div className="border-t border-line pt-3 flex justify-between font-display text-xl font-extrabold">
            <span>Total</span>
            <span className="text-gradient">{formatPrice(Math.max(0, subtotal - discount))}</span>
          </div>
        </div>

        {/* Coupon */}
        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
            <BadgePercent size={12} className="text-brand" /> Have a coupon?
          </p>
          <div className="flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. MEOW10" className="flex-1 h-10 px-3.5 rounded-xl bg-soft border border-line outline-none text-xs font-bold uppercase tracking-wider focus:border-brand/50 transition" />
            <button onClick={applyCoupon} className="h-10 px-4 rounded-xl bg-brand/10 text-brand text-xs font-bold hover:bg-brand/20 transition">
              Apply
            </button>
          </div>
          {couponMsg && (
            <p className={cn("text-[11px] font-bold mt-2 flex items-center gap-1", applied ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300")} role="status">
              {applied ? <Check size={12} /> : <AlertCircle size={12} />} {couponMsg}
            </p>
          )}
        </div>

        {/* Available coupons */}
        {coupons.length > 0 && (
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">Active codes</p>
            <div className="flex flex-wrap gap-1.5">
              {coupons.map((c) => (
                <button key={c.code} onClick={() => { setCode(c.code); setApplied(c); setCouponMsg(`${c.code} applied — ${c.title.toLowerCase()}`); }} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-soft hover:bg-brand/10 hover:text-brand transition border border-line">
                  {c.code}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-[11px] text-muted mt-5 leading-relaxed">
          <Sparkles size={12} className="inline text-brand" /> When you&apos;re ready, we&apos;ll route you to the store with the best total price for these items.
        </p>

        <a href={items.length ? `/api/click/${items[0].product.slug}` : "#"} target="_blank" rel="noopener noreferrer sponsored" className="mt-4 flex h-12 items-center justify-center gap-2 rounded-2xl bg-fg text-bg dark:bg-white dark:text-[#0a0812] font-extrabold text-sm btn-shine hover:opacity-90 transition">
          <Check size={16} /> Check out at best store
        </a>
      </aside>
    </div>
  );
}