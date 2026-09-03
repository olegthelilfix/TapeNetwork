import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import type { Player } from "@/domain/content";
import { getPlayerBySlug } from "@/services/server/controllers";
import { resolveControllerResult } from "@/features/server/resolveControllerResult";
import type { AsyncServerComponent } from "@/features/server";
import { formatDate } from "@/utils/format";
import styles from "./PlayerFeature.module.css";

export const dynamic = "force-dynamic";

const load = (slug: string): Promise<Player> => {
  return resolveControllerResult(getPlayerBySlug(slug));
};

type PlayerFeatureProps = {
  readonly params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({
  params,
}: PlayerFeatureProps): Promise<Metadata> => {
  try {
    const { slug } = await params;
    const p = await resolveControllerResult(getPlayerBySlug(slug));
    const img = p.imageUrl;
    return {
      title: p.title,
      description: p.description ?? undefined,
      alternates: { canonical: `/watch/${p.slug}` },
      openGraph: { title: p.title, type: "video.other", images: img ? [img] : undefined },
    };
  } catch {
    return { title: "Not found" };
  }
};

const PlayerFeature: AsyncServerComponent<PlayerFeatureProps> = async ({
  params,
}) => {
  const { slug } = await params;
  const p = await load(slug);
  const img = p.imageUrl;
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
            {p.isLive && <span className={styles.live}>● LIVE</span>}
          </div>
          <span className={styles.stub}>Preview — streaming not enabled in v1</span>
          {/* Cosmetic control bar (playback is a stub in v1). */}
          <div className={styles.controls}>
            <span className={styles.ctrlIcon}>❚❚</span>
            <span className={styles.ctrlIcon}>↺</span>
            <span className={styles.ctrlIcon}>🔊</span>
            <span className={styles.progress}><span className={styles.progressFill} /></span>
            <span className={styles.ctrlTime}>{p.isLive ? "● LIVE · 02:14:38" : p.durationLabel}</span>
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
};

export default PlayerFeature;
