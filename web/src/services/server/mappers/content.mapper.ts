import "server-only";

import type { HomeCardDtoV1 } from "@/api/components/schemas/HomeCardDtoV1";
import type { HomeResponseDtoV1 } from "@/api/components/schemas/HomeResponseDtoV1";
import type { PlayerDtoV1 } from "@/api/components/schemas/PlayerDtoV1";
import type { ScheduleItemDtoV1 } from "@/api/components/schemas/ScheduleItemDtoV1";
import type { SearchHit } from "@/api/components/schemas/SearchHit";
import type { SitemapEntry as SitemapEntryDto } from "@/api/components/schemas/SitemapEntry";
import type { TickerDtoV1 } from "@/api/components/schemas/TickerDtoV1";
import {
    type Home,
    type HomeCard,
    type Player,
    type SearchResult,
    type SitemapEntry,
} from "@/domain/content";
import type { ScheduleItem } from "@/domain/schedule";
import {
    type Ticker,
    type TickerDirection,
} from "@/domain/ticker";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { mapArticleSummaryDto } from "./article.mapper";
import {
    mapReadonlyArray,
    optionToArray,
    optionToBoolean,
    optionToIsoString,
    optionToMediaUrl,
    optionToNullable,
    requireOneOf,
    requireString,
    type DtoMappingError,
} from "./dto.mapper";

const tickerDirections: readonly TickerDirection[] = ["up", "down"];
const homeCardKinds: readonly HomeCard["kind"][] = ["episode", "video"];
const playerKinds: readonly Player["kind"][] = ["episode", "video"];
const searchResultKinds: readonly SearchResult["kind"][] = [
    "show",
    "episode",
    "video",
    "article",
];

export const mapScheduleItemDto = (
    dto: ScheduleItemDtoV1,
): E.Either<DtoMappingError, ScheduleItem> => {
    return pipe(
        requireString("Schedule item", "timeEt", optionToNullable(dto.timeEt)),
        E.map((timeEt) =>
            ({
                timeEt,
                showName: optionToNullable(dto.showName),
                showSlug: optionToNullable(dto.showSlug),
                hostsLabel: optionToNullable(dto.hostsLabel),
                isLive: optionToBoolean(dto.live),
            }),
        ),
    );
};

export const mapTickerDto = (
    dto: TickerDtoV1,
): E.Either<DtoMappingError, Ticker> => {
    return pipe(
        E.Do,
        E.bind("symbol", () =>
            requireString("Ticker", "symbol", optionToNullable(dto.symbol)),
        ),
        E.bind("price", () =>
            requireString("Ticker", "price", optionToNullable(dto.price)),
        ),
        E.bind("change", () =>
            requireString("Ticker", "change", optionToNullable(dto.change)),
        ),
        E.bind("direction", () =>
            requireOneOf(
                "Ticker",
                "direction",
                optionToNullable(dto.direction),
                tickerDirections,
            ),
        ),
        E.map(({ symbol, price, change, direction }) =>
            ({ symbol, price, change, direction }),
        ),
    );
};

export const mapHomeCardDto = (
    dto: HomeCardDtoV1,
): E.Either<DtoMappingError, HomeCard> => {
    return pipe(
        E.Do,
        E.bind("kind", () =>
            requireOneOf(
                "Home card",
                "refType",
                optionToNullable(dto.refType),
                homeCardKinds,
            ),
        ),
        E.bind("slug", () =>
            requireString("Home card", "slug", optionToNullable(dto.slug)),
        ),
        E.bind("title", () =>
            requireString("Home card", "title", optionToNullable(dto.title)),
        ),
        E.map(({ kind, slug, title }) =>
            ({
                kind,
                slug,
                title,
                subtitle: optionToNullable(dto.subtitle),
                durationLabel: optionToNullable(dto.durationLabel),
                imageUrl: optionToMediaUrl(dto.imageUrl),
                isLive: optionToBoolean(dto.live),
                viewsLabel: optionToNullable(dto.views),
            }),
        ),
    );
};

