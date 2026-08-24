import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy policy", description: "How MeowMeow handles your data — plainly written, because privacy shouldn't need a lawyer." };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">Legal</p>
      <h1 className="font-display text-3xl md:text-5xl font-extrabold mt-1">Privacy policy</h1>
      <p className="text-muted mt-3">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      <div className="space-y-6 mt-8 text-sm text-muted leading-relaxed">
        <section className="glass rounded-3xl p-6">
          <h2 className="font-bold text-fg text-lg mb-2">1. What we collect</h2>
          <p>Your email (only if you subscribe or create an account), a pseudonymous session id for cart/wishlist sync, and anonymized click data for affiliate tracking. That&apos;s the whole list.</p>
        </section>
        <section className="glass rounded-3xl p-6">
          <h2 className="font-bold text-fg text-lg mb-2">2. What we never do</h2>
          <p>We never sell your data. We never show personalized ads. We never share your email with merchants. Your chat history with the AI assistant is not stored server-side.</p>
        </section>
        <section className="glass rounded-3xl p-6">
          <h2 className="font-bold text-fg text-lg mb-2">3. Cookies</h2>
          <p>We use essential cookies (theme, session, cart) and affiliate cookies set by the merchants you visit through our links. You can restrict to essentials via the cookie banner. GDPR: you can request full deletion of your data at any time via the contact form.</p>
        </section>
        <section className="glass rounded-3xl p-6">
          <h2 className="font-bold text-fg text-lg mb-2">4. Affiliate disclosure</h2>
          <p>MeowMeow participates in affiliate programs including Amazon Associates. As an Amazon Associate we earn from qualifying purchases. This never affects our recommendations.</p>
        </section>
        <section className="glass rounded-3xl p-6">
          <h2 className="font-bold text-fg text-lg mb-2">5. Your rights</h2>
          <p>Access, correction, export, and deletion of your personal data — all available on request to hello@meowmeow.shop. We respond within 30 days, usually much faster.</p>
        </section>
      </div>
    </div>
  );
}
