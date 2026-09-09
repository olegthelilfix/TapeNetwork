import type { ArticleSummary } from "@/domain/article";

export type PersonVideoRole = "host" | "guest";

export type PersonVideo = {
    readonly slug: string;
    readonly title: string;
    readonly showName: string | null;
    readonly durationLabel: string | null;
    readonly imageUrl: string | null;
    readonly role: PersonVideoRole | null;
};

export type Person = {
    readonly slug: string;
    readonly name: string;
    readonly initials: string | null;
    readonly bio: string | null;
    readonly imageUrl: string | null;
    readonly videos: readonly PersonVideo[];
    readonly articles: readonly ArticleSummary[];
};
