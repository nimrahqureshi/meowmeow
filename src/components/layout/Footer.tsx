import Link from "next/link";
import { ShieldCheck, CreditCard, Truck, RotateCcw } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";
import { getConfiguredSocialProfiles } from "@/lib/social";

const groups = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/products" },
      { label: "Today's deals", href: "/products?tag=deals" },
      { label: "Best sellers", href: "/products?tag=best-sellers" },
      { label: "Trending", href: "/products?tag=trending" },
      { label: "Premium picks", href: "/products?tag=premium-picks" },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "Buying guides", href: "/blog" },
      { label: "Compare products", href: "/compare" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "Categories", href: "/products" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About MeowMeow", href: "/about" },
      { label: "How it works", href: "/affiliate-disclosure" },
      { label: "Contact", href: "/contact" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Help & legal",
    links: [
      { label: "Affiliate disclosure", href: "/affiliate-disclosure" },
      { label: "Orders & returns", href: "/affiliate-disclosure" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
      { label: "Cookie settings", href: "/privacy" },
    ],
  },
]


export default function Footer() {
  const socials = getConfiguredSocialProfiles();
  return (
    <footer className="relative mt-24 overflow-hidden">
      {/* Newsletter band */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#17130f] via-[#1f1a14] to-[#100d0a] p-8 md:p-12">
          <div className="aurora-blob w-72 h-72 bg-brand/30 -top-20 -left-20" />
          <div className="aurora-blob w-72 h-72 bg-brand-2/30 -bottom-24 -right-16" style={{ animationDelay: "-8s" }} />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-300 text-pink-300">The MeowMeow Digest</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white mt-2">
                Deals & discoveries, <span className="text-gradient">twice a week.</span>
              </h2>
              <p className="text-white/60 text-sm mt-3 leading-relaxed max-w-md">
                Get the best deals we find, straight to your inbox. One email a week, unsubscribe any time.
              </p>
            </div>
            <div>
              <NewsletterForm tone="onDark" />
              <p className="text-white/40 text-[11px] mt-3">By subscribing you agree to our Privacy Policy. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: ShieldCheck, title: "Disclosed affiliate links", sub: "Every outbound link is marked" },
            { icon: CreditCard, title: "Discounts shown against list", sub: "You see what the saving is measured from" },
            { icon: Truck, title: "Straight to the merchant", sub: "One tap from listing to retailer" },
            { icon: RotateCcw, title: "Side-by-side compare", sub: "Up to four products at once" },
          ].map((b) => (
            <div key={b.title} className="glass rounded-2xl p-4 flex items-start gap-3 card-hover">
              <b.icon size={20} className="text-brand shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold">{b.title}</p>
                <p className="text-xs text-muted mt-0.5">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Link columns */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 mt-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
        <div className="col-span-2">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand to-brand-2 flex items-center justify-center text-white shadow-lg shadow-brand/30">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M12 21c-4.5 0-8-3.2-8-7.4C4 9.2 8 5.5 12 3c4 2.5 8 6.2 8 10.6 0 4.2-3.5 7.4-8 7.4z" fill="currentColor" opacity="0.9" />
                <circle cx="9" cy="11" r="1.4" fill="#fff" />
                <circle cx="15" cy="11" r="1.4" fill="#fff" />
              </svg>
            </span>
            <span className="font-display font-bold text-lg">Meow<span className="text-gradient">Meow</span></span>
          </Link>
          <p className="text-sm text-muted leading-relaxed mt-4 max-w-xs">
            A curated affiliate shopping platform. Compare hand-picked products side by side, then buy from the retailer.
          </p>
          <div className="flex gap-2 mt-5">
            {socials.map((s) => (
              <a key={s.platform} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="w-9 h-9 rounded-xl glass flex items-center justify-center text-muted hover:text-brand hover:border-brand/40 transition text-[10px] font-semibold">
                {s.iconPath ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                    <path d={s.iconPath} />
                  </svg>
                ) : (
                  s.label.slice(0, 2)
                )}
              </a>
            ))}
          </div>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <p className="text-sm font-bold mb-3.5">{g.title}</p>
            <ul className="space-y-2.5">
              {g.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13px] text-muted hover:text-brand transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line mt-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted">© {new Date().getFullYear()} MeowMeow. All rights reserved.</p>
          <p className="text-[11px] text-muted/80 text-center md:text-right max-w-xl">
            Disclosure: MeowMeow is an affiliate platform — we may earn a commission when you buy through our links, at no extra cost to you. Prices and availability are shown as last recorded and can change — always confirm on the retailer&apos;s page.
          </p>
        </div>
      </div>
    </footer>
  );
}
