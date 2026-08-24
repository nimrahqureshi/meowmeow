"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  TicketPercent,
  Users,
  Mail,
  Inbox,
  BarChart3,
  TrendingUp,
  MousePointerClick,
  Star,
  ExternalLink,
  ChevronRight,
  Search,
} from "lucide-react";
import { cn, formatPrice, timeAgo } from "@/lib/utils";

interface AdminProps {
  products: { id: number; name: string; price: number; rating: number; reviewCount: number; store: string; clicks: number; slug: string }[];
  categories: { id: number; name: string; emoji: string; slug: string; isCollection: boolean }[];
  brands: { id: number; name: string }[];
  users: { id: number; name: string; email: string; role: string; createdAt: string }[];
  coupons: { id: number; code: string; title: string; discountType: string; value: number; active: boolean; validUntil: string | null }[];
  subscribers: { id: number; email: string; createdAt: string }[];
  messages: { id: number; name: string; email: string; subject: string; body: string; createdAt: string }[];
  stats: { products: number; users: number; clicks: number; reviews: number; subscribers: number; messages: number; blogs: number; avgRating: number; inventory: number };
  topByClicks: { name: string; clicks: number; price: number }[];
  topByRevenue: { name: string; revenue: number }[];
}

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "products", label: "Products", icon: Package },
  { id: "coupons", label: "Coupons", icon: TicketPercent },
  { id: "users", label: "Users", icon: Users },
  { id: "subscribers", label: "Newsletter", icon: Mail },
  { id: "messages", label: "Messages", icon: Inbox },
  { id: "support", label: "Support", icon: Inbox },
  { id: "jobs", label: "Jobs", icon: BarChart3 },
];

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${32 - (v / max) * 28}`).join(" ");
  return (
    <svg viewBox="0 0 100 34" className="w-full h-10" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AdminClient(props: AdminProps) {
  const [tab, setTab] = useState("overview");
  const [q, setQ] = useState("");
  const { stats } = props;

  const filteredProducts = props.products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">Admin</p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-1">Command center</h1>
        </div>
        <Link href="/products" className="text-xs font-bold text-brand hover:underline flex items-center gap-1">
          View storefront <ExternalLink size={12} />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto mt-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold transition border",
              tab === t.id ? "bg-gradient-to-r from-brand to-brand-2 text-white border-transparent shadow-lg shadow-brand/25" : "glass hover:border-brand/40"
            )}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* ---------- OVERVIEW ---------- */}
      {tab === "overview" && (
        <div className="mt-6 space-y-6 pop-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { l: "Products live", v: stats.products, icon: Package, tone: "from-brand to-brand-2" },
              { l: "Affiliate clicks", v: stats.clicks.toLocaleString(), icon: MousePointerClick, tone: "from-amber-500 to-orange-500" },
              { l: "Members", v: stats.users, icon: Users, tone: "from-emerald-500 to-teal-500" },
              { l: "Newsletter", v: stats.subscribers, icon: Mail, tone: "from-sky-500 to-cyan-500" },
            ].map((c) => (
              <div key={c.l} className="glass rounded-3xl p-5 card-hover">
                <span className={cn("w-10 h-10 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shadow-lg", c.tone)}>
                  <c.icon size={16} />
                </span>
                <p className="font-display text-3xl font-extrabold mt-3">{c.v}</p>
                <p className="text-xs text-muted mt-1">{c.l}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="glass rounded-3xl p-6">
              <h3 className="font-bold flex items-center gap-2"><TrendingUp size={16} className="text-brand" /> Health metrics</h3>
              <div className="mt-4 space-y-4">
                {[
                  { l: "Avg product rating", v: stats.avgRating.toFixed(2), pct: Math.min(100, (stats.avgRating / 5) * 100), tone: "bg-amber-400" },
                  { l: "Inventory in stock", v: `${stats.inventory}/${stats.products}`, pct: Math.min(100, (stats.inventory / Math.max(1, stats.products)) * 100), tone: "bg-emerald-500" },
                  { l: "Reviews collected", v: stats.reviews.toLocaleString(), pct: Math.min(100, (stats.reviews / Math.max(1, stats.products * 20)) * 100), tone: "bg-brand" },
                  { l: "Blog posts", v: String(stats.blogs), pct: Math.min(100, (stats.blogs / 12) * 100), tone: "bg-brand-2" },
                ].map((m) => (
                  <div key={m.l}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted">{m.l}</span>
                      <span className="font-bold">{m.v}</span>
                    </div>
                    <div className="h-2 rounded-full bg-soft overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-700", m.tone)} style={{ width: `${m.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-3xl p-6">
              <h3 className="font-bold flex items-center gap-2"><Star size={16} className="text-brand" /> Top by affiliate clicks</h3>
              <div className="mt-4 space-y-2">
                {props.topByClicks.slice(0, 6).map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-soft transition">
                    <span className="w-7 h-7 rounded-lg bg-brand/10 text-brand text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <p className="text-sm font-semibold truncate flex-1">{p.name}</p>
                    <span className="text-xs text-muted">{p.clicks} clicks</span>
                    <span className="text-xs font-bold">{formatPrice(p.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- ANALYTICS ---------- */}
      {tab === "analytics" && (
        <div className="mt-6 grid lg:grid-cols-2 gap-4 pop-in">
          <div className="glass rounded-3xl p-6">
            <h3 className="font-bold">Click performance (top 10)</h3>
            <div className="mt-4 space-y-3">
              {props.topByClicks.map((p, i) => {
                const max = props.topByClicks[0]?.clicks ?? 1;
                return (
                  <div key={p.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold truncate max-w-[60%]">{p.name}</span>
                      <span className="text-muted">{p.clicks}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-soft overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-2 transition-all duration-700" style={{ width: `${(p.clicks / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <h3 className="font-bold">Commission & revenue</h3>
            <p className="text-[11px] text-muted mt-1">Commission data is shown only when verified merchant/network rates and actual attribution data are available.</p>
            <div className="mt-4 rounded-2xl bg-soft p-5 text-sm text-muted">
              Commission information unavailable for the current catalog.
            </div>
          </div>
          <div className="glass rounded-3xl p-6 lg:col-span-2">
            <h3 className="font-bold">Weekly click trend</h3>
            <div className="mt-4">
              <Sparkline values={[4, 7, 5, 12, 9, 16, 14, 22, 18, 27, 24, 31, 29, 38, 42]} />
            </div>
          </div>
        </div>
      )}

      {/* ---------- PRODUCTS ---------- */}
      {tab === "products" && (
        <div className="mt-6 glass rounded-3xl p-5 pop-in">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="w-full h-10 pl-10 pr-4 rounded-xl bg-soft border border-line outline-none text-sm focus:border-brand/50 transition" />
            </div>
            <p className="text-xs text-muted">{filteredProducts.length} of {props.products.length} products</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted border-b border-line">
                  <th className="py-3 pr-4">Product</th>
                  <th className="py-3 pr-4">Store</th>
                  <th className="py-3 pr-4">Price</th>
                  <th className="py-3 pr-4">Rating</th>
                  <th className="py-3 pr-4">Reviews</th>
                  <th className="py-3 pr-4">Clicks</th>
                  <th className="py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredProducts.slice(0, 30).map((p) => (
                  <tr key={p.id} className="border-b border-line/50 hover:bg-soft/50 transition">
                    <td className="py-3 pr-4 font-semibold max-w-[260px] truncate">{p.name}</td>
                    <td className="py-3 pr-4 text-muted">{p.store}</td>
                    <td className="py-3 pr-4 font-bold">{formatPrice(p.price)}</td>
                    <td className="py-3 pr-4 text-amber-700 dark:text-amber-300 font-bold"><span className="inline-flex items-center gap-1"><Star size={12} className="fill-current" />{p.rating}</span></td>
                    <td className="py-3 pr-4 text-muted">{p.reviewCount.toLocaleString()}</td>
                    <td className="py-3 pr-4 font-bold text-brand">{p.clicks}</td>
                    <td className="py-3">
                      <Link href={`/products/${p.slug}`} className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-1">
                        View <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------- COUPONS ---------- */}
      {tab === "coupons" && (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pop-in">
          {props.coupons.map((c) => (
            <div key={c.id} className={cn("glass rounded-3xl p-5 card-hover border", !c.active && "opacity-50")}>
              <div className="flex items-center justify-between">
                <span className="font-display font-extrabold text-lg text-gradient">{c.code}</span>
                <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full", c.active ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/10 text-rose-700 dark:text-rose-300")}>
                  {c.active ? "Active" : "Paused"}
                </span>
              </div>
              <p className="text-sm font-semibold mt-2">{c.title}</p>
              <p className="text-xs text-muted mt-1">
                {c.discountType === "percent" ? `${c.value}% off` : `$${c.value} off`}
                {c.validUntil ? ` · valid until ${new Date(c.validUntil).toLocaleDateString()}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ---------- USERS ---------- */}
      {tab === "users" && (
        <div className="mt-6 glass rounded-3xl p-5 pop-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted border-b border-line">
                  <th className="py-3 pr-4">Member</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {props.users.map((u) => (
                  <tr key={u.id} className="border-b border-line/50">
                    <td className="py-3 pr-4 font-semibold">{u.name}</td>
                    <td className="py-3 pr-4 text-muted">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full", u.role === "admin" ? "bg-brand/10 text-brand" : "bg-soft text-muted")}>{u.role}</span>
                    </td>
                    <td className="py-3 text-muted">{timeAgo(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------- SUBSCRIBERS ---------- */}
      {tab === "subscribers" && (
        <div className="mt-6 glass rounded-3xl p-5 pop-in">
          <p className="text-sm text-muted mb-4">{props.subscribers.length} subscribers · double opt-in enabled</p>
          <div className="flex flex-wrap gap-2">
            {props.subscribers.map((s) => (
              <span key={s.id} className="glass rounded-full px-4 py-2 text-sm font-semibold">{s.email} <span className="text-[10px] text-muted">· {timeAgo(s.createdAt)}</span></span>
            ))}
          </div>
        </div>
      )}

      {/* ---------- MESSAGES ---------- */}
      {tab === "messages" && (
        <div className="mt-6 space-y-3 pop-in">
          {props.messages.length === 0 && <p className="glass rounded-3xl p-10 text-center text-sm text-muted">No messages yet.</p>}
          {props.messages.map((m) => (
            <div key={m.id} className="glass rounded-3xl p-5 card-hover">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-brand-2 text-white text-sm font-bold flex items-center justify-center">{m.name.charAt(0)}</span>
                <div>
                  <p className="text-sm font-bold">{m.name} <span className="text-xs font-medium text-muted">· {m.email}</span></p>
                  <p className="text-xs text-brand font-semibold">{m.subject}</p>
                </div>
                <span className="ml-auto text-[11px] text-muted">{timeAgo(m.createdAt)}</span>
              </div>
              <p className="text-sm text-muted mt-3 leading-relaxed">{m.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* ---------- SUPPORT ---------- */}
      {tab === "support" && (
        <div className="mt-6 glass rounded-3xl p-6 pop-in">
          <h2 className="text-lg font-bold mb-2">Support tickets</h2>
          <p className="text-sm text-muted mb-4">
            Tickets are created via the Contact page, AI escalation, or POST /api/support.
            Use the Support API to list, reply, and change status (admin session required).
          </p>
          <ul className="text-sm space-y-2 list-disc pl-5 text-muted">
            <li>Statuses: open · pending · resolved · closed</li>
            <li>Priorities: low · normal · high · urgent</li>
            <li>AI can escalate unresolved shopping questions into tickets</li>
            <li>Customers receive acknowledgement email when SMTP is configured</li>
          </ul>
        </div>
      )}

      {/* ---------- JOBS ---------- */}
      {tab === "jobs" && (
        <div className="mt-6 glass rounded-3xl p-6 pop-in">
          <h2 className="text-lg font-bold mb-2">Background jobs</h2>
          <p className="text-sm text-muted mb-4">
            Queue is stored in the <code className="text-xs">jobs</code> table. Trigger workers with
            a protected POST to <code className="text-xs">/api/jobs/run</code> using <code className="text-xs">CRON_SECRET</code>.
          </p>
          <ul className="text-sm space-y-2 list-disc pl-5 text-muted">
            <li>product_sync · price_sync · stock_sync</li>
            <li>price_alerts · email_queue · social_queue · content_queue</li>
            <li>broken_link_check · catalog_cleanup · sitemap_refresh · analytics_rollup</li>
            <li>Locks, retries, exponential backoff, and stale-lock recovery included</li>
          </ul>
        </div>
      )}
    </div>
  );
}
