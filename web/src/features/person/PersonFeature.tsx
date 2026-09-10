import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";

import type { Person, PersonVideoRole } from "@/domain/person";
import { Card } from "@/ui/Card/Card";
import { CardGrid, SectionHeader } from "@/ui/Section";

import { formatDate } from "@/utils/format";

import styles from "./PersonFeature.module.css";

export type PersonFeatureProps = {
  readonly person: Person;
};

const roleLabel = (role: PersonVideoRole | null): string | null => {
  switch (role) {
    case "host":
      return "HOST";
    case "guest":
      return "GUEST";
    default:
      return null;
  }
};

export const PersonFeature: FC<PersonFeatureProps> = ({ person }) => {
  const p = person;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.name,
    description: p.bio ?? undefined,
    image: p.imageUrl ? [p.imageUrl] : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className={styles.head}>
        <div className={styles.avatar}>
          {p.imageUrl ? (
            <Image src={p.imageUrl} alt="" fill sizes="120px" className={styles.avatarImg} />
          ) : (
            <span className={styles.avatarInitials}>{p.initials ?? p.name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div className={styles.headText}>
          <h1 className={styles.h1}>{p.name}</h1>
          {p.bio && <p className={styles.bio}>{p.bio}</p>}
        </div>
      </header>

      <section className={styles.section}>
        <SectionHeader title="Videos" />
        {p.videos.length > 0 ? (
          <CardGrid>
            {p.videos.map((v) => (
              <Card
                key={v.slug}
                href={`/watch/${v.slug}`}
                title={v.title}
                kicker={roleLabel(v.role)}
                subtitle={v.showName}
                duration={v.durationLabel}
                imageUrl={v.imageUrl}
              />
            ))}
          </CardGrid>
        ) : (
          <p className={styles.empty}>No videos yet.</p>
        )}
      </section>

      <section className={styles.section}>
        <SectionHeader title="Articles" />
        {p.articles.length > 0 ? (
          <ul className={styles.articleList}>
            {p.articles.map((r) => {
              const img = r.imageUrl;
              return (
                <li key={r.slug}>
                  {/* Article links use the article slug, which is always available. */}
                  <Link href={`/articles/${r.slug}`} className={styles.article}>
                    <div className={styles.articleMedia}>
                      {img && <Image src={img} alt="" fill sizes="300px" className={styles.articleImg} />}
                    </div>
                    {r.category && <span className={styles.articleCat}>{r.category}</span>}
                    <span className={styles.articleTitle}>{r.title}</span>
                    <span className={styles.articleMeta}>
                      {[formatDate(r.publishedAt), r.readMinutes ? `${r.readMinutes} MIN` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.empty}>No articles yet.</p>
        )}
      </section>
    </>
  );
};
