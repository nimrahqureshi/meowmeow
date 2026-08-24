import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import React from "react";

/**
 * Component-test environment.
 *
 * Components under test are ordinary React, but they import a handful of
 * Next.js primitives that have no meaning outside a Next server. Those are
 * stubbed here — narrowly, so tests still exercise real component logic.
 */

// next/link renders a plain anchor; assertions about href stay meaningful.
vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string } & Record<string, unknown>) =>
    React.createElement("a", { href, ...rest }, children),
}));

export const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  prefetch: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

/** Node-environment tests share this setup file but have no DOM. */
const hasDom = typeof window !== "undefined";

// jsdom implements neither of these, and several components observe them.
beforeEach(() => {
  Object.values(routerMock).forEach((fn) => fn.mockClear?.());
  if (!hasDom) return;

  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;
  }

  if (!window.IntersectionObserver) {
    window.IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
      root = null;
      rootMargin = "";
      thresholds = [];
    } as unknown as typeof window.IntersectionObserver;
  }

  localStorage.clear();
});

afterEach(() => {
  if (hasDom) cleanup();
});
