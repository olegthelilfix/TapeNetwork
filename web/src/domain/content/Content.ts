import type { ArticleSummary } from "@/domain/article";
import type { ScheduleItem } from "@/domain/schedule";
import type { Ticker } from "@/domain/ticker";

export type HomeCardKind = "episode" | "video";

export type HomeCard = {
    readonly kind: HomeCardKind;
    readonly slug: string;
    readonly title: string;
    readonly subtitle: string | null;
    readonly durationLabel: string | null;
    readonly imageUrl: string | null;
    readonly isLive: boolean;
    readonly viewsLabel: string | null;
};

export type Home = {
    readonly liveNow: HomeCard | null;
    readonly featured: readonly HomeCard[];
    readonly mostWatched: readonly HomeCard[];
    readonly upNext: readonly HomeCard[];
    readonly ticker: readonly Ticker[];
    readonly schedule: readonly ScheduleItem[];
    readonly latestArticles: readonly ArticleSummary[];
};

export type PlayerKind = "episode" | "video";

export type Player = {
    readonly kind: PlayerKind;
    readonly slug: string;
    readonly title: string;
    readonly description: string | null;
    readonly showName: string | null;
    readonly showSlug: string | null;
    readonly durationLabel: string | null;
    readonly imageUrl: string | null;
    readonly isLive: boolean;
    readonly tags: readonly string[];
    readonly publishedAt: string | null;
    readonly videoUrl: string | null;
};

export type SearchResultKind = "show" | "episode" | "video" | "article";

export type SearchResult = {
    readonly kind: SearchResultKind;
    readonly slug: string;
    readonly title: string;
    readonly subtitle: string | null;
    readonly imageUrl: string | null;
    readonly url: string;
};

export type SitemapEntry = {
    readonly location: string;
    readonly lastModified: string | null;
};

export const createHomeCard = (input: HomeCard): HomeCard => {
    return input;
};

export const createHome = (input: Home): Home => {
    return input;
};

export const createPlayer = (input: Player): Player => {
    return input;
};

export const createSearchResult = (input: SearchResult): SearchResult => {
    return input;
};

export const createSitemapEntry = (input: SitemapEntry): SitemapEntry => {
    return input;
};
