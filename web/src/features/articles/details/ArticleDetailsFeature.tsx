import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";

import type { Article, ArticleSummary } from "@/domain/article";

import { ArticleSidebar } from "./ArticleSidebar";
import styles from "./ArticleDetailsFeature.module.css";

export type ArticleDetailsFeatureProps = {
  readonly article: Article;
  readonly relatedArticles: readonly ArticleSummary[];
};

// PUBLISHED <DD MON YYYY> in caps, matching the Schwab-style meta line.
const formatPublished = (iso: string | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();
  return `${day} ${month} ${d.getUTCFullYear()}`;
};

export const ArticleDetailsFeature: FC<ArticleDetailsFeatureProps> = ({
  article,
  relatedArticles,
}) => {
  const a = article;
  const related = relatedArticles;

  // The domain model has no explicit tag list; derive tags from the category so
  // the left rail matches the reference design on real data.
  const tags = a.category ? a.category.split(/[,/]/).map((t) => t.trim()).filter(Boolean) : [];
  const published = formatPublished(a.publishedAt);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.title,
    description: a.dek ?? undefined,
    datePublished: a.publishedAt ?? undefined,
    author: a.author ? { "@type": "Person", name: a.author } : undefined,
    image: a.imageUrl ? [a.imageUrl] : undefined,
    articleSection: a.category ?? undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* breadcrumb: Home › Articles › <title> */}
      <nav className={styles.crumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className={styles.crumbSep}>›</span>
        <Link href="/articles">Articles</Link>
        <span className={styles.crumbSep}>›</span>
        <span className={styles.crumbCurrent}>{a.title}</span>
      </nav>

      <div className={styles.layout}>
        {/* ---------- left rail: author · share · tags ---------- */}
        <aside className={styles.rail}>
          {a.author && (
            <div className={styles.authorCard}>
              <span className={styles.authorAvatar} aria-hidden>
                {a.author.slice(0, 1)}
              </span>
              <span className={styles.authorMeta}>
                <span className={styles.authorName}>{a.author}</span>
                <span className={styles.authorRole}>Markets Correspondent</span>
              </span>
            </div>
          )}

          <div className={styles.share}>
            <span className={styles.shareLabel}>Share</span>
            <span className={styles.shareBtns} aria-hidden>
              <span className={styles.shareBtn}>𝕏</span>
              <span className={styles.shareBtn}>f</span>
              <span className={styles.shareBtn}>in</span>
              <span className={styles.shareBtn}>↗</span>
            </span>
          </div>

          {tags.length > 0 && (
            <ul className={styles.tags}>
              {tags.map((t) => (
                <li key={t} className={styles.tag}>{t}</li>
              ))}
            </ul>
          )}
        </aside>

        {/* ---------- center: article ---------- */}
        <article className={styles.main}>
          <h1 className={styles.h1}>{a.title}</h1>
          <div className={styles.meta}>
            {published && (
              <span>
                <span className={styles.metaKey}>PUBLISHED</span> {published}
              </span>
            )}
            {a.readMinutes && (
              <>
                <span className={styles.metaDot}>|</span>
                <span>{a.readMinutes} MIN READ</span>
              </>
            )}
          </div>

          {a.imageUrl && (
            <div className={styles.hero}>
              <Image src={a.imageUrl} alt="" fill priority sizes="(max-width: 1100px) 100vw, 720px" className={styles.heroImg} />
            </div>
          )}

          {a.dek && <p className={styles.dek}>{a.dek}</p>}

          <div className={styles.body}>
            {a.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>

        {/* ---------- right: home widgets + related ---------- */}
        <aside className={styles.side}>
          <ArticleSidebar />
          {related.length > 0 && (
            <>
              <div className={styles.sideHead} style={{ marginTop: 28 }}>More from the desk</div>
              <ul className={styles.relList}>
                {related.map((r) => {
                  const img = r.imageUrl;
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
            </>
          )}
        </aside>
      </div>
    </>
  );
};
