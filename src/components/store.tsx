"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { parseJson, useStorageValue, writeStorage } from "@/lib/client-store";

export interface StoreProduct {
  id: number;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  rating: number;
  reviewCount: number;
  images: string[];
  store: string;
}

interface StoreState {
  cartCount: number;
  wishlistIds: number[];
  compareIds: number[];
  ready: boolean;
  addToCart: (productId: number, qty?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  toggleWishlist: (productId: number) => Promise<void>;
  toggleCompare: (productId: number) => void;
  clearCompare: () => void;
}

const COMPARE_KEY = "mm-compare";

const StoreContext = createContext<StoreState>({
  cartCount: 0,
  wishlistIds: [],
  compareIds: [],
  ready: false,
  addToCart: async () => {},
  removeFromCart: async () => {},
  toggleWishlist: async () => {},
  toggleCompare: () => {},
  clearCompare: () => {},
});

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [ready, setReady] = useState(false);

  // Compare list lives in localStorage via the SSR-safe external store:
  // server & hydration render [], the real list appears right after mount.
  const compareRaw = useStorageValue(COMPARE_KEY);
  const compareIds = useMemo(() => parseJson<number[]>(compareRaw, []).slice(0, 4), [compareRaw]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/meta")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setCartCount(data.cartCount ?? 0);
        setWishlistIds(data.wishlistIds ?? []);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const addToCart = useCallback(async (productId: number, qty = 1) => {
    await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, qty }) });
    const meta = await fetch("/api/meta").then((r) => r.json());
    setCartCount(meta.cartCount ?? 0);
  }, []);

  const removeFromCart = useCallback(async (productId: number) => {
    await fetch("/api/cart", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
    const meta = await fetch("/api/meta").then((r) => r.json());
    setCartCount(meta.cartCount ?? 0);
  }, []);

  const toggleWishlist = useCallback(
    async (productId: number) => {
      const inList = wishlistIds.includes(productId);
      // Optimistic update, reconciled by the network call.
      setWishlistIds((prev) => (inList ? prev.filter((id) => id !== productId) : [...prev, productId]));
      await fetch("/api/wishlist", {
        method: inList ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      }).catch(() => {
        // Roll back on failure.
        setWishlistIds((prev) => (inList ? [...prev, productId] : prev.filter((id) => id !== productId)));
      });
    },
    [wishlistIds]
  );

  const toggleCompare = useCallback(
    (productId: number) => {
      const current = parseJson<number[]>(typeof window === "undefined" ? null : localStorage.getItem(COMPARE_KEY), []);
      const next = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : current.length >= 4
          ? [...current.slice(1), productId]
          : [...current, productId];
      writeStorage(COMPARE_KEY, JSON.stringify(next));
    },
    []
  );

  const clearCompare = useCallback(() => writeStorage(COMPARE_KEY, JSON.stringify([])), []);

  return (
    <StoreContext.Provider
      value={{ cartCount, wishlistIds, compareIds, ready, addToCart, removeFromCart, toggleWishlist, toggleCompare, clearCompare }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
