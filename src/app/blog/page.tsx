import Link from "next/link";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Clock, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import SmartImage from "@/components/SmartImage";

/** Journal index — new posts appear within the hour. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The Journal",
  description: "Buying guides, testing notes, and deep dives from the MeowMeow editors.",
  alternates: { canonical: "/blog" },
  openGraph: { title: "The Journal · MeowMeow", description: "Buying guides, testing notes, and deep dives from the MeowMeow editors.", url: "/blog" },
};

export default async function BlogPage() {
  const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt));
  const [feature, ...rest] = posts;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">The Journal</p>
      <h1 className="font-display text-3xl md:text-5xl font-extrabold mt-1">Testing notes & buying guides</h1>
      <p className="text-muted mt-3 max-w-xl">Buying guides, comparisons and research notes — published free.</p>

      {feature && (
        <Link href={`/blog/${feature.slug}`} className="group relative mt-10 block rounded-4xl overflow-hidden min-h-[380px] card-hover">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/40 via-brand-2/30 to-transparent" />
          <SmartImage src={feature.cover ?? "/images/hero.jpg"} alt={feature.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"  />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 p-8 md:p-10 max-w-2xl">
            <div className="flex gap-2">
              {feature.tags.map((t) => (
                <span key={t} className="text-[10px] font-bold text-white bg-white/20 backdrop-blur px-2.5 py-1 rounded-full">{t}</span>
              ))}
            </div>
            <h2 className="text-white font-display font-extrabold text-2xl md:text-4xl mt-4 leading-tight group-hover:underline decoration-brand decoration-2 underline-offset-4">{feature.title}</h2>
            <p className="text-white/70 mt-3 line-clamp-2">{feature.excerpt}</p>
            <p className="text-white/50 text-xs mt-4 flex items-center gap-2">
              {feature.author} · <Clock size={12} /> {feature.readTime} min read · {feature.publishedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </Link>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
        {rest.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="group glass rounded-3xl overflow-hidden card-hover flex flex-col">
            <div className="relative aspect-[16/10] overflow-hidden">
              <SmartImage src={p.cover ?? "/images/hero.jpg"} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"  />
              <div className="absolute top-3 left-3 flex gap-1.5">
                {p.tags.slice(0, 2).map((t) => (
                  <span key={t} className="text-[10px] font-bold bg-black/40 text-white backdrop-blur px-2.5 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-display font-bold text-lg leading-snug group-hover:text-brand transition-colors line-clamp-2">{p.title}</h3>
              <p className="text-sm text-muted mt-2 line-clamp-2 flex-1">{p.excerpt}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
                <p className="text-xs text-muted">{p.author} · {p.readTime} min</p>
                <span className="text-xs font-bold text-brand inline-flex items-center gap-1 group-hover:gap-2 transition-all">Read <ArrowRight size={12} /></span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}