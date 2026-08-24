"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Affiliate disclosure.
 *
 * FTC guidance asks for the disclosure to appear *before* the affiliate link
 * and without scrolling — a footer line does not satisfy that. This component
 * sits next to every outbound CTA so the relationship is clear at the moment
 * the shopper decides to click.
 *
 * `inline` is the compact form for use directly beneath a button; `panel` is
 * the fuller statement for the top of a listing page.
 */
export default function AffiliateDisclosure({
  variant = "inline",
  className,
}: {
  variant?: "inline" | "panel";
  className?: string;
}) {
  if (variant === "inline") {
    return (
      <p className={cn("flex items-start gap-1.5 text-[11px] leading-relaxed text-muted", className)}>
        <Info size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          We may earn a commission if you buy through this link — at no extra cost to you, and it never
          changes the price you pay.
        </span>
      </p>
    );
  }

  return (
    <div className={cn("glass rounded-2xl p-4 flex items-start gap-3", className)}>
      <span className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
        <Info size={16} aria-hidden="true" />
      </span>
      <p className="text-xs leading-relaxed text-muted">
        <span className="font-semibold text-fg">Affiliate disclosure. </span>
        MeowMeow may earn a commission when you buy through links on this site. This never costs you more
        and does not influence which products we list. Prices and availability are shown as last recorded
        and can change — always confirm on the merchant&apos;s own page.
      </p>
    </div>
  );
}
