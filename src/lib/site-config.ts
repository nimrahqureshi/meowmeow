import type { LucideIcon } from "lucide-react";
import { BadgePercent, Gift, Layers, ShieldCheck } from "lucide-react";

/**
 * Announcement bar content.
 *
 * Kept as data rather than markup so the messaging can be changed without
 * touching the header, and so it is obvious at a glance that nothing here
 * invents urgency, discounts or deadlines. Every line must be true of the
 * site as it actually is.
 */
export interface Announcement {
  id: string;
  icon: LucideIcon;
  text: string;
  href?: string;
}

export const ANNOUNCEMENTS: Announcement[] = [
  { id: "curated", icon: Layers, text: "Curated deals from trusted retailers", href: "/products" },
  { id: "disclosed", icon: ShieldCheck, text: "Every affiliate link is clearly marked" },
  { id: "deals", icon: BadgePercent, text: "Browse today's biggest markdowns", href: "/products?tag=deals" },
  { id: "gifts", icon: Gift, text: "Gift guide — curated picks by budget", href: "/products?category=gifts" },
];

/** Primary navigation, shared by the desktop header and the mobile drawer. */
export const PRIMARY_NAV: { label: string; href: string }[] = [
  { label: "Shop", href: "/products" },
  { label: "Deals", href: "/products?tag=deals" },
  { label: "Best Sellers", href: "/products?tag=best-sellers" },
  { label: "Blog", href: "/blog" },
];
