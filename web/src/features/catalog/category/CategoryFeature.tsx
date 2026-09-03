import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import type { CategoryDetail } from "@/domain/catalog";
import { getCategoryBySlug } from "@/services/server/controllers";
import { resolveControllerResult } from "@/features/server/resolveControllerResult";
import type { AsyncServerComponent } from "@/features/server";
import od from "@/features/catalog/list/CatalogFeature.module.css";
import grid from "./CategoryFeature.module.css";

export const dynamic = "force-dynamic";

const load = (slug: string): Promise<CategoryDetail> => {
  return resolveControllerResult(getCategoryBySlug(slug));
};

type CategoryFeatureProps = {
  readonly params: Promise<{ category: string }>;
};

export const generateMetadata = async ({
  params,
}: CategoryFeatureProps): Promise<Metadata> => {
  try {
    const { category } = await params;
    const c = await resolveControllerResult(getCategoryBySlug(category));
    return {
      title: c.name,
      description: c.blurb ?? undefined,
      alternates: { canonical: `/on-demand/${c.slug}` },
    };
  } catch {
    return { title: "Category not found" };
  }
};

const CategoryFeature: AsyncServerComponent<CategoryFeatureProps> = async ({
  params,
}) => {
  const { category } = await params;
  const c = await load(category);
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

export default CategoryFeature;
