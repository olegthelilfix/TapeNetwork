import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import type { Article, ArticleSummary } from "@/domain/article";
import { getArticleBySlug, getArticles } from "@/services/server/controllers";
import { resolveControllerResult } from "@/features/server/resolveControllerResult";
import type { AsyncServerComponent } from "@/features/server";
import { formatDate } from "@/utils/format";
import styles from "./ArticleDetailsFeature.module.css";

export const dynamic = "force-dynamic";

const load = (slug: string): Promise<Article> => {
  return resolveControllerResult(getArticleBySlug(slug));
};

type ArticleDetailsFeatureProps = {
  readonly params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({
  params,
}: ArticleDetailsFeatureProps): Promise<Metadata> => {
  try {
    const { slug } = await params;
    const a = await resolveControllerResult(getArticleBySlug(slug));
    const img = a.imageUrl;
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
};

const ArticleDetailsFeature: AsyncServerComponent<ArticleDetailsFeatureProps> = async ({
  params,
}) => {
  const { slug } = await params;
  const a = await load(slug);
  let related: ArticleSummary[] = [];
  try {
    const page = await resolveControllerResult(getArticles({ size: 6 }));
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
    image: a.imageUrl ? [a.imageUrl] : undefined,
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
          </aside>
        )}
      </div>
    </>
  );
};

export default ArticleDetailsFeature;
