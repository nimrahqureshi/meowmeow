"use client";

import { useSyncExternalStore } from "react";

/**
 * SSR-safe reactive localStorage.
 *
 * `useSyncExternalStore` renders the server snapshot during SSR *and* during
 * hydration, then re-renders with the real client value — which means:
 *   • zero hydration mismatches,
 *   • zero "setState synchronously in effect" patterns,
 *   • cross-tab + same-tab reactivity for free.
 *
 * All writes must go through `writeStorage` so same-tab subscribers update.
 */

const LOCAL_EVENT = "mm:storage";

type Listener = () => void;
const listeners = new Set<Listener>();

function subscribe(listener: Listener) {
  listeners.add(listener);
  const onStorage = () => listener();
  window.addEventListener("storage", onStorage);
  window.addEventListener(LOCAL_EVENT, onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LOCAL_EVENT, onStorage);
  };
}

function emit() {
  window.dispatchEvent(new Event(LOCAL_EVENT));
}

export function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode etc.) — stay in-memory silent */
  }
  emit();
}

/**
 * Reactive read of a localStorage key.
 * @param serverFallback value rendered on the server / during hydration.
 */
export function useStorageValue(key: string, serverFallback: string | null = null) {
  return useSyncExternalStore(
    subscribe,
    () => readStorage(key),
    () => serverFallback
  );
}

/** Reactive `prefers-color-scheme: dark`, SSR-safe (false on server). */
export function useSystemPrefersDark() {
  return useSyncExternalStore(
    (listener) => {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    },
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false
  );
}

/** Parse a JSON storage value with a stable fallback (memo-friendly). */
export function parseJson<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
