import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";

import type { CategoryDetail } from "@/domain/catalog";

import grid from "./CategoryFeature.module.css";
import od from "@/features/catalog/list/CatalogFeature.module.css";

export type CategoryFeatureProps = {
  readonly category: CategoryDetail;
};

export const CategoryFeature: FC<CategoryFeatureProps> = ({ category }) => {
  const c = category;
  return (
    <>
      <header className={od.intro}>
        <div className={od.kicker}>On Demand</div>
        <h1 className={od.h1}>{c.name}</h1>
      </header>

      <div className={od.bar}>
        <span>
          <Link href="/on-demand">All categories</Link> / {c.name}
        </span>
        <span>{c.subcategories.length} subcategories</span>
      </div>
      {c.blurb && <p className={grid.blurb}>{c.blurb}</p>}

      <div className={grid.subs}>
        {c.subcategories.map((s) => {
          const img = s.imageUrl;
          return (
            <Link key={s.slug} href={`/on-demand/${c.slug}/${s.slug}`} className={grid.sub}>
              <div className={grid.subMedia}>
                {img && <Image src={img} alt="" fill sizes="(max-width: 720px) 100vw, 360px" className={grid.subImg} />}
                <span className={grid.subCount}>{s.videoCount} videos</span>
              </div>
              <div className={grid.subName}>{s.name}</div>
              {s.blurb && <div className={grid.subBlurb}>{s.blurb}</div>}
            </Link>
          );
        })}
      </div>
    </>
  );
};
