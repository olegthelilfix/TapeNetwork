import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api/client";
import type { SubcategoryDetail } from "@/lib/api/types";
import { Card } from "@/components/Card";
import { CardGrid } from "@/components/Section";
import listStyles from "../../../list.module.css";

export const dynamic = "force-dynamic";

async function load(slug: string): Promise<SubcategoryDetail> {
  try {
    return await api.subcategory(slug);
  } catch {
    notFound();
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subcategory: string }>;
}): Promise<Metadata> {
  try {
    const { subcategory } = await params;
    const s = await api.subcategory(subcategory);
    return {
      title: `${s.name} · ${s.categoryName}`,
      description: s.blurb ?? undefined,
      alternates: { canonical: `/on-demand/${s.categorySlug}/${s.slug}` },
    };
  } catch {
    return { title: "Not found" };
  }
}

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ category: string; subcategory: string }>;
}) {
  const { subcategory } = await params;
  const s = await load(subcategory);
  return (
    <>
      <div className={listStyles.breadcrumb}>
        <Link href="/on-demand">On Demand</Link> /{" "}
        <Link href={`/on-demand/${s.categorySlug}`}>{s.categoryName}</Link> / {s.name}
      </div>
      <header className={listStyles.intro}>
        <h1 className={listStyles.h1}>{s.name}</h1>
        {s.blurb && <p className={listStyles.lede}>{s.blurb}</p>}
      </header>
      <CardGrid>
        {s.videos.map((v) => (
          <Card
            key={v.slug}
            href={`/watch/${v.slug}`}
            title={v.title}
            subtitle={v.showName}
            duration={v.durationLabel}
            imageUrl={v.imageUrl}
          />
        ))}
      </CardGrid>
    </>
  );
}
