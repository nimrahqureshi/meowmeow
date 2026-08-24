"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Mic, ImagePlus, Sparkles, Loader2, Camera, UploadCloud, PawPrint } from "lucide-react";
import ProductCard, { type CardProduct } from "@/components/ProductCard";
import { SkeletonCard } from "@/components/ui";
import { cn } from "@/lib/utils";

const TRENDING = ["wireless headphones", "smartwatch", "silk dress", "espresso machine", "gift under $100", "mechanical keyboard", "sneakers", "diamond bracelet"];

function SearchClient() {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const imageMode = params.get("image") === "1";

  const [query, setQuery] = useState(q);
  const [results, setResults] = useState<{ products: CardProduct[]; categories: { slug: string; name: string; emoji: string }[]; brands: { slug: string; name: string }[] }>({ products: [], categories: [], brands: [] });
  const [fetchedFor, setFetchedFor] = useState("");
  const [listening, setListening] = useState(false);
  const [visual, setVisual] = useState<null | { color: string; products: CardProduct[] }>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);


  // Sync state with the URL param (adjust-state-during-render), then let the
  // effect below own the actual data fetching.
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setQuery(q);
  }

  useEffect(() => {
    if (!q) return;
    let cancelled = false;
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setResults(data);
        setFetchedFor(q);
      })
      .catch(() => {
        if (!cancelled) setFetchedFor(q);
      });
    return () => {
      cancelled = true;
    };
  }, [q]);

  const loading = q !== "" && fetchedFor !== q;
  const runSearch = (term: string) => {
    const t = term.trim();
    router.push(t ? `/search?q=${encodeURIComponent(t)}` : "/search");
  };

  const startVoice = () => {
    const w = window as unknown as { webkitSpeechRecognition?: any; SpeechRecognition?: any };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice search works best in Chrome, Edge or Safari. 🎤");
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    setListening(true);
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript as string;
      setQuery(text);
      runSearch(text);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const img = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      const size = 64;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
      }
      const hex = `#${[r, g, b].map((v) => Math.round(v / n).toString(16).padStart(2, "0")).join("")}`;
      const res = await fetch("/api/search/color", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ color: hex }) });
      const data2 = await res.json();
      setVisual({ color: hex, products: data2.products });
    } catch {
      alert("Couldn't read that image. Try a clear photo of the product. 📸");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand flex items-center gap-1.5"><Sparkles size={12} /> Search</p>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-1">Find your next <span className="text-gradient">favorite thing</span></h1>
      </div>

      {/* Search box */}
      <div className="glass-strong rounded-3xl p-3 flex items-center gap-2 max-w-3xl shadow-xl shadow-brand/5">
        <Search size={18} className="ml-3 text-muted shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch(query)}
          placeholder="Try “best wireless headphones under $200”…"
          className="flex-1 h-12 bg-transparent outline-none text-sm md:text-base min-w-0 focus-visible:ring-0"
          aria-label="Search query"
        />
        {listening && <span className="text-brand text-xs font-bold animate-pulse shrink-0">Listening…</span>}
        <button onClick={startVoice} className={cn("w-11 h-11 rounded-2xl flex items-center justify-center transition shrink-0", listening ? "bg-brand/15 text-brand" : "hover:bg-soft text-muted")} aria-label="Voice search">
          <Mic size={18} />
        </button>
        <label className={cn("w-11 h-11 rounded-2xl flex items-center justify-center transition cursor-pointer shrink-0", visual ? "bg-brand/15 text-brand" : "hover:bg-soft text-muted")} aria-label="Upload image to search">
          <ImagePlus size={18} />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </label>
        <button onClick={() => runSearch(query)} className="h-11 px-5 rounded-2xl bg-gradient-to-r from-brand to-brand-2 text-white text-sm font-bold btn-shine shrink-0 hover:opacity-95 transition">
          Search
        </button>
      </div>

      {/* Trending chips */}
      <div className="flex flex-wrap gap-2 mt-4">
        <span className="text-xs font-bold text-muted py-1.5">Trending:</span>
        {TRENDING.map((t) => (
          <button key={t} onClick={() => { setQuery(t); runSearch(t); }} className="text-xs font-semibold px-3 py-1.5 rounded-full glass hover:border-brand/40 hover:text-brand transition">
            {t}
          </button>
        ))}
      </div>

      {/* Visual search panel */}
      {imageMode && !visual && (
        <div
          className={cn("mt-8 rounded-3xl border-2 border-dashed p-12 text-center transition", dragOver ? "border-brand bg-brand/5" : "border-line")}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
        >
          <Camera size={40} className="mx-auto text-muted/50" />
          <h2 className="font-display font-bold text-xl mt-4">Visual search</h2>
          <p className="text-sm text-muted mt-2 max-w-md mx-auto">Upload or drag in a photo of something you like — MeowMeow analyzes its palette and finds matching products.</p>
          <button onClick={() => fileRef.current?.click()} className="mt-5 inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-gradient-to-r from-brand to-brand-2 text-white text-sm font-bold btn-shine">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />} {uploading ? "Analyzing…" : "Choose an image"}
          </button>
        </div>
      )}

      {visual && (
        <div className="mt-8">
          <div className="flex items-center gap-4 mb-5">
            <span className="w-12 h-12 rounded-2xl border border-line shadow-inner" style={{ background: visual.color }} />
            <div>
              <h2 className="font-display font-bold text-xl">Matches for your image palette</h2>
              <p className="text-sm text-muted">Dominant color <b>{visual.color}</b> — {visual.products.length} closest products</p>
            </div>
            <button onClick={() => setVisual(null)} className="ml-auto text-xs font-bold text-brand hover:underline">New search</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visual.products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {!imageMode && (
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : query ? (
            <>
              {results.categories.length > 0 && (
                <div className="mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {results.categories.map((c) => (
                      <Link key={c.slug} href={`/products?category=${c.slug}`} className="glass rounded-full px-4 py-2 text-sm font-bold hover:border-brand/40 hover:text-brand transition">
                        {c.emoji} {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {results.brands.length > 0 && (
                <div className="mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">Brands</p>
                  <div className="flex flex-wrap gap-2">
                    {results.brands.map((b) => (
                      <Link key={b.slug} href={`/products?brand=${b.slug}`} className="glass rounded-full px-4 py-2 text-sm font-bold hover:border-brand/40 hover:text-brand transition">
                        {b.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {results.products.length > 0 ? (
                <>
                  <p className="text-sm text-muted mb-4">{results.products.length} best matches for “{query}”</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {results.products.map((p, i) => (
                      <ProductCard key={p.id} product={p} index={i} />
                    ))}
                  </div>
                  <div className="text-center mt-8">
                    <Link href={`/products?q=${encodeURIComponent(query)}`} className="inline-flex px-6 h-11 items-center rounded-2xl glass font-bold text-sm hover:border-brand/40 hover:text-brand transition">
                      Browse full catalog for “{query}” →
                    </Link>
                  </div>
                </>
              ) : (
                <div className="glass rounded-3xl p-14 text-center">
                  <span className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
                    <PawPrint size={32} />
                  </span>
                  <h3 className="font-display font-bold text-xl mt-3">Nothing found for “{query}”</h3>
                  <p className="text-sm text-muted mt-2">Try different words, or ask the AI assistant — it knows the catalog inside out.</p>
                </div>
              )}
            </>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="glass rounded-3xl p-6">
                <h3 className="font-bold flex items-center gap-2"><Sparkles size={16} className="text-brand" /> AI search tips</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  <li>• “best wireless headphones under $200”</li>
                  <li>• “gift for my mom under $100”</li>
                  <li>• “compare smartwatches”</li>
                </ul>
              </div>
              <div className="glass rounded-3xl p-6">
                <h3 className="font-bold flex items-center gap-2"><Mic size={16} className="text-brand" /> Voice & visual</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  <li>• Tap 🎤 and say what you want.</li>
                  <li>• Tap 🖼️ and upload a photo to find matching products.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><div className="skeleton h-40 rounded-3xl" /></div>}>
      <SearchClient />
    </Suspense>
  );
}
