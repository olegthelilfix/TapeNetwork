import type { EntityId } from "@/domain/shared";

export type Publication = {
    published: boolean;
};

export type OrderedContent = {
    sort: number;
};

export type Show = Publication & OrderedContent & {
    id: EntityId;
    name: string;
    slug: string;
    tagline: string | null;
    blurb: string | null;
    description: string | null;
    scheduleSlot: string | null;
    episodesCount: number | null;
    hoursPerWeek: string | null;
    monthlyViews: string | null;
    coverMediaId: EntityId | null;
};

export type Episode = Publication & {
    id: EntityId;
    showId: EntityId;
    title: string;
    slug: string;
    epNo: string | null;
    description: string | null;
    publishedAt: string | null;
    durationSec: number | null;
    views: string | null;
    videoUrl: string | null;
    thumbMediaId: EntityId | null;
    live: boolean;
    tags: string[];
};

export type Host = OrderedContent & {
    id: EntityId;
    showId: EntityId;
    name: string;
    initials: string | null;
    role: string | null;
};

export type Category = Publication & OrderedContent & {
    id: EntityId;
    name: string;
    slug: string;
    blurb: string | null;
    coverMediaId: EntityId | null;
};

export type Subcategory = OrderedContent & {
    id: EntityId;
    categoryId: EntityId;
    name: string;
    slug: string;
    blurb: string | null;
};

export type Video = Publication & {
    id: EntityId;
    subcategoryId: EntityId;
    showId: EntityId | null;
    title: string;
    slug: string;
    description: string | null;
    publishedAt: string | null;
    durationSec: number | null;
    views: string | null;
    videoUrl: string | null;
    thumbMediaId: EntityId | null;
    tags: string[];
};

export type Author = {
    id: EntityId;
    name: string;
    bio: string | null;
    avatarMediaId: EntityId | null;
};

export type Article = Publication & {
    id: EntityId;
    title: string;
    slug: string;
    categoryId: EntityId | null;
    authorId: EntityId | null;
    dek: string | null;
    body: string[];
    readMinutes: number | null;
    heroMediaId: EntityId | null;
    publishedAt: string | null;
    featured: boolean;
};

export type ScheduleEntry = OrderedContent & {
    id: EntityId;
    timeEt: string;
    showId: EntityId | null;
    hostsLabel: string | null;
    dayOfWeek: number | null;
    live: boolean;
};

export type TickerDirection = "up" | "down";

export type TickerItem = OrderedContent & {
    id: EntityId;
    symbol: string;
    price: string;
    change: string;
    direction: TickerDirection;
};

export type HomeBlockType = "featured" | "most_watched" | "up_next";
export type HomeBlockReferenceType = "episode" | "video" | "article";

export type HomeBlock = OrderedContent & {
    id: EntityId;
    type: HomeBlockType;
    refType: HomeBlockReferenceType | null;
    refId: EntityId | null;
    label: string | null;
};
