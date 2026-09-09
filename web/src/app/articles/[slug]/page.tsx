import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { AsyncServerComponent } from "@/app/_types";
import type { ArticleSummary } from "@/domain/article";
import { ArticleDetailsFeature } from "@/features/articles/details";
import {
    getArticleBySlug,
    getArticles,
    resolveControllerResult,
} from "@/services/server/controllers";

export const dynamic = "force-dynamic";

type ArticleDetailsPageProps = {
    readonly params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({
    params,
}: ArticleDetailsPageProps): Promise<Metadata> => {
    try {
        const { slug } = await params;
        const article = await resolveControllerResult(getArticleBySlug(slug), { onNotFound: notFound });
        const imageUrl = article.imageUrl;

        return {
            title: article.title,
            description: article.dek ?? undefined,
            alternates: { canonical: `/articles/${article.slug}` },
            openGraph: {
                title: article.title,
                description: article.dek ?? undefined,
                type: "article",
                images: imageUrl ? [imageUrl] : undefined,
            },
        };
    } catch {
        return { title: "Article not found" };
    }
};

const ArticleDetailsPage: AsyncServerComponent<ArticleDetailsPageProps> = async ({
    params,
}) => {
    const { slug } = await params;
    const article = await resolveControllerResult(getArticleBySlug(slug), { onNotFound: notFound });
    let relatedArticles: readonly ArticleSummary[] = [];

    try {
        const articles = await resolveControllerResult(
            getArticles({ size: 6 }),
            { onNotFound: notFound },
        );
        relatedArticles = articles.items
            .filter((candidate) => candidate.slug !== article.slug)
            .slice(0, 3);
    } catch {
        // Related articles do not affect the primary article page.
    }

    return <ArticleDetailsFeature article={article} relatedArticles={relatedArticles} />;
};

export default ArticleDetailsPage;
