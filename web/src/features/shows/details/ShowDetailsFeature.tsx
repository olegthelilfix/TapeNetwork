import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import type { ShowDetail } from "@/domain/show";
import { getShowBySlug } from "@/services/server/controllers";
import { resolveControllerResult } from "@/features/server/resolveControllerResult";
import type { AsyncServerComponent } from "@/features/server";
import { formatDate } from "@/utils/format";
import styles from "./ShowDetailsFeature.module.css";

export const dynamic = "force-dynamic";

const load = (slug: string): Promise<ShowDetail> => {
  return resolveControllerResult(getShowBySlug(slug));
};

type ShowDetailsFeatureProps = {
  readonly params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({
  params,
}: ShowDetailsFeatureProps): Promise<Metadata> => {
  try {
    const { slug } = await params;
    const s = await resolveControllerResult(getShowBySlug(slug));
    const img = s.imageUrl;
    return {
      title: s.name,
      description: s.blurb ?? undefined,
      alternates: { canonical: `/shows/${s.slug}` },
      openGraph: { title: s.name, description: s.blurb ?? undefined, images: img ? [img] : undefined },
    };
  } catch {
    return { title: "Show not found" };
  }
};

const ShowDetailsFeature: AsyncServerComponent<ShowDetailsFeatureProps> = async ({
  params,
}) => {
  const { slug } = await params;
  const s = await load(slug);
  const stats = [
    { v: s.episodeCount ? s.episodeCount.toLocaleString("en-US") : "—", k: "Episodes" },
    { v: s.hoursPerWeek ?? "—", k: "Live per week" },
    { v: s.monthlyViews ?? "—", k: "Monthly views" },
    { v: "$0", k: "To watch" },
  ];
  const watchTarget = s.episodes[0]?.slug;

  return (
    <>
      <header className={styles.head}>
        <div className={styles.headMain}>
          {s.scheduleSlot && <div className={styles.slot}>{s.scheduleSlot}</div>}
          <h1 className={styles.h1}>{s.name}</h1>
          {s.description && <p className={styles.desc}>{s.description}</p>}
          <div className={styles.actions}>
            {watchTarget && (
              <Link href={`/watch/${watchTarget}`} className={styles.watch}>● Watch live now</Link>
            )}
            <button className={styles.follow} type="button" disabled>+ Follow</button>
          </div>
        </div>
        <div className={styles.statBox}>
          {stats.map((st) => (
            <div key={st.k} className={styles.stat}>
              <div className={styles.statV}>{st.v}</div>
              <div className={styles.statK}>{st.k}</div>
            </div>
          ))}
        </div>
      </header>

      <div className={styles.layout}>
        <section className={styles.episodes}>
          <div className={styles.tabs}>
            <span className={styles.tabOn}>Episodes</span>
            <span className={styles.count}>{s.episodeCount.toLocaleString("en-US")} episodes</span>
          </div>
          <ul className={styles.epList}>
            {s.episodes.map((e) => (
              <li key={e.slug}>
                <Link href={`/watch/${e.slug}`} className={styles.epRow}>
                  <div className={styles.epMedia}>
                    {e.imageUrl && (
                      <Image src={e.imageUrl} alt="" fill sizes="200px" className={styles.epImg} />
                    )}
                    {e.isLive && <span className={styles.epLive}>LIVE</span>}
                  </div>
                  <div className={styles.epBody}>
                    <div className={styles.epMeta}>
                      {[e.episodeNumber, formatDate(e.publishedAt), e.viewsLabel].filter(Boolean).join(" · ")}
                    </div>
                    <div className={styles.epTitle}>{e.title}</div>
                    {e.description && <div className={styles.epDesc}>{e.description}</div>}
                    {e.tags.length > 0 && (
                      <div className={styles.epTags}>
                        {e.tags.map((t) => <span key={t} className={styles.epTag}>{t}</span>)}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {s.hosts.length > 0 && (
          <aside className={styles.desk}>
            <div className={styles.deskHead}>The desk</div>
            <ul className={styles.hosts}>
              {s.hosts.map((h) => (
                <li key={h.name} className={styles.host}>
                  <div className={styles.ini}>{h.initials}</div>
                  <div>
                    <div className={styles.hostName}>{h.name}</div>
                    {h.role && <div className={styles.hostRole}>{h.role}</div>}
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </>
  );
};

export default ShowDetailsFeature;
