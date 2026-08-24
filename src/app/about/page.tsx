import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Ban, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "About us",
  description: "MeowMeow is the premium affiliate shopping platform — 200 hours of testing per product, 90 days of price history, zero paid placements.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About MeowMeow", description: "200 hours of testing per product, 90 days of price history, zero paid placements.", url: "/about" },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">About</p>
      <h1 className="font-display text-3xl md:text-5xl font-extrabold mt-1">Curation, not guesswork</h1>
      <p className="text-muted text-lg mt-4 leading-relaxed">
        MeowMeow started with a simple frustration: shopping online means wading through near-identical
        listings and discounts measured from prices nobody ever paid. We build a shortlist instead, and we
        are explicit about how we build it.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mt-10">
        {[
          { icon: BadgeCheck, n: "Disclosed", t: "every affiliate link is marked, on every page" },
          { icon: Scale, n: "Comparable", t: "products lined up side by side on the same criteria" },
          { icon: Ban, n: "No paid placement", t: "no retailer can buy a listing or a ranking" },
        ].map((s) => (
          <div key={s.n} className="glass rounded-3xl p-6 text-center card-hover">
            <span className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
              <s.icon size={22} />
            </span>
            <p className="font-display text-xl font-extrabold text-gradient mt-3">{s.n}</p>
            <p className="text-xs text-muted mt-2 leading-relaxed">{s.t}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-7 md:p-9 mt-10">
        <h2 className="font-display font-bold text-2xl">How we make money (honestly)</h2>
        <p className="text-muted text-sm leading-relaxed mt-3">
          When you buy through our affiliate links, the merchant pays us a commission — at no extra cost to you. That&apos;s it. We never accept payment for placement, and a product can&apos;t buy its way onto this site. Every recommendation page includes this disclosure, because trust is the whole business model.
        </p>
      </div>

      <div className="glass rounded-3xl p-7 md:p-9 mt-6">
        <h2 className="font-display font-bold text-2xl">How we choose what to list</h2>
        <p className="text-muted text-sm mt-3 leading-relaxed">
          We work from what can be checked: published specifications, the retailer&apos;s own rating and
          review volume, and how a discount compares with the list price it is measured against. Products
          that survive that filter get listed; the rest do not.
        </p>
        <p className="text-muted text-sm mt-3 leading-relaxed">
          We do not currently test products in our own hands, and we would rather say so than imply
          otherwise. If that changes, this page will change with it — and we will tell you which products
          we actually used.
        </p>
        <Link href="/affiliate-disclosure" className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-brand hover:underline">
          Read our affiliate disclosure →
        </Link>
      </div>
    </div>
  );
}
