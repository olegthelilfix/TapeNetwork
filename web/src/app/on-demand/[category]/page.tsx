import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api/client";
import type { CategoryDetail } from "@/lib/api/types";
import { mediaUrl } from "@/lib/format";
import od from "../ondemand.module.css";
import grid from "./category.module.css";

export const dynamic = "force-dynamic";

async function load(slug: string): Promise<CategoryDetail> {
  try {
    return await api.category(slug);
  } catch {
    notFound();
  }
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  try {
    const { category } = await params;
    const c = await api.category(category);
    return {
      title: c.name,
      description: c.blurb ?? undefined,
      alternates: { canonical: `/on-demand/${c.slug}` },
    };
  } catch {
    return { title: "Category not found" };
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
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
          const img = mediaUrl(s.imageUrl);
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
}
