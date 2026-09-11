import "server-only";

// Wire shape the News widget expects from GET {newsPath}: NewsData =
// { lastId, news: NewsArticle[] } (FullNewsData when withBody=true adds `body`).
// NewsArticle: id, sourceId, title, time (ISO string), source, feed, symbols?, tags?, body?.
export type NewsArticleDto = {
    readonly id: string;
    readonly sourceId: string;
    readonly title: string;
    readonly time: string;
    readonly source: string;
    readonly feed: string;
    readonly symbols?: readonly string[];
    readonly tags?: Record<string, string[]>;
    readonly body?: string;
};

export type NewsDataDto = {
    readonly lastId: string;
    readonly news: readonly NewsArticleDto[];
};

const HEADLINES: ReadonlyArray<{ title: string; source: string; body: string; symbols: string[] }> = [
    { title: "Chips lead a narrow tape as breadth thins into the Fed window", source: "Tape Wire", symbols: ["AAPL", "NVDA"], body: "Megacap semiconductors are again doing the heavy lifting for the index as participation narrows ahead of the policy decision." },
    { title: "Apple's services mix keeps pressure on the multiple", source: "MarketDesk", symbols: ["AAPL"], body: "Services revenue share continues to climb, supporting the valuation even as hardware growth cools." },
    { title: "Front-month volatility looks cheap relative to the last four prints", source: "Vol Report", symbols: ["AAPL"], body: "Options desks flag that implied vol is trading below realized into the event." },
    { title: "Treasury yields grind higher, pressuring long-duration equities", source: "Rates Daily", symbols: ["US10Y"], body: "The 10-year continues to climb irrespective of the buyback program's stated intent." },
    { title: "Buyback still matters more than the dividend, desk argues", source: "The Long Position", symbols: ["AAPL"], body: "Cash-return mechanics keep the float shrinking, a structural tailwind for EPS." },
    { title: "Supply-chain analyst sees a stronger replacement cycle", source: "Global News Desk", symbols: ["AAPL"], body: "Channel checks point to a firmer upgrade cycle than consensus models assume." },
];

export type NewsQuery = {
    readonly symbols?: readonly string[];
    readonly withBody?: boolean;
    readonly limit?: number;
};

export const buildNews = (query: NewsQuery = {}): NewsDataDto => {
    const wanted = query.symbols && query.symbols.length > 0 ? new Set(query.symbols) : null;
    const limit = query.limit ?? 100;
    const now = Date.now();

    const items = HEADLINES
        .filter((h) => (wanted ? h.symbols.some((s) => wanted.has(s)) : true))
        .slice(0, limit)
        .map((h, i): NewsArticleDto => ({
            id: `news-${i}`,
            sourceId: `src-${i}`,
            title: h.title,
            time: new Date(now - i * 3_600_000).toISOString(),
            source: h.source,
            feed: h.source,
            symbols: h.symbols,
            ...(query.withBody ? { body: h.body } : {}),
        }));

    return { lastId: `news-${items.length}`, news: items };
};
