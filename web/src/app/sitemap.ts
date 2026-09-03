import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/services/server/controllers";
import * as E from "fp-ts/Either";

export const dynamic = "force-dynamic";

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    const result = await getSitemapEntries()();
    if (E.isLeft(result)) {
      return [{ url: base }];
    }
    const entries = result.right;
    return entries.map((e) => ({
      url: base + e.location,
      lastModified: e.lastModified ?? undefined,
    }));
  } catch {
    return [{ url: base }];
  }
};

export default sitemap;
