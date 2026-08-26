import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api/client";
import { mediaUrl } from "@/lib/format";
import styles from "./ondemand.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "On Demand",
  description: "The full Tape Network catalog — macro, options, technicals, earnings and long-form, by category.",
  alternates: { canonical: "/on-demand" },
};

export default async function OnDemandPage() {
  const categories = await api.categories();
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
          const img = mediaUrl(c.imageUrl);
          return (
            <Link key={c.slug} href={`/on-demand/${c.slug}`} className={styles.catRow}>
              <div className={styles.catMedia}>
                {img && <Image src={img} alt="" fill sizes="240px" className={styles.catImg} />}
              </div>
              <div className={styles.catBody}>
                <h2 className={styles.catName}>{c.name}</h2>
                {c.blurb && <p className={styles.catBlurb}>{c.blurb}</p>}
                {c.subNames.length > 0 && (
                  <div className={styles.catSubs}>{c.subNames.join("  ·  ")}</div>
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
}
