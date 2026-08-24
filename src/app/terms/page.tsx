import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of service", description: "The plain-English terms for using MeowMeow." };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">Legal</p>
      <h1 className="font-display text-3xl md:text-5xl font-extrabold mt-1">Terms of service</h1>
      <div className="space-y-6 mt-8 text-sm text-muted leading-relaxed">
        <section className="glass rounded-3xl p-6">
          <h2 className="font-bold text-fg text-lg mb-2">1. What MeowMeow is</h2>
          <p>MeowMeow is a discovery and comparison platform. We are not the seller of any product. Purchases happen on third-party merchant sites; their terms govern those transactions.</p>
        </section>
        <section className="glass rounded-3xl p-6">
          <h2 className="font-bold text-fg text-lg mb-2">2. Affiliate relationships</h2>
          <p>We may earn commissions from links to merchants. Prices and availability shown are accurate as of the last daily check but can change at any time on the merchant&apos;s site.</p>
        </section>
        <section className="glass rounded-3xl p-6">
          <h2 className="font-bold text-fg text-lg mb-2">3. Accounts</h2>
          <p>You are responsible for keeping your credentials safe. Accounts used for abuse, review manipulation, or scraping may be suspended.</p>
        </section>
        <section className="glass rounded-3xl p-6">
          <h2 className="font-bold text-fg text-lg mb-2">4. Content & reviews</h2>
          <p>Reviews reflect genuine user experiences. We moderate for spam and hate; we never delete honest negative feedback — it makes our recommendations better.</p>
        </section>
        <section className="glass rounded-3xl p-6">
          <h2 className="font-bold text-fg text-lg mb-2">5. No warranty</h2>
          <p>While we test exhaustively, products can still fail. Our recommendations are opinions, not guarantees. Merchant warranties and consumer law apply to your purchases.</p>
        </section>
      </div>
    </div>
  );
}
