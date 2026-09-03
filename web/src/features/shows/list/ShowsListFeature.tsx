import type { Metadata } from "next";
import type { ShowSummary } from "@/domain/show";
import { Card } from "@/ui/Card";
import { CardGrid } from "@/ui/Section";
import type { FC } from "react";
import styles from "@/ui/ListLayout/ListLayout.module.css";

export type ShowsListFeatureProps = {
  readonly shows: readonly ShowSummary[];
};

export const ShowsListFeature: FC<ShowsListFeatureProps> = ({ shows }) => {
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
