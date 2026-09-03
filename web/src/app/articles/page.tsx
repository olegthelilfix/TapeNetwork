import { notFound } from "next/navigation";
import type { AsyncServerComponent } from "@/app/_types";
import { ArticlesListFeature } from "@/features/articles/list";
import {
    getArticles,
    getCategories,
    resolveControllerResult,
} from "@/services/server/controllers";

export const dynamic = "force-dynamic";
export const metadata = {
    title: "Articles",
    description: "Written analysis from the Tape Network desk — macro, options, technicals and earnings.",
    alternates: { canonical: "/articles" },
};

type ArticlesPageProps = {
    readonly searchParams: Promise<{ category?: string }>;
};

const ArticlesPage: AsyncServerComponent<ArticlesPageProps> = async ({ searchParams }) => {
    const { category } = await searchParams;
    const activeCategory = category ?? "";
    const [categories, page] = await Promise.all([
        resolveControllerResult(getCategories(), { onNotFound: notFound }),
        resolveControllerResult(
            getArticles({ category: activeCategory || undefined, size: 24 }),
            { onNotFound: notFound },
        ),
    ]);

    return <ArticlesListFeature activeCategory={activeCategory} categories={categories} page={page} />;
};

export default ArticlesPage;
