import * as E from "fp-ts/Either";

import type { AsyncServerComponent } from "@/app/_types";
import { SearchFeature } from "@/features/search";
import { search } from "@/services/server/controllers";

export const dynamic = "force-dynamic";
export const metadata = { title: "Search", robots: { index: false } };

type SearchPageProps = {
    readonly searchParams: Promise<{ q?: string }>;
};

const SearchPage: AsyncServerComponent<SearchPageProps> = async ({ searchParams }) => {
    const { q: rawQuery } = await searchParams;
    const query = (rawQuery ?? "").trim();
    const response = query === "" ? null : await search({ query, limit: 12 })();
    const results = response !== null && E.isRight(response) ? response.right : [];

    return <SearchFeature query={query} results={results} />;
};

export default SearchPage;
