import Link from "next/link";
import Image from "next/image";
import type { HomeCardKind, Home } from "@/domain/content";
import type { ShowSummary } from "@/domain/show";
import { getHome, getShows } from "@/services/server/controllers";
import { resolveControllerResult } from "@/features/server/resolveControllerResult";
import type { AsyncServerComponent } from "@/features/server";
import { Card } from "@/ui/Card";
import styles from "./HomeFeature.module.css";

export const dynamic = "force-dynamic";

export const metadata = { alternates: { canonical: "/" } };

const kickerFor = (kind: HomeCardKind, isLive: boolean): string | undefined => {
  if (isLive) return undefined;
  return kind === "video" ? "CLIP" : "REPLAY";
};

const HomeFeature: AsyncServerComponent<Record<never, never>> = async () => {
  let data: Home | null = null;
  let shows: readonly ShowSummary[] = [];
  try {
    [data, shows] = await Promise.all([
      resolveControllerResult(getHome()),
      resolveControllerResult(getShows()),
    ]);
  } catch {
    return (
      <div className={styles.offline}>
        <h1>Backend unreachable</h1>
        <p>Start the API (<code>docker compose up</code>) and reload.</p>
      </div>
    );
  }

  const hero = data.liveNow ?? data.featured[0] ?? null;
  const heroSrc = hero?.imageUrl ?? null;
  const leadArticle = data.latestArticles[0] ?? null;
  const restArticles = data.latestArticles.slice(1, 4);

  return (
    <>
      <div className={styles.top}>
        {/* ---------- main column ---------- */}
        <div className={styles.main}>
          {hero && (
            <Link href={`/watch/${hero.slug}`} className={styles.hero}>
              <div className={styles.heroMedia}>
                {heroSrc && <Image src={heroSrc} alt="" fill priority sizes="(max-width: 900px) 100vw, 800px" className={styles.heroImg} />}
                <div className={styles.heroShade} />
                <div className={styles.heroBadges}>
                  {hero.isLive && <span className={styles.onAir}>● ON AIR</span>}
                  <span className={styles.featuredTag}>FEATURED</span>
                </div>
                {hero.isLive && hero.viewsLabel && <span className={styles.watching}>{hero.viewsLabel}</span>}
                <div className={styles.playBtn} aria-hidden>▶</div>
                <div className={styles.heroText}>
                  {hero.subtitle && <div className={styles.heroKicker}>{hero.subtitle}</div>}
                  <h1 className={styles.heroTitle}>{hero.title}</h1>
                  <div className={styles.heroByline}>
                    {hero.isLive ? "Live from the floor" : hero.durationLabel}
                  </div>
                </div>
              </div>
            </Link>
          )}

          <section className={styles.block}>
            <div className={styles.blockHead}>
              <h2 className={styles.blockTitle}>Today on Tape</h2>
              <Link href="/shows" className={styles.blockAction}>Full schedule →</Link>
            </div>
            <div className={styles.featuredGrid}>
              {data.featured.map((c) => (
                <Card
                  key={c.slug}
                  href={`/watch/${c.slug}`}
                  title={c.title}
                  subtitle={c.subtitle}
                  kicker={kickerFor(c.kind, c.isLive)}
                  duration={c.durationLabel}
                  imageUrl={c.imageUrl}
                  live={c.isLive}
                />
              ))}
            </div>
          </section>
        </div>

        {/* ---------- sidebar ---------- */}
        <aside className={styles.side}>
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <span>Programming</span>
              <span className={styles.panelHeadEt}>ET</span>
            </div>
            <ul className={styles.schedule}>
              {data.schedule.map((s, i) => (
                <li key={i} className={styles.slot}>
                  <span className={styles.slotTime}>{s.timeEt}</span>
                  <span className={styles.slotBody}>
                    <span className={styles.slotName}>
                      {s.showSlug ? <Link href={`/shows/${s.showSlug}`}>{s.showName}</Link> : s.showName}
                      {s.isLive && <span className={styles.slotLive}>LIVE</span>}
                    </span>
                    {s.hostsLabel && <span className={styles.slotHost}>{s.hostsLabel}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}><span>Most watched</span></div>
            <ol className={styles.ranked}>
              {data.mostWatched.map((c, i) => (
                <li key={c.slug}>
                  <Link href={`/watch/${c.slug}`} className={styles.rankRow}>
                    <span className={styles.rankNo}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={styles.rankBody}>
                      <span className={styles.rankTitle}>{c.title}</span>
                      <span className={styles.rankMeta}>
                        {[c.subtitle, c.durationLabel].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.newsletter}>
            <h3 className={styles.nlTitle}>Free, always. No account, no paywall.</h3>
            <p className={styles.nlSub}>
              Every hour of Tape Network — live and on demand — is open. Add the morning brief to your inbox.
            </p>
            <form className={styles.nlForm} aria-label="Newsletter signup (coming soon)">
              <input className={styles.nlInput} type="email" placeholder="you@desk.com" aria-label="Email address" disabled />
              <button className={styles.nlBtn} type="button" disabled>Subscribe</button>
            </form>
          </section>
        </aside>
      </div>

      {/* ---------- OUR SHOWS (full width) ---------- */}
      <section className={styles.block}>
        <div className={styles.blockHead}>
          <h2 className={styles.blockTitle}>Our shows</h2>
          <Link href="/shows" className={styles.blockAction}>All shows →</Link>
        </div>
        <div className={styles.showGrid}>
          {shows.map((s) => (
            <Link key={s.slug} href={`/shows/${s.slug}`} className={styles.showCard}>
              <span className={styles.showBar} aria-hidden />
              <span className={styles.showName}>{s.name}</span>
              {s.blurb && <span className={styles.showBlurb}>{s.blurb}</span>}
              {s.scheduleSlot && <span className={styles.showSlot}>{s.scheduleSlot}</span>}
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- FROM THE NEWSROOM (full width) ---------- */}
      <section className={styles.block}>
        <div className={styles.blockHead}>
          <h2 className={styles.blockTitle}>From the newsroom</h2>
          <Link href="/articles" className={styles.blockAction}>All articles →</Link>
        </div>
        <div className={styles.newsroom}>
          {leadArticle && (
            <Link href={`/articles/${leadArticle.slug}`} className={styles.lead}>
              <div className={styles.leadMedia}>
                {leadArticle.imageUrl && (
                  <Image src={leadArticle.imageUrl} alt="" fill sizes="(max-width: 900px) 100vw, 560px" className={styles.leadImg} />
                )}
                <span className={styles.leadTag}>FEATURED ANALYSIS</span>
              </div>
              {leadArticle.category && <div className={styles.leadCat}>{leadArticle.category}</div>}
              <h3 className={styles.leadTitle}>{leadArticle.title}</h3>
              {leadArticle.dek && <p className={styles.leadDek}>{leadArticle.dek}</p>}
              <div className={styles.leadBy}>
                {[leadArticle.author, leadArticle.readMinutes ? `${leadArticle.readMinutes} MIN` : null].filter(Boolean).join(" · ")}
              </div>
            </Link>
          )}
          <ul className={styles.artList}>
            {restArticles.map((a) => (
              <li key={a.slug}>
                <Link href={`/articles/${a.slug}`} className={styles.artRow}>
                  {a.category && <span className={styles.artCat}>{a.category}</span>}
                  <span className={styles.artTitle}>{a.title}</span>
                  <span className={styles.artBy}>
                    {[a.author, a.readMinutes ? `${a.readMinutes} MIN` : null].filter(Boolean).join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

export default HomeFeature;
