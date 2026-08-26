import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api/client";
import type { ArticleDetail, ArticleSummary } from "@/lib/api/types";
import { mediaUrl, formatDate } from "@/lib/format";
import styles from "./article.module.css";

export const dynamic = "force-dynamic";

async function load(slug: string): Promise<ArticleDetail> {
  try {
    return await api.article(slug);
  } catch {
    notFound();
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const a = await api.article(slug);
    const img = mediaUrl(a.imageUrl);
    return {
      title: a.title,
      description: a.dek ?? undefined,
      alternates: { canonical: `/articles/${a.slug}` },
      openGraph: {
        title: a.title,
        description: a.dek ?? undefined,
        type: "article",
        images: img ? [img] : undefined,
      },
    };
  } catch {
    return { title: "Article not found" };
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await load(slug);
  let related: ArticleSummary[] = [];
  try {
    const page = await api.articles({ size: 6 });
    related = page.items.filter((x) => x.slug !== a.slug).slice(0, 3);
  } catch {
    /* related is optional */
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.title,
    description: a.dek ?? undefined,
    datePublished: a.publishedAt ?? undefined,
    author: a.author ? { "@type": "Person", name: a.author } : undefined,
    image: mediaUrl(a.imageUrl) ? [mediaUrl(a.imageUrl)] : undefined,
    articleSection: a.category ?? undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={styles.crumb}>
        <Link href="/articles">← All articles</Link>
      </div>

      <div className={styles.layout}>
        <article className={styles.main}>
          {a.category && <div className={styles.cat}>{a.category}</div>}
          <h1 className={styles.h1}>{a.title}</h1>
          {a.dek && <p className={styles.dek}>{a.dek}</p>}
          <div className={styles.byline}>
            {a.author && <span className={styles.author}>{a.author}</span>}
            {formatDate(a.publishedAt) && <span>{formatDate(a.publishedAt)}</span>}
            {a.readMinutes && <span>{a.readMinutes} MIN READ</span>}
          </div>
          <div className={styles.body}>
            {a.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>

        {related.length > 0 && (
          <aside className={styles.side}>
            <div className={styles.sideHead}>More from the desk</div>
            <ul className={styles.relList}>
              {related.map((r) => {
                const img = mediaUrl(r.imageUrl);
                return (
                  <li key={r.slug}>
                    <Link href={`/articles/${r.slug}`} className={styles.rel}>
                      <div className={styles.relMedia}>
                        {img && <Image src={img} alt="" fill sizes="300px" className={styles.relImg} />}
                      </div>
                      {r.category && <span className={styles.relCat}>{r.category}</span>}
                      <span className={styles.relTitle}>{r.title}</span>
                      {r.readMinutes && <span className={styles.relMeta}>{r.readMinutes} MIN</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>
        )}
      </div>
    </>
  );
}
