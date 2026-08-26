import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api/client";
import { mediaUrl } from "@/lib/format";
import styles from "./articles.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Articles",
  description: "Written analysis from the Tape Network desk — macro, options, technicals and earnings.",
  alternates: { canonical: "/articles" },
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = category ?? "";
  const [categories, page] = await Promise.all([
    api.categories(),
    api.articles({ category: active || undefined, size: 24 }),
  ]);

  return (
    <>
      <header className={styles.intro}>
        <div className={styles.kicker}>Articles</div>
        <h1 className={styles.h1}>The newsroom</h1>
        <p className={styles.lede}>
          Written analysis from the same desk that runs the shows — same categories, same
          disclosure, free to read.
        </p>
      </header>

      <div className={styles.chips}>
        <Link href="/articles" className={active === "" ? styles.chipOn : styles.chip}>
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/articles?category=${encodeURIComponent(c.slug)}`}
            className={active === c.slug ? styles.chipOn : styles.chip}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {page.items.length === 0 ? (
        <p className={styles.empty}>No articles in this category yet.</p>
      ) : (
        <div className={styles.grid}>
          {page.items.map((a) => {
            const img = mediaUrl(a.imageUrl);
            return (
              <Link key={a.slug} href={`/articles/${a.slug}`} className={styles.card}>
                <div className={styles.media}>
                  {img && <Image src={img} alt="" fill sizes="(max-width: 720px) 100vw, 360px" className={styles.img} />}
                </div>
                {a.category && <div className={styles.cat}>{a.category}</div>}
                <h2 className={styles.title}>{a.title}</h2>
                {a.dek && <p className={styles.dek}>{a.dek}</p>}
                <div className={styles.by}>
                  {[a.author, a.readMinutes ? `${a.readMinutes} MIN` : null].filter(Boolean).join(" · ")}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
