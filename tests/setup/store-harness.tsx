import React from "react";
import { vi } from "vitest";
import * as storeModule from "@/components/store";

/**
 * Components read cart/wishlist/compare state from `useStore`, which in the
 * real app is backed by network calls. Tests need to drive that state and
 * assert on the resulting calls, so `useStore` is spied and given a value
 * built from the overrides supplied by each test.
 */
export function StoreContextValueForTests(overrides: Partial<ReturnType<typeof storeModule.useStore>> = {}) {
  const spies = {
    addToCart: vi.fn(async () => {}),
    removeFromCart: vi.fn(async () => {}),
    toggleWishlist: vi.fn(async () => {}),
    toggleCompare: vi.fn(),
    clearCompare: vi.fn(),
  };

  const value = {
    cartCount: 0,
    wishlistIds: [] as number[],
    compareIds: [] as number[],
    ready: true,
    ...spies,
    ...overrides,
  };

  vi.spyOn(storeModule, "useStore").mockReturnValue(value);

  const Provider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

  return { Provider, spies, value };
}
