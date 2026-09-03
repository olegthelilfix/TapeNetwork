import type { FC } from "react";

import type { SearchResult } from "@/domain/content";
import { Card } from "@/ui/Card";
import { CardGrid } from "@/ui/Section";

import listStyles from "@/ui/ListLayout/ListLayout.module.css";

export type SearchFeatureProps = {
  readonly query: string;
  readonly results: readonly SearchResult[];
};

export const SearchFeature: FC<SearchFeatureProps> = ({ query, results }) => {
  const q = query;

  return (
    <>
      <header className={listStyles.intro}>
        <h1 className={listStyles.h1}>Search</h1>
        <p className={listStyles.lede}>
          {q ? `${results.length} result${results.length === 1 ? "" : "s"} for “${q}”` : "Type a query in the bar above."}
        </p>
      </header>
      {q && results.length === 0 ? (
        <p style={{ color: "var(--text-muted)", padding: "24px 0" }}>Nothing matched. Try different terms.</p>
      ) : (
        <CardGrid>
          {results.map((r) => (
            <Card
              key={`${r.kind}-${r.slug}`}
              href={r.url}
              title={r.title}
              subtitle={r.subtitle}
              kicker={r.kind.toUpperCase()}
              imageUrl={r.imageUrl}
            />
          ))}
        </CardGrid>
      )}
    </>
  );
};
