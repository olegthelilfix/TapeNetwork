import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { describe, expect, it, vi } from "vitest";

import type { ArticleDtoV1 } from "@/api/components/schemas/ArticleDtoV1";
import type { HomeCardDtoV1 } from "@/api/components/schemas/HomeCardDtoV1";
import type { HomeResponseDtoV1 } from "@/api/components/schemas/HomeResponseDtoV1";
import type { TickerDtoV1 } from "@/api/components/schemas/TickerDtoV1";

import {
    mapArticleSummaryDto,
    mapHomeDto,
    mapTickerDto,
} from "./index";

vi.mock("server-only", () => {
    return {};
});

const articleDto: ArticleDtoV1 = {
    slug: O.some("market-open"),
    category: O.none,
    title: O.some("Markets open higher"),
    dek: O.none,
    author: O.some("Tape Desk"),
    body: O.none,
    readMinutes: O.none,
    imageUrl: O.none,
    publishedAt: O.some(new Date("2026-09-02T10:00:00.000Z")),
};

const tickerDto: TickerDtoV1 = {
    symbol: O.some("SPX"),
    price: O.some("5,100"),
    change: O.some("+0.4%"),
    direction: O.some("up"),
};

const homeCardDto: HomeCardDtoV1 = {
    refType: O.some("video"),
    slug: O.some("opening-bell"),
    title: O.some("Opening Bell"),
    subtitle: O.none,
    durationLabel: O.some("12 MIN"),
    imageUrl: O.none,
    live: O.some(false),
    views: O.none,
};

describe("generated DTO mappers", () => {
    it("maps generated options to nullable and serializable article fields", () => {
        const result = mapArticleSummaryDto(articleDto);

        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
            expect(result.right).toEqual({
                slug: "market-open",
                category: null,
                title: "Markets open higher",
                dek: null,
                author: "Tape Desk",
                publishedAt: "2026-09-02T10:00:00.000Z",
                readMinutes: null,
                imageUrl: null,
            });
        }
    });

    it("rejects an invalid ticker direction instead of leaking it into the domain", () => {
        const result = mapTickerDto({
            ...tickerDto,
            direction: O.some("sideways"),
        });

        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
            expect(result.left).toMatchObject({
                type: "invalid-api-response",
                entity: "Ticker",
                field: "direction",
            });
        }
    });

    it("maps the home aggregate without exposing generated DTOs", () => {
        const dto: HomeResponseDtoV1 = {
            liveNow: O.none,
            featured: O.some([homeCardDto]),
            mostWatched: O.none,
            upNext: O.none,
            ticker: O.some([tickerDto]),
            schedule: O.none,
            latestArticles: O.some([articleDto]),
        };

        const result = mapHomeDto(dto);

        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
            expect(result.right.liveNow).toBeNull();
            expect(result.right.featured[0]).toMatchObject({
                kind: "video",
                slug: "opening-bell",
            });
            expect(result.right.ticker[0]?.direction).toBe("up");
            expect(result.right.schedule).toEqual([]);
            expect(result.right.latestArticles[0]?.publishedAt).toBe(
                "2026-09-02T10:00:00.000Z",
            );
        }
    });
});
