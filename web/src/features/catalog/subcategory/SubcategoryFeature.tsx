import Link from "next/link";
import type { FC } from "react";

import type { SubcategoryDetail } from "@/domain/catalog";
import { Card } from "@/ui/Card";
import { CardGrid } from "@/ui/Section";

import listStyles from "@/ui/ListLayout/ListLayout.module.css";

export type SubcategoryFeatureProps = {
  readonly subcategory: SubcategoryDetail;
};

export const SubcategoryFeature: FC<SubcategoryFeatureProps> = ({ subcategory }) => {
  const s = subcategory;
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
