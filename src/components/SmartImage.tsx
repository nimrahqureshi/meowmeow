"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * SmartImage — the one <img> wrapper used across the app.
 *
 * If the remote asset fails (dead CDN link, offline, blocked network) it swaps
 * to a branded fallback: a soft radial gradient tinted with the product's
 * accent `tint` (every product row stores one) plus the MeowMeow paw-dot mark.
 * Guarantees "zero broken images" without layout shift — the fallback fills
 * the exact same box.
 */
export default function SmartImage({
  src,
  alt,
  className,
  tint,
  loading = "lazy",
  fetchPriority,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  /** Accent hex used to tint the fallback (e.g. the product's dominant color). */
  tint?: string | null;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    const accent = tint && /^#([0-9a-f]{3}){1,2}$/i.test(tint) ? tint : "#e11d75";
    return (
      <span
        role="img"
        aria-label={alt}
        className={cn("block", className)}
        style={{
          background: `radial-gradient(120% 120% at 20% 10%, color-mix(in srgb, ${accent} 26%, var(--soft)) 0%, var(--soft) 55%, color-mix(in srgb, ${accent} 14%, var(--card)) 100%)`,
        }}
      >
        <svg viewBox="0 0 48 48" aria-hidden="true" className="w-full h-full opacity-[0.16]" fill="currentColor">
          <circle cx="24" cy="28" r="7" />
          <circle cx="13.5" cy="19" r="3.4" />
          <circle cx="34.5" cy="19" r="3.4" />
          <circle cx="18.5" cy="13" r="3" />
          <circle cx="29.5" cy="13" r="3" />
        </svg>
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
