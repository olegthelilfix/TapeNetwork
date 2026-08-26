// Typed client for the public backend API (/api/v1).
import type {
  ArticleDetail,
  ArticleSummary,
  CategoryDetail,
  CategorySummary,
  Health,
  HomeResponse,
  Paged,
  ScheduleItem,
  ShowDetail,
  ShowSummary,
  SitemapEntry,
  SubcategoryDetail,
  TickerItem,
  VideoSummary,
  PlayerItem,
  SearchHit,
} from "./types";

const SERVER_BASE = process.env.API_BASE_URL ?? "http://localhost:8080";
const BROWSER_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

function baseUrl(): string {
  // Server (SSR) uses the container-to-container URL; browser uses the public one.
  return typeof window === "undefined" ? SERVER_BASE : BROWSER_BASE;
}

export async function apiGet<T>(path: string, revalidate = 60): Promise<T> {
  const res = await fetch(`${baseUrl()}/api/v1${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

function qs(params: Record<string, string | number | undefined>): string {
  const p = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return p.length ? `?${p.join("&")}` : "";
}

export const api = {
  health: () => apiGet<Health>("/health"),
  home: () => apiGet<HomeResponse>("/home", 30),

  shows: () => apiGet<ShowSummary[]>("/shows"),
  show: (slug: string) => apiGet<ShowDetail>(`/shows/${encodeURIComponent(slug)}`),

  categories: () => apiGet<CategorySummary[]>("/on-demand/categories"),
  category: (slug: string) => apiGet<CategoryDetail>(`/on-demand/categories/${encodeURIComponent(slug)}`),
  subcategory: (slug: string) => apiGet<SubcategoryDetail>(`/on-demand/subcategories/${encodeURIComponent(slug)}`),
  video: (slug: string) => apiGet<VideoSummary>(`/on-demand/videos/${encodeURIComponent(slug)}`),

  articles: (opts: { category?: string; page?: number; size?: number } = {}) =>
    apiGet<Paged<ArticleSummary>>(`/articles${qs(opts)}`),
  article: (slug: string) => apiGet<ArticleDetail>(`/articles/${encodeURIComponent(slug)}`),

  watch: (slug: string) => apiGet<PlayerItem>(`/watch/${encodeURIComponent(slug)}`, 30),

  schedule: () => apiGet<ScheduleItem[]>("/schedule"),
  ticker: () => apiGet<TickerItem[]>("/ticker"),
  search: (q: string, opts: { type?: string; limit?: number } = {}) =>
    apiGet<SearchHit[]>(`/search${qs({ q, type: opts.type, limit: opts.limit })}`, 0),
  sitemap: () => apiGet<SitemapEntry[]>("/sitemap-data", 3600),
};

export type * from "./types";
