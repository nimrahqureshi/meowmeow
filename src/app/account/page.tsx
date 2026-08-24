import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { users, clicks, products, wishlistItems, cartItems, notifications } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { getCurrentUser, getSessionUser } from "@/lib/auth";
import { timeAgo } from "@/lib/utils";
import { getSessionId } from "@/lib/session";
import { Heart, ShoppingBag, MousePointerClick, Bell, Settings, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import SmartImage from "@/components/SmartImage";

export const metadata: Metadata = { title: "My account", description: "Your MeowMeow account — wishlist, cart, clicks and settings." };

export default async function AccountPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  // The row may have been deleted since the token was issued.
  const account = await getCurrentUser();
  if (!account) redirect("/login");

  const [user, myClicks, wishCount, cartCount, notifs] = await Promise.all([
    db.select().from(users).where(eq(users.id, session.uid)).limit(1),
    db
      .select({ product: products, clickedAt: clicks.createdAt })
      .from(clicks)
      .innerJoin(products, eq(clicks.productId, products.id))
      .where(eq(clicks.sessionId, await getSessionId()))
      .orderBy(desc(clicks.createdAt))
      .limit(8),
    db.select({ c: count() }).from(wishlistItems).where(eq(wishlistItems.sessionId, await getSessionId())),
    db.select({ c: count() }).from(cartItems).where(eq(cartItems.sessionId, await getSessionId())),
    db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(5),
  ]);

  const me = user[0];
  const sid = await getSessionId();

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="glass rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="aurora-blob w-64 h-64 bg-brand/15 -top-20 -right-10" />
        <div className="relative flex flex-wrap items-center gap-5">
          <span className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand-2 text-white text-3xl flex items-center justify-center shadow-xl shadow-brand/30">
            {me.avatar ?? me.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold">{me.name}</h1>
            <p className="text-sm text-muted">{me.email}</p>
            <span className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand/10 text-brand">
              <ShieldCheck size={12} /> {me.role === "admin" ? "Administrator" : "Verified member"}
            </span>
          </div>
          <div className="ml-auto grid grid-cols-2 sm:flex gap-3">
            {[
              { icon: Heart, v: wishCount[0]?.c ?? 0, l: "Wishlist" },
              { icon: ShoppingBag, v: cartCount[0]?.c ?? 0, l: "In cart" },
            ].map((s) => (
              <div key={s.l} className="glass rounded-2xl px-5 py-3 text-center">
                <p className="font-display font-extrabold text-xl">{s.v}</p>
                <p className="text-[10px] text-muted font-bold uppercase tracking-wider flex items-center gap-1 justify-center"><s.icon size={10} /> {s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 mt-6 items-start">
        {/* Recent affiliate clicks */}
        <div className="glass rounded-3xl p-6">
          <h2 className="font-bold flex items-center gap-2 text-lg"><MousePointerClick size={16} className="text-brand" /> Recent store visits</h2>
          <p className="text-xs text-muted mt-1">Products you clicked through to buy — tracked so we can alert you on price drops.</p>
          {myClicks.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl">🖱️</p>
              <p className="text-sm text-muted mt-3">No store visits yet — browse the catalog and your journey starts here.</p>
              <Link href="/products" className="inline-block mt-4 px-5 h-10 leading-10 rounded-xl bg-gradient-to-r from-brand to-brand-2 text-white text-sm font-bold btn-shine">
                Start shopping
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {myClicks.map((c, i) => (
                <Link key={i} href={`/products/${c.product.slug}`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-soft transition">
                  <SmartImage src={c.product.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover"  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{c.product.name}</p>
                    <p className="text-[11px] text-muted">Visited {timeAgo(c.clickedAt)}</p>
                  </div>
                  <span className="text-xs font-bold text-brand">${c.product.price}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Side */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6">
            <h2 className="font-bold flex items-center gap-2 text-lg"><Bell size={16} className="text-brand" /> Notifications</h2>
            <div className="mt-3 space-y-3">
              {notifs.map((n) => (
                <div key={n.id} className="flex gap-3">
                  <span className="w-8 h-8 rounded-lg bg-soft flex items-center justify-center text-base shrink-0">{n.icon}</span>
                  <div>
                    <p className="text-[13px] font-semibold leading-tight">{n.title}</p>
                    <p className="text-[11px] text-muted mt-0.5 line-clamp-2">{n.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <h2 className="font-bold flex items-center gap-2 text-lg"><Settings size={16} className="text-brand" /> Settings</h2>
            <div className="mt-4 space-y-2.5">
              <Link href="/wishlist" className="flex items-center justify-between p-3.5 rounded-2xl bg-soft hover:bg-brand/10 transition text-sm font-semibold">
                My wishlist <Heart size={14} className="text-brand" />
              </Link>
              <Link href="/cart" className="flex items-center justify-between p-3.5 rounded-2xl bg-soft hover:bg-brand/10 transition text-sm font-semibold">
                My cart <ShoppingBag size={14} className="text-brand" />
              </Link>
              <Link href="/compare" className="flex items-center justify-between p-3.5 rounded-2xl bg-soft hover:bg-brand/10 transition text-sm font-semibold">
                Comparisons
              </Link>
              {me.role === "admin" && (
                <Link href="/admin" className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-brand to-brand-2 text-white text-sm font-semibold">
                  Admin dashboard <span>→</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-muted mt-6">Session id: {sid.slice(0, 8)}… · used to sync cart & wishlist across devices</p>
    </div>
  );
}