import Link from "next/link";
import type { FC } from "react";

import type { Player } from "@/domain/content";

import { resolveStreamUrl } from "./streamUrl";
import { VideoPlayer } from "./VideoPlayer";

import { formatDate } from "@/utils/format";

import styles from "./PlayerFeature.module.css";

export type PlayerFeatureProps = {
  readonly player: Player;
};

export const PlayerFeature: FC<PlayerFeatureProps> = ({ player }) => {
  const p = player;
  const img = p.imageUrl;
  const streamUrl = resolveStreamUrl(p.videoUrl);
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
        <VideoPlayer src={streamUrl} poster={img} isLive={p.isLive} title={p.title} />

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
          {/*
            TODO(#54/#56): render host/guest links to /person/{slug} here.
            The player payload (PlayerDtoV1) does NOT carry people — only
            GET /api/v1/on-demand/videos/{slug} exposes `people[{slug,name,role}]`.
            Once the Player domain type gains `people`, map over them and render
            <Link href={`/person/${person.slug}`}>{person.name}</Link> (host/guest
            grouped). Do not invent the field before the backend/DTO provides it.
          */}
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
