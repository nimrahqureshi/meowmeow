import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { Clock, Calendar, ArrowLeft, User, PenLine } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import NewsletterForm from "@/components/NewsletterForm";
import { SITE_URL } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = (await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1))[0];
  if (!post) notFound();
  const path = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: path },
    openGraph: { title: post.title, description: post.excerpt, url: path, type: "article", images: post.cover ? [{ url: post.cover }] : undefined },
    twitter: { card: "summary_large_image", title: post.title, images: post.cover ? [post.cover] : undefined },
  };
}

/** Tiny markdown-ish renderer for our editorial content. */
function renderContent(content: string) {
  const blocks = content.split("\n\n");
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (trimmed.startsWith("## ")) return <h2 key={i} className="font-display font-bold text-xl md:text-2xl mt-8 mb-3">{trimmed.slice(3)}</h2>;
    if (trimmed.startsWith("# ")) return <h1 key={i} className="font-display font-bold text-2xl mt-8 mb-3">{trimmed.slice(2)}</h1>;
    const lines = trimmed.split("\n");
    if (lines.every((l) => l.startsWith("- ") || l.startsWith("* "))) {
      return (
        <ul key={i} className="mt-4 space-y-2">
          {lines.map((l, j) => (
            <li key={j} className="flex gap-2.5 text-muted text-[15px] leading-relaxed">
              <span className="text-brand mt-0.5">•</span> {l.replace(/^[-*]\s*/, "")}
            </li>
          ))}
        </ul>
      );
    }
    return <p key={i} className="mt-4 text-muted text-[15px] leading-relaxed">{trimmed}</p>;
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = (await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1))[0];
  if (!post) notFound();

  const related = await db.select().from(blogPosts).where(sql`${blogPosts.id} != ${post.id}`).orderBy(desc(blogPosts.publishedAt)).limit(3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Person", name: post.author },
    datePublished: post.publishedAt.toISOString(),
    image: post.cover,
    publisher: { "@type": "Organization", name: "MeowMeow", logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg` } },
  };

  return (
    <article className="max-w-3xl mx-auto px-4 lg:px-6 py-8">
      <JsonLd data={jsonLd} />
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-brand transition">
        <ArrowLeft size={16} /> All articles
      </Link>

      <div className="flex flex-wrap gap-2 mt-6">
        {post.tags.map((t) => (
          <span key={t} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand/10 text-brand">{t}</span>
        ))}
      </div>

      <h1 className="font-display text-3xl md:text-5xl font-extrabold leading-tight mt-4">{post.title}</h1>
      <p className="text-muted text-lg mt-4 leading-relaxed">{post.excerpt}</p>

      <div className="flex items-center gap-4 mt-6 pb-6 border-b border-line">
        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-2 text-white flex items-center justify-center text-sm font-bold">
          {post.author.split(" ").map((w) => w[0]).join("")}
        </span>
        <div>
          <p className="text-sm font-bold flex items-center gap-1.5"><User size={12} className="text-muted" /> {post.author}</p>
          <p className="text-xs text-muted flex items-center gap-3 mt-0.5">
            <span className="inline-flex items-center gap-1"><Calendar size={12} /> {post.publishedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            <span className="inline-flex items-center gap-1"><Clock size={12} /> {post.readTime} min read</span>
          </p>
        </div>
      </div>

      <div className="mt-2">{renderContent(post.content)}</div>

      {/* CTA */}
      <div className="relative mt-10 rounded-3xl overflow-hidden bg-gradient-to-br from-[#17130f] to-[#221c15] p-8 text-center">
        <div className="aurora-blob w-48 h-48 bg-brand/30 -top-10 -right-8" />
        <div className="relative">
          <span className="w-11 h-11 rounded-full bg-brand/10 text-brand flex items-center justify-center"><PenLine size={18} /></span>
          <h3 className="font-display font-bold text-xl text-white mt-2">Enjoyed this? There&apos;s more where that came from.</h3>
          <p className="text-white/60 text-sm mt-2">Join the digest — tested picks, price drops and zero spam.</p>
          <div className="max-w-sm mx-auto">
            <NewsletterForm tone="onDark" />
          </div>
        </div>
      </div>

      {/* Related */}
      <div className="mt-12">
        <h3 className="font-display font-bold text-xl mb-5">Keep reading</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {related.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="group glass rounded-2xl p-5 card-hover">
              <p className="text-[10px] font-bold text-brand uppercase tracking-wider">{p.tags[0]}</p>
              <h4 className="font-bold text-sm mt-1.5 leading-snug line-clamp-2 group-hover:text-brand transition">{p.title}</h4>
              <p className="text-[11px] text-muted mt-2">{p.readTime} min read</p>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
