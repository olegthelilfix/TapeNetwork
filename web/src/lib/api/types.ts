// Interim hand-written types mirroring the backend DTOs (net.tape.*).
// Stage 3 tooling can regenerate authoritative types from OpenAPI into
// packages/api-types/generated — see web `npm run gen:api`. Until adopted,
// these are the source of truth for the web app.

export interface Health {
  service: string;
  status: string;
  time: string;
}

export interface Paged<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface HostDto {
  initials: string | null;
  name: string;
  role: string | null;
}

export interface EpisodeSummary {
  slug: string;
  epNo: string | null;
  title: string;
  description: string | null;
  publishedAt: string | null;
  durationSec: number | null;
  durationLabel: string | null;
  views: string | null;
  live: boolean;
  tags: string[];
  imageUrl: string | null;
}

export interface ShowSummary {
  slug: string;
  name: string;
  tagline: string | null;
  blurb: string | null;
  scheduleSlot: string | null;
  imageUrl: string | null;
}

export interface ShowDetail extends ShowSummary {
  description: string | null;
  episodesCount: number;
  hoursPerWeek: string | null;
  monthlyViews: string | null;
  hosts: HostDto[];
  episodes: EpisodeSummary[];
}

export interface CategorySummary {
  slug: string;
  name: string;
  blurb: string | null;
  imageUrl: string | null;
  subcategoryCount: number;
  videoCount: number;
  subNames: string[];
}

export interface SubcategorySummary {
  slug: string;
  name: string;
  blurb: string | null;
  imageUrl: string | null;
  videoCount: number;
}

export interface VideoSummary {
  slug: string;
  title: string;
  description: string | null;
  publishedAt: string | null;
  durationSec: number | null;
  durationLabel: string | null;
  showName: string | null;
  categoryName: string | null;
  tags: string[];
  imageUrl: string | null;
}

export interface CategoryDetail {
  slug: string;
  name: string;
  blurb: string | null;
  subcategories: SubcategorySummary[];
}

export interface SubcategoryDetail {
  slug: string;
  name: string;
  blurb: string | null;
  categorySlug: string;
  categoryName: string;
  videos: VideoSummary[];
}

export interface ArticleSummary {
  slug: string;
  category: string | null;
  title: string;
  dek: string | null;
  author: string | null;
  publishedAt: string | null;
  readMinutes: number | null;
  imageUrl: string | null;
}

export interface ArticleDetail extends ArticleSummary {
  authorBio: string | null;
  body: string[];
}

export interface ScheduleItem {
  timeEt: string;
  showName: string | null;
  showSlug: string | null;
  hostsLabel: string | null;
  live: boolean;
}

export interface TickerItem {
  symbol: string;
  price: string;
  change: string;
  direction: "up" | "down";
}

export interface HomeCard {
  refType: "episode" | "video";
  slug: string;
  title: string;
  subtitle: string | null;
  durationLabel: string | null;
  imageUrl: string | null;
  live: boolean;
  views: string | null;
}

export interface HomeResponse {
  liveNow: HomeCard | null;
  featured: HomeCard[];
  mostWatched: HomeCard[];
  upNext: HomeCard[];
  ticker: TickerItem[];
  schedule: ScheduleItem[];
  latestArticles: ArticleSummary[];
}

export interface SitemapEntry {
  loc: string;
  lastmod: string | null;
}

export interface SearchHit {
  type: "show" | "episode" | "video" | "article";
  slug: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  url: string;
}

export interface PlayerItem {
  kind: "video" | "episode";
  slug: string;
  title: string;
  description: string | null;
  showName: string | null;
  showSlug: string | null;
  durationLabel: string | null;
  imageUrl: string | null;
  live: boolean;
  tags: string[];
  publishedAt: string | null;
  videoUrl: string | null;
}
