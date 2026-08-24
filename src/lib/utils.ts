import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Default currency is PKR for Pakistan-first positioning. */
export function formatPrice(price: number, currency = "PKR") {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    minimumFractionDigits: price % 1 === 0 ? 0 : 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function discountPercent(price: number, compareAt?: number | null) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function timeAgo(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}


export const SESSION_COOKIE = "mm_session";
export const AUTH_COOKIE = "mm_auth";


export const hexToRgb = (hex: string) => {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const int = parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
};

export function colorDistance(a: string, b: string) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return Math.sqrt((ca.r - cb.r) ** 2 + (ca.g - cb.g) ** 2 + (ca.b - cb.b) ** 2);
}

/**
 * Canonical public origin of this deployment, without a trailing slash.
 *
 * Everything SEO-critical resolves through here — `metadataBase` (which in
 * turn resolves every canonical and Open Graph URL), the sitemap, robots.txt
 * and JSON-LD. These were previously hardcoded to the production domain, so
 * any other deployment (preview, staging, or a different domain entirely)
 * emitted canonical tags pointing at meowmeow.shop and handed its search
 * equity away. `NEXT_PUBLIC_APP_URL` was documented as controlling this but
 * was never actually read.
 */
export const SITE_URL = (() => {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  // On Vercel, VERCEL_URL is always present (e.g. meowmeow-deals.vercel.app).
  // Prefer https so sitemap/canonicals are not http-only when the explicit
  // public URL env is missing. Owner should still set NEXT_PUBLIC_APP_URL for
  // custom domains and stable production hostnames.
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "").replace(/\/+$/, "");
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[MeowMeow] NEXT_PUBLIC_APP_URL is not set; using VERCEL_URL. " +
          "Set NEXT_PUBLIC_APP_URL to your canonical domain before relying on SEO."
      );
    }
    return `https://${host}`;
  }

  // Local fallback only. Never invent a production marketing domain here.
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[MeowMeow] NEXT_PUBLIC_APP_URL is not set. Canonical URLs, Open Graph tags, " +
        "the sitemap and robots.txt will point at localhost. Set it before going live."
    );
  }
  return "http://localhost:3000";
})();

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