export const mapHomeDto = (
    dto: HomeResponseDtoV1,
): E.Either<DtoMappingError, Home> => {
    return pipe(
        E.Do,
        E.bind("liveNow", () => mapOptionalHomeCardDto(dto.liveNow)),
        E.bind("featured", () =>
            mapReadonlyArray(optionToArray(dto.featured), mapHomeCardDto),
        ),
        E.bind("mostWatched", () =>
            mapReadonlyArray(optionToArray(dto.mostWatched), mapHomeCardDto),
        ),
        E.bind("upNext", () =>
            mapReadonlyArray(optionToArray(dto.upNext), mapHomeCardDto),
        ),
        E.bind("ticker", () => mapReadonlyArray(optionToArray(dto.ticker), mapTickerDto)),
        E.bind("schedule", () =>
            mapReadonlyArray(optionToArray(dto.schedule), mapScheduleItemDto),
        ),
        E.bind("latestArticles", () =>
            mapReadonlyArray(optionToArray(dto.latestArticles), mapArticleSummaryDto),
        ),
        E.map(
            ({
                liveNow,
                featured,
                mostWatched,
                upNext,
                ticker,
                schedule,
                latestArticles,
            }) =>
                ({
                    liveNow,
                    featured,
                    mostWatched,
                    upNext,
                    ticker,
                    schedule,
                    latestArticles,
                }),
        ),
    );
};

export const mapPlayerDto = (
    dto: PlayerDtoV1,
): E.Either<DtoMappingError, Player> => {
    return pipe(
        E.Do,
        E.bind("kind", () =>
            requireOneOf(
                "Player",
                "kind",
                optionToNullable(dto.kind),
                playerKinds,
            ),
        ),
        E.bind("slug", () =>
            requireString("Player", "slug", optionToNullable(dto.slug)),
        ),
        E.bind("title", () =>
            requireString("Player", "title", optionToNullable(dto.title)),
        ),
        E.map(({ kind, slug, title }) =>
            ({
                kind,
                slug,
                title,
                description: optionToNullable(dto.description),
                showName: optionToNullable(dto.showName),
                showSlug: optionToNullable(dto.showSlug),
                durationLabel: optionToNullable(dto.durationLabel),
                imageUrl: optionToMediaUrl(dto.imageUrl),
                isLive: optionToBoolean(dto.live),
                tags: optionToArray(dto.tags),
                publishedAt: optionToIsoString(dto.publishedAt),
                videoUrl: optionToNullable(dto.videoUrl),
            }),
        ),
    );
};

export const mapSearchHitDto = (
    dto: SearchHit,
): E.Either<DtoMappingError, SearchResult> => {
    return pipe(
        E.Do,
        E.bind("kind", () =>
            requireOneOf(
                "Search result",
                "type",
                optionToNullable(dto.type),
                searchResultKinds,
            ),
        ),
        E.bind("slug", () =>
            requireString("Search result", "slug", optionToNullable(dto.slug)),
        ),
        E.bind("title", () =>
            requireString("Search result", "title", optionToNullable(dto.title)),
        ),
        E.bind("url", () =>
            requireString("Search result", "url", optionToNullable(dto.url)),
        ),
        E.map(({ kind, slug, title, url }) =>
            ({
                kind,
                slug,
                title,
                url,
                subtitle: optionToNullable(dto.subtitle),
                imageUrl: optionToMediaUrl(dto.imageUrl),
            }),
        ),
    );
};

const mapOptionalHomeCardDto = (
    dto: O.Option<HomeCardDtoV1>,
): E.Either<DtoMappingError, HomeCard | null> => {
    if (O.isNone(dto)) {
        return E.right(null);
    }

    return mapHomeCardDto(dto.value);
};

export const mapSitemapEntryDto = (
    dto: SitemapEntryDto,
): E.Either<DtoMappingError, SitemapEntry> => {
    return pipe(
        requireString("Sitemap entry", "loc", optionToNullable(dto.loc)),
        E.map((location) =>
            ({
                location,
                lastModified: optionToNullable(dto.lastmod),
            }),
        ),
    );
};
