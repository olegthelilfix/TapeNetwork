import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api/client";
import type { PlayerItem } from "@/lib/api/types";
import { mediaUrl, formatDate } from "@/lib/format";
import styles from "./watch.module.css";

export const dynamic = "force-dynamic";

async function load(slug: string): Promise<PlayerItem> {
  try {
    return await api.watch(slug);
  } catch {
    notFound();
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const p = await api.watch(slug);
    const img = mediaUrl(p.imageUrl);
    return {
      title: p.title,
      description: p.description ?? undefined,
      alternates: { canonical: `/watch/${p.slug}` },
      openGraph: { title: p.title, type: "video.other", images: img ? [img] : undefined },
    };
  } catch {
    return { title: "Not found" };
  }
}

export default async function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await load(slug);
  const img = mediaUrl(p.imageUrl);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: p.title,
    description: p.description ?? undefined,
    thumbnailUrl: img ? [img] : undefined,
    uploadDate: p.publishedAt ?? undefined,
  };

  return (
    <div className={styles.layout}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className={styles.main}>
        <div className={styles.player}>
          {img && <Image src={img} alt="" fill priority sizes="(max-width: 900px) 100vw, 800px" className={styles.playerImg} />}
          <div className={styles.shade} />
          <div className={styles.badges}>
            <span className={styles.featured}>FEATURED</span>
            {p.live && <span className={styles.live}>● LIVE</span>}
          </div>
          <span className={styles.stub}>Preview — streaming not enabled in v1</span>
          {/* Cosmetic control bar (playback is a stub in v1). */}
          <div className={styles.controls}>
            <span className={styles.ctrlIcon}>❚❚</span>
            <span className={styles.ctrlIcon}>↺</span>
            <span className={styles.ctrlIcon}>🔊</span>
            <span className={styles.progress}><span className={styles.progressFill} /></span>
            <span className={styles.ctrlTime}>{p.live ? "● LIVE · 02:14:38" : p.durationLabel}</span>
            <span className={styles.ctrlLabel}>1080p</span>
            <span className={styles.ctrlLabel}>CC</span>
            <span className={styles.ctrlIcon}>⛶</span>
          </div>
        </div>

        <div className={styles.meta}>
          {p.showName && (
            <div className={styles.show}>
              {p.showSlug ? <Link href={`/shows/${p.showSlug}`}>{p.showName}</Link> : p.showName}
            </div>
          )}
          <div className={styles.metaTop}>
            <h1 className={styles.h1}>{p.title}</h1>
            <div className={styles.metaActions}>
              <button className={styles.follow} type="button" disabled>+ Follow show</button>
              <button className={styles.share} type="button" disabled>Share</button>
            </div>
          </div>
          <div className={styles.sub}>
            {[p.durationLabel, formatDate(p.publishedAt)].filter(Boolean).join(" · ")}
          </div>
          {p.description && <p className={styles.desc}>{p.description}</p>}
          {p.tags.length > 0 && (
            <div className={styles.tags}>
              {p.tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
