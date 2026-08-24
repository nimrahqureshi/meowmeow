"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Mic,
  Image as ImageIcon,
  Heart,
  ShoppingBag,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  User,
  LayoutDashboard,
  LogOut,
  Zap,
  Sparkles,
  Flame,
  Star,
  Gem,
  BadgeDollarSign,
  Snowflake,
  Camera,
  ShieldCheck,
  PawPrint,
  Gift,
  BadgePercent,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "@/components/providers";
import { useStore } from "@/components/store";
import { cn, formatPrice } from "@/lib/utils";
import type { Category } from "@/db/schema";
import { CategoryIcon, stripEmoji } from "@/lib/category-icons";
import SmartImage from "@/components/SmartImage";

import AnnouncementBar from "@/components/layout/AnnouncementBar";
import { PRIMARY_NAV } from "@/lib/site-config";

interface Meta {
  categories: Category[];
  featured: { id: number; slug: string; name: string; price: number; images: string[]; color: string | null }[];
  cartCount: number;
  wishlistCount: number;
  notifications: { id: number; title: string; body: string; icon: string; createdAt: string }[];
  user: { id: number; name: string; email: string; role: string; avatar: string | null } | null;
}

interface Suggestion {
  id: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  store: string;
}

const COLLECTIONS: { label: string; icon: typeof Flame; slug: string; gradient: string }[] = [
  { label: "Trending", icon: Flame, slug: "trending", gradient: "from-orange-500 to-rose-500" },
  { label: "Best Sellers", icon: Star, slug: "best-sellers", gradient: "from-amber-500 to-yellow-500" },
  { label: "Premium Picks", icon: Gem, slug: "premium-picks", gradient: "from-violet-500 to-fuchsia-500" },
  { label: "Deals", icon: BadgeDollarSign, slug: "deals", gradient: "from-emerald-500 to-teal-500" },
  { label: "Seasonal", icon: Snowflake, slug: "seasonal", gradient: "from-sky-500 to-cyan-500" },
];

