import type { Metadata } from "next";
import type { SearchResult } from "@/domain/content";
import { search } from "@/services/server/controllers";
import type { AsyncServerComponent } from "@/features/server";
import { Card } from "@/ui/Card";
import { CardGrid } from "@/ui/Section";
import * as E from "fp-ts/Either";
import listStyles from "@/ui/ListLayout/ListLayout.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

type SearchFeatureProps = {
  readonly searchParams: Promise<{ q?: string }>;
};

const SearchFeature: AsyncServerComponent<SearchFeatureProps> = async ({
  searchParams,
}) => {
  const { q: rawQ } = await searchParams;
  const q = (rawQ ?? "").trim();
  let results: readonly SearchResult[] = [];
  if (q) {
    const result = await search({ query: q, limit: 12 })();
    if (E.isRight(result)) {
      results = result.right;
    }
  }

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

export default SearchFeature;
