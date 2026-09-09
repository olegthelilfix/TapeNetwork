export type Video = {
    readonly slug: string;
    readonly title: string;
    readonly description: string | null;
    readonly publishedAt: string | null;
    readonly durationSeconds: number | null;
    readonly durationLabel: string | null;
    readonly showName: string | null;
    readonly categoryName: string | null;
    readonly tags: readonly string[];
    readonly imageUrl: string | null;
};

export type SubcategorySummary = {
    readonly slug: string;
    readonly name: string;
    readonly blurb: string | null;
    readonly imageUrl: string | null;
    readonly videoCount: number;
};

export type CategorySummary = {
    readonly slug: string;
    readonly name: string;
    readonly blurb: string | null;
    readonly imageUrl: string | null;
    readonly subcategoryCount: number;
    readonly videoCount: number;
    readonly subcategoryNames: readonly string[];
};

export type CategoryDetail = {
    readonly slug: string;
    readonly name: string;
    readonly blurb: string | null;
    readonly subcategories: readonly SubcategorySummary[];
};

export type SubcategoryDetail = {
    readonly slug: string;
    readonly name: string;
    readonly blurb: string | null;
    readonly categorySlug: string;
    readonly categoryName: string;
    readonly videos: readonly Video[];
};
