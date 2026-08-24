import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Info, ShieldCheck, Store } from "lucide-react";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description:
    "How MeowMeow makes money, what an affiliate link is, and what it means for you as a shopper. Written plainly, with no small print.",
  alternates: { canonical: "/affiliate-disclosure" },
  openGraph: {
    title: "Affiliate Disclosure · MeowMeow",
    description: "How MeowMeow makes money and what that means for you.",
    url: "/affiliate-disclosure",
  },
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-12">
      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand">Transparency</p>
      <h1 className="font-display text-3xl md:text-5xl font-extrabold mt-2 tracking-tight">Affiliate disclosure</h1>
      <p className="text-muted mt-4 text-lg leading-relaxed">
        MeowMeow is funded by affiliate commissions. This page explains exactly what that means, because you
        deserve to know how a site that recommends products pays for itself.
      </p>

      <div className="glass rounded-3xl p-6 mt-10 border-l-4 border-l-brand">
        <p className="text-sm leading-relaxed">
          <span className="font-bold">In one sentence: </span>
          some links on MeowMeow are affiliate links, and if you buy through one we may earn a commission
          from the retailer — at no additional cost to you.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        {[
          { icon: Store, title: "We are not the shop", body: "You buy from the retailer, not from us. They take payment and ship the order." },
          { icon: ShieldCheck, title: "Your price is unchanged", body: "The commission is paid by the retailer out of their margin. You never pay more." },
          { icon: Info, title: "Listings are not for sale", body: "No retailer can pay to be featured or ranked higher on this site." },
        ].map((c) => (
          <div key={c.title} className="glass rounded-2xl p-5">
            <span className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <c.icon size={18} />
            </span>
            <h2 className="font-display font-bold mt-3 text-base">{c.title}</h2>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="prose-mm mt-12 space-y-8">
        <section>
          <h2 className="font-display text-2xl font-bold">What an affiliate link is</h2>
          <p className="text-muted mt-3 leading-relaxed">
            When you tap a button such as &ldquo;View deal&rdquo;, you leave MeowMeow and arrive at the
            retailer&apos;s own website. The link carries a tag that tells the retailer you came from us. If
            you go on to buy something, they may pay us a small percentage of the order.
          </p>
          <p className="text-muted mt-3 leading-relaxed">
            That is the whole mechanism. There is no cost to you, no markup, and no change to the price or
            terms you would have received by visiting the retailer directly.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold">How this affects what we list</h2>
          <p className="text-muted mt-3 leading-relaxed">
            We choose what to list from merchant catalogues using published specifications, merchant ratings
            and the size of the discount against list price. We do not currently test products in our own
            hands, and we would rather say so than imply otherwise. Where we have not used something, we
            will not pretend we have.
          </p>
          <p className="text-muted mt-3 leading-relaxed">
            No retailer pays for placement, ranking or a favourable description. Commission rates differ
            between retailers, and we accept that as a limitation worth naming: it is a reason to read our
            reasoning rather than take a recommendation on trust.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold">Prices, stock and accuracy</h2>
          <p className="text-muted mt-3 leading-relaxed">
            Prices and availability shown on MeowMeow are as last recorded and can change at any time. The
            retailer&apos;s own page is always the source of truth — please confirm the final price there
            before buying.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold">Orders, delivery and returns</h2>
          <p className="text-muted mt-3 leading-relaxed">
            MeowMeow does not process payments, hold stock, ship parcels or handle returns. Your purchase
            contract is with the retailer. For anything to do with an order — delivery, a refund, a fault,
            or customer service — please contact them directly, as we have no access to their systems.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold">Where you will see this disclosure</h2>
          <p className="text-muted mt-3 leading-relaxed">
            Next to affiliate buttons on product pages, within buying guides that link to retailers, in the
            site footer, and on this page. If you ever find an affiliate link on MeowMeow that is not
            disclosed, please{" "}
            <Link href="/contact" className="text-brand font-semibold hover:underline">
              tell us
            </Link>{" "}
            and we will correct it.
          </p>
        </section>
      </div>

      <div className="glass rounded-3xl p-6 mt-12 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-muted flex-1">
          Questions about how we work, or about a specific recommendation?
        </p>
        <Link
          href="/contact"
          className="h-11 px-5 rounded-2xl bg-gradient-to-r from-brand to-brand-2 text-white text-sm font-bold inline-flex items-center justify-center gap-2 btn-shine"
        >
          Contact us <ExternalLink size={15} />
        </Link>
      </div>
    </div>
  );
}
