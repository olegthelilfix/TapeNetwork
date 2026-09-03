export type ArticleSummary = {
    readonly slug: string;
    readonly category: string | null;
    readonly title: string;
    readonly dek: string | null;
    readonly author: string | null;
    readonly publishedAt: string | null;
    readonly readMinutes: number | null;
    readonly imageUrl: string | null;
};

export type Article = ArticleSummary & {
    readonly body: readonly string[];
};

export type ArticlePage = {
    readonly items: readonly ArticleSummary[];
    readonly page: number;
    readonly size: number;
    readonly total: number;
    readonly totalPages: number;
};

export const createArticleSummary = (
    input: ArticleSummary,
): ArticleSummary => {
    return input;
};

export const createArticle = (input: Article): Article => {
    return input;
};

export const createArticlePage = (input: ArticlePage): ArticlePage => {
    return input;
};
