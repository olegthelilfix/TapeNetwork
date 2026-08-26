import type { Metadata } from "next";
import { api } from "@/lib/api/client";
import type { SearchHit } from "@/lib/api/types";
import { Card } from "@/components/Card";
import { CardGrid } from "@/components/Section";
import listStyles from "../list.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: rawQ } = await searchParams;
  const q = (rawQ ?? "").trim();
  let results: SearchHit[] = [];
  if (q) {
    try {
      results = await api.search(q, { limit: 12 });
    } catch {
      results = [];
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
              key={`${r.type}-${r.slug}`}
              href={r.url}
              title={r.title}
              subtitle={r.subtitle}
              kicker={r.type.toUpperCase()}
              imageUrl={r.imageUrl}
            />
          ))}
        </CardGrid>
      )}
    </>
  );
}
