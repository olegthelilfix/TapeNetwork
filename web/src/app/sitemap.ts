import type { MetadataRoute } from "next";
import { api } from "@/lib/api/client";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    const entries = await api.sitemap();
    return entries.map((e) => ({
      url: base + e.loc,
      lastModified: e.lastmod ?? undefined,
    }));
  } catch {
    return [{ url: base }];
  }
}
