import type { Metadata } from "next";
import { getShows } from "@/services/server/controllers";
import { resolveControllerResult } from "@/features/server/resolveControllerResult";
import type { AsyncServerComponent } from "@/features/server";
import { Card } from "@/ui/Card";
import { CardGrid } from "@/ui/Section";
import styles from "@/ui/ListLayout/ListLayout.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shows",
  description: "Every Tape Network show — markets, macro, options, technicals and long-form interviews.",
  alternates: { canonical: "/shows" },
};

const ShowsListFeature: AsyncServerComponent<Record<never, never>> = async () => {
  const shows = await resolveControllerResult(getShows());
  return (
    <>
      <header className={styles.intro}>
        <h1 className={styles.h1}>Shows</h1>
        <p className={styles.lede}>Live and on demand, every weekday. Free to watch.</p>
      </header>
      <CardGrid>
        {shows.map((s) => (
          <Card
            key={s.slug}
            href={`/shows/${s.slug}`}
            title={s.name}
            subtitle={s.scheduleSlot ?? s.tagline}
            imageUrl={s.imageUrl}
          />
        ))}
      </CardGrid>
    </>
  );
};

export default ShowsListFeature;