export default function Navbar() {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const { cartCount, wishlistIds, ready } = useStore();

  const [meta, setMeta] = useState<Meta | null>(null);
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/meta")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setMeta(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Dispose any in-flight search debounce so it can't fire after unmount.
  useEffect(() => () => clearTimeout(debounceRef.current ?? undefined), []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggest(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMegaOpen(false);
      setShowSuggest(false);
      setMobileOpen(false);
      setNotifOpen(false);
      setUserOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, []);

  // The drawer is a modal surface: the page behind it must not scroll.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  const onQuery = (value: string) => {
    setQ(value);
    clearTimeout(debounceRef.current ?? undefined);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggest(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
      const data = await res.json();
      setSuggestions(data.products ?? []);
      setShowSuggest(true);
    }, 220);
  };

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setShowSuggest(false);
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const startVoice = () => {
    const w = window as unknown as { webkitSpeechRecognition?: any; SpeechRecognition?: any };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice search is supported in Chrome, Edge and Safari. 🎤");
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    setListening(true);
    rec.onresult = (event: any) => {
      const text = event.results[0][0].transcript as string;
      setQ(text);
      setListening(false);
      router.push(`/search?q=${encodeURIComponent(text)}`);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  };

  const cats = meta?.categories ?? [];
  const realCats = cats.filter((c) => !c.isCollection);
  const collections = cats.filter((c) => c.isCollection);
  const featured = meta?.featured ?? [];

  const cartTotal = cartCount;
  const wishTotal = meta ? meta.wishlistCount : wishlistIds.length;

  return (
    <header className="sticky top-0 z-[80]">
      <AnnouncementBar />

      {/* Main bar */}
      <div className="glass-strong border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 md:h-[72px] flex items-center gap-3 md:gap-5">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden w-10 h-10 shrink-0 rounded-xl hover:bg-soft flex items-center justify-center transition"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="MeowMeow home">
            <span className="relative w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-gradient-to-br from-brand to-brand-2 flex items-center justify-center text-white shadow-lg shadow-brand/30 group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M12 21c-4.5 0-8-3.2-8-7.4C4 9.2 8 5.5 12 3c4 2.5 8 6.2 8 10.6 0 4.2-3.5 7.4-8 7.4z" fill="currentColor" opacity="0.9" />
                <circle cx="9" cy="11" r="1.4" fill="#fff" />
                <circle cx="15" cy="11" r="1.4" fill="#fff" />
                <path d="M10 15.5c.6.5 1.3.7 2 .7s1.4-.2 2-.7" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </span>
            <span className="font-display font-bold text-lg md:text-xl tracking-tight hidden sm:block">
              Meow<span className="text-gradient">Meow</span>
            </span>
          </Link>

          {/* Primary navigation */}
          <nav aria-label="Primary" className="hidden xl:flex items-center gap-1 shrink-0">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="h-10 px-3 rounded-xl inline-flex items-center text-sm font-semibold text-muted hover:text-fg hover:bg-soft transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop category trigger */}
          <div className="hidden lg:block relative" ref={megaRef}>
            <button
              onClick={() => setMegaOpen((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-sm font-semibold transition border",
                megaOpen ? "bg-brand/10 text-brand border-brand/30" : "border-line hover:bg-soft"
              )}
              aria-expanded={megaOpen}
              aria-controls="mega-menu"
              aria-haspopup="true"
            >
              <Menu size={16} /> Categories <ChevronDown size={14} className={cn("transition-transform", megaOpen && "rotate-180")} />
            </button>

            {/* Mega menu */}
            {megaOpen && (
              <div
                id="mega-menu"
                role="group"
                aria-label="Shop by category"
                className="absolute left-0 top-12 w-[720px] max-w-[calc(100vw-2rem)] glass-strong rounded-2xl p-5 shadow-2xl pop-in"
              >
                <div className="grid grid-cols-[1fr_200px] gap-5">
                <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-2 px-1">Categories</p>
                <div className="grid grid-cols-3 gap-1">
                  {realCats.map((c) => (
                    <Link
                      key={c.id}
                      href={`/products?category=${c.slug}`}
                      onClick={() => setMegaOpen(false)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-soft transition group/item"
                    >
                      <span className="w-9 h-9 rounded-lg bg-soft text-brand flex items-center justify-center group-hover/item:scale-110 transition-transform"><CategoryIcon slug={c.slug} size={16} /></span>
                      <span className="text-sm font-medium">{stripEmoji(c.name)}</span>
                    </Link>
                  ))}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mt-4 mb-2 px-1">Collections</p>
                <div className="grid grid-cols-5 gap-2">
                  {COLLECTIONS.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/products?tag=${c.slug}`}
                      onClick={() => setMegaOpen(false)}
                      className="rounded-xl px-2 py-2.5 text-center border border-line hover:border-brand/40 hover:text-brand text-[11px] font-bold transition inline-flex flex-col items-center gap-1"
                    >
                      <c.icon size={14} />
                      {c.label}
                    </Link>
                  ))}
                </div>
                </div>

                {/* Featured column — real catalogue rows, highest rated first */}
                <div className="border-l border-line pl-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-2">Featured</p>
                  <div className="space-y-2">
                    {featured.map((p) => (
                      <Link
                        key={p.id}
                        href={`/products/${p.slug}`}
                        onClick={() => setMegaOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-soft transition group/f"
                      >
                        <span className="w-12 h-12 rounded-lg overflow-hidden bg-soft shrink-0">
                          <SmartImage src={p.images?.[0]} alt="" tint={p.color} className="w-full h-full object-cover group-hover/f:scale-105 transition-transform" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs font-semibold line-clamp-2 leading-snug">{p.name}</span>
                          <span className="block text-xs font-bold text-brand mt-0.5">{formatPrice(p.price)}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/products?tag=deals"
                    onClick={() => setMegaOpen(false)}
                    className="mt-4 h-10 rounded-xl bg-gradient-to-r from-brand to-brand-2 text-white text-xs font-bold flex items-center justify-center gap-1.5 btn-shine"
                  >
                    <BadgePercent size={14} /> Today&apos;s deals
                  </Link>
                  <Link
                    href="/products"
                    onClick={() => setMegaOpen(false)}
                    className="mt-2 h-10 rounded-xl border border-line hover:border-brand/40 hover:text-brand text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    View all products <ArrowRight size={13} />
                  </Link>
                </div>
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <div ref={searchRef} className="flex-1 min-w-0 max-w-xl relative">
            <form onSubmit={submitSearch} className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={q}
                onChange={(e) => onQuery(e.target.value)}
                onFocus={() => {
                  setSearchFocus(true);
                  if (suggestions.length) setShowSuggest(true);
                }}
                onBlur={() => setSearchFocus(false)}
                placeholder="Search products, brands, categories…"
                className="w-full h-11 pl-10 pr-11 md:pr-20 rounded-2xl bg-soft border border-line focus:border-brand/50 focus:ring-4 focus:ring-brand/10 outline-none text-sm transition placeholder:text-muted/70"
                aria-label="Search"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                <button type="button" onClick={() => router.push("/search?image=1")} className="w-8 h-8 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 hidden md:flex items-center justify-center text-muted transition" aria-label="Image search" title="Visual search">
                  <ImageIcon size={16} />
                </button>
                <button type="button" onClick={startVoice} className={cn("w-8 h-8 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition", listening ? "text-brand animate-pulse" : "text-muted")} aria-label="Voice search" title="Voice search">
                  <Mic size={16} />
                </button>
              </div>
            </form>

            {/* Suggestions dropdown */}
            {showSuggest && suggestions.length > 0 && (
              <div className="absolute top-13 left-0 right-0 mt-1.5 glass-strong rounded-2xl shadow-2xl overflow-hidden pop-in z-50">
                <div className="p-2 max-h-[420px] overflow-y-auto">
                  <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <Sparkles size={12} className="text-brand" /> AI suggestions
                  </p>
                  {suggestions.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      onClick={() => setShowSuggest(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-soft transition"
                    >
                      <SmartImage src={p.image} alt={p.name} className="w-11 h-11 rounded-lg object-cover"  />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{p.name}</p>
                        <p className="text-xs text-muted flex items-center gap-1">{p.store} · <Star size={10} className="fill-current text-amber-500" /> {p.rating}</p>
                      </div>
                      <span className="text-sm font-bold text-brand shrink-0">{formatPrice(p.price)}</span>
                    </Link>
                  ))}
                  <button
                    onClick={() => submitSearch()}
                    className="w-full mt-1 p-2.5 rounded-xl text-sm font-semibold text-brand bg-brand/5 hover:bg-brand/10 transition"
                  >
                    See all results for “{q}” →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-0.5 md:gap-1 ml-auto shrink-0">
            <button onClick={toggle} className="w-10 h-10 rounded-xl hover:bg-soft flex items-center justify-center transition" aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <div className="relative hidden md:block">
              <button onClick={() => { setNotifOpen((v) => !v); setUserOpen(false); }} className="w-10 h-10 rounded-xl hover:bg-soft flex items-center justify-center transition relative" aria-label="Notifications">
                <Bell size={20} />
                {(meta?.notifications?.length ?? 0) > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand ping-slow" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 glass-strong rounded-2xl shadow-2xl pop-in z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-line flex items-center justify-between">
                    <p className="font-bold text-sm">Notifications</p>
                    <span className="text-[11px] font-semibold text-brand bg-brand/10 rounded-full px-2 py-0.5">{meta?.notifications?.length ?? 0} new</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {meta?.notifications.map((n) => (
                      <div key={n.id} className="flex gap-3 p-2.5 rounded-xl hover:bg-soft transition">
                        <span className="w-9 h-9 rounded-lg bg-soft flex items-center justify-center text-lg shrink-0">{n.icon}</span>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold leading-tight">{n.title}</p>
                          <p className="text-xs text-muted mt-0.5 leading-snug line-clamp-2">{n.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/wishlist" className="w-10 h-10 rounded-xl hover:bg-soft hidden md:flex items-center justify-center transition relative" aria-label="Wishlist">
              <Heart size={20} />
              {wishTotal > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-brand to-brand-2 text-white text-[10px] font-bold flex items-center justify-center pop-in">
                  {wishTotal}
                </span>
              )}
            </Link>

            <Link href="/cart" className="w-10 h-10 rounded-xl hover:bg-soft hidden md:flex items-center justify-center transition relative" aria-label="Cart">
              <ShoppingBag size={20} />
              {ready && cartTotal > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-brand to-brand-2 text-white text-[10px] font-bold flex items-center justify-center pop-in">
                  {cartTotal}
                </span>
              )}
            </Link>

            {/* User */}
            <div className="relative">
              <button onClick={() => { setUserOpen((v) => !v); setNotifOpen(false); }} className="w-10 h-10 rounded-xl hover:bg-soft flex items-center justify-center transition" aria-label="Account">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-brand to-brand-2 text-white flex items-center justify-center text-sm">
                  {meta?.user?.avatar ?? <User size={14} />}
                </span>
              </button>
              {userOpen && (
                <div className="absolute right-0 top-12 w-56 glass-strong rounded-2xl shadow-2xl pop-in z-50 p-2">
                  {meta?.user ? (
                    <>
                      <div className="px-3 py-2.5">
                        <p className="text-sm font-bold truncate">{meta.user.name}</p>
                        <p className="text-xs text-muted truncate">{meta.user.email}</p>
                      </div>
                      <div className="h-px bg-line my-1" />
                      <Link href="/account" onClick={() => setUserOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-soft transition">
                        <User size={16} /> My account
                      </Link>
                      {meta.user.role === "admin" && (
                        <Link href="/admin" onClick={() => setUserOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-soft transition">
                          <LayoutDashboard size={16} /> Admin dashboard
                        </Link>
                      )}
                      <button
                        onClick={async () => {
                          await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
                          setUserOpen(false);
                          router.refresh();
                          window.location.reload();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-500/10 transition"
                      >
                        <LogOut size={16} /> Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setUserOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand to-brand-2 text-center hover:opacity-95 transition">
                        Sign in
                      </Link>
                      <Link href="/signup" onClick={() => setUserOpen(false)} className="block px-3 py-2.5 mt-1 rounded-xl text-sm font-medium text-center hover:bg-soft transition">
                        Create account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden glass-strong border-t border-line max-h-[calc(100vh-120px)] overflow-y-auto pop-in">
          <div className="p-4 grid grid-cols-2 gap-2">
            {COLLECTIONS.map((c) => (
              <Link
                key={c.slug}
                href={`/products?tag=${c.slug}`}
                onClick={() => setMobileOpen(false)}
                className={cn("flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white bg-gradient-to-r", c.gradient)}
              >
                <c.icon size={12} /> {c.label}
              </Link>
            ))}
          </div>
          <div className="px-4 pb-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">Shop by category</p>
            <div className="grid grid-cols-2 gap-1.5">
              {realCats.map((c) => (
                <Link
                  key={c.id}
                  href={`/products?category=${c.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-soft/60 hover:bg-soft transition"
                >
                  <span className="w-7 h-7 rounded-lg bg-card text-brand flex items-center justify-center shrink-0"><CategoryIcon slug={c.slug} size={14} /></span>
                  <span className="text-[13px] font-medium leading-tight">{stripEmoji(c.name)}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}