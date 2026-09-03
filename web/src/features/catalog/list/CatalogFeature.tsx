import Link from "next/link";
import Image from "next/image";
import type { CategorySummary } from "@/domain/catalog";
import type { FC } from "react";
import styles from "./CatalogFeature.module.css";

export type CatalogFeatureProps = {
  readonly categories: readonly CategorySummary[];
};

export const CatalogFeature: FC<CatalogFeatureProps> = ({ categories }) => {
  return (
    <>
      <header className={styles.intro}>
        <div className={styles.kicker}>On Demand</div>
        <h1 className={styles.h1}>Browse the archive</h1>
      </header>

      <div className={styles.bar}>
        <span>All categories</span>
        <span>{categories.length} categories</span>
      </div>

      <div className={styles.catList}>
        {categories.map((c) => {
          const img = c.imageUrl;
          return (
            <Link key={c.slug} href={`/on-demand/${c.slug}`} className={styles.catRow}>
              <div className={styles.catMedia}>
                {img && <Image src={img} alt="" fill sizes="240px" className={styles.catImg} />}
              </div>
              <div className={styles.catBody}>
                <h2 className={styles.catName}>{c.name}</h2>
                {c.blurb && <p className={styles.catBlurb}>{c.blurb}</p>}
                {c.subcategoryNames.length > 0 && (
                  <div className={styles.catSubs}>{c.subcategoryNames.join("  ·  ")}</div>
                )}
                <div className={styles.catCount}>
                  {c.subcategoryCount} subcategories · {c.videoCount} videos
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
};
