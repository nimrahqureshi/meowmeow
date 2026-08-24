import Link from "next/link";
import { Star, StarHalf, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-line overflow-hidden">
      <div className="skeleton aspect-[4/5]" />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-3.5 w-3/4 rounded-full" />
        <div className="skeleton h-3 w-1/2 rounded-full" />
        <div className="skeleton h-5 w-1/3 rounded-full" />
      </div>
    </div>
  );
}

export function RatingStars({ rating, size = 14, className }: { rating: number; size?: number; className?: string }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-amber-400", className)} aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) =>
        i < full ? (
          <Star key={i} size={size} fill="currentColor" strokeWidth={0} />
        ) : i === full && half ? (
          <StarHalf key={i} size={size} fill="currentColor" strokeWidth={0} />
        ) : (
          <Star key={i} size={size} className="opacity-25" fill="currentColor" strokeWidth={0} />
        )
      )}
    </span>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  href,
  linkLabel,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-7">
      <div>
        {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand mb-2">{eyebrow}</p>}
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-muted text-sm mt-2 max-w-xl">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-sm font-bold text-brand hover:gap-2.5 inline-flex items-center min-h-[24px] gap-1.5 group transition-all"
        >
          {linkLabel ?? "View all"}
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      )}
    </div>
  );
}

export function Badge({ children, tone = "brand" }: { children: React.ReactNode; tone?: "brand" | "gold" | "green" | "dark" | "rose" }) {
  const tones = {
    brand: "bg-brand/12 text-brand border-brand/25",
    gold: "bg-amber-400/15 text-amber-700 dark:text-amber-300 border-amber-400/30",
    green: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
    dark: "bg-fg/8 text-fg border-line",
    rose: "bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/25",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur", tones[tone])}>
      {children}
    </span>
  );
}

/**
 * EmptyState — the single empty/zero-data pattern for the whole app.
 * An empty screen is an invitation to act, so a primary action is required
 * rather than optional: every one of these screens offers a way forward.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action: { label: string; href?: string; onClick?: () => void };
  secondaryAction?: { label: string; href: string };
}) {
  const primaryClass =
    "inline-flex items-center justify-center h-11 px-6 rounded-2xl bg-gradient-to-r from-brand to-brand-2 text-white text-sm font-bold btn-shine hover:opacity-95 transition";
  return (
    <div className="glass rounded-3xl px-6 py-16 text-center">
      <span className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
        <Icon size={28} />
      </span>
      <h2 className="font-display font-bold text-xl mt-5">{title}</h2>
      <p className="text-muted text-sm mt-2 max-w-sm mx-auto leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-3 justify-center mt-7">
        {action.href ? (
          <Link href={action.href} className={primaryClass}>{action.label}</Link>
        ) : (
          <button type="button" onClick={action.onClick} className={primaryClass}>{action.label}</button>
        )}
        {secondaryAction && (
          <Link
            href={secondaryAction.href}
            className="inline-flex items-center justify-center h-11 px-6 rounded-2xl glass text-sm font-bold hover:border-brand/40 hover:text-brand transition"
          >
            {secondaryAction.label}
          </Link>
        )}
      </div>
    </div>
  );
}

/** Skeleton rail matching the product grid, for streaming/loading states. */
export function SkeletonGrid({ count = 8, className = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" }: { count?: number; className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
