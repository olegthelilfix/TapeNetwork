export type Host = {
    readonly initials: string | null;
    readonly name: string;
    readonly role: string | null;
};

export type Episode = {
    readonly slug: string;
    readonly episodeNumber: string | null;
    readonly title: string;
    readonly description: string | null;
    readonly publishedAt: string | null;
    readonly durationSeconds: number | null;
    readonly durationLabel: string | null;
    readonly viewsLabel: string | null;
    readonly isLive: boolean;
    readonly tags: readonly string[];
    readonly imageUrl: string | null;
};

export type ShowSummary = {
    readonly slug: string;
    readonly name: string;
    readonly tagline: string | null;
    readonly blurb: string | null;
    readonly scheduleSlot: string | null;
    readonly imageUrl: string | null;
};

export type ShowDetail = ShowSummary & {
    readonly description: string | null;
    readonly episodeCount: number;
    readonly hoursPerWeek: string | null;
    readonly monthlyViews: string | null;
    readonly hosts: readonly Host[];
    readonly episodes: readonly Episode[];
};
