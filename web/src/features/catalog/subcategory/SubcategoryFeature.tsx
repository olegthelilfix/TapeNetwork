import type { Metadata } from "next";
import Link from "next/link";
import type { SubcategoryDetail } from "@/domain/catalog";
import { getSubcategoryBySlug } from "@/services/server/controllers";
import { resolveControllerResult } from "@/features/server/resolveControllerResult";
import type { AsyncServerComponent } from "@/features/server";
import { Card } from "@/ui/Card";
import { CardGrid } from "@/ui/Section";
import listStyles from "@/ui/ListLayout/ListLayout.module.css";

export const dynamic = "force-dynamic";

const load = (slug: string): Promise<SubcategoryDetail> => {
  return resolveControllerResult(getSubcategoryBySlug(slug));
};

type SubcategoryFeatureProps = {
  readonly params: Promise<{ category: string; subcategory: string }>;
};

export const generateMetadata = async ({
  params,
}: SubcategoryFeatureProps): Promise<Metadata> => {
  try {
    const { subcategory } = await params;
    const s = await resolveControllerResult(getSubcategoryBySlug(subcategory));
    return {
      title: `${s.name} · ${s.categoryName}`,
      description: s.blurb ?? undefined,
      alternates: { canonical: `/on-demand/${s.categorySlug}/${s.slug}` },
    };
  } catch {
    return { title: "Not found" };
  }
};

const SubcategoryFeature: AsyncServerComponent<SubcategoryFeatureProps> = async ({
  params,
}) => {
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
};

export default SubcategoryFeature;
