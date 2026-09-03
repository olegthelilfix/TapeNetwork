import "server-only";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import type { Int } from "io-ts";

import { scheduleControllerController } from "@/api/paths/ScheduleControllerController";
import { searchControllerController } from "@/api/paths/SearchControllerController";
import { sitemapControllerController } from "@/api/paths/SitemapControllerController";
import { tickerControllerController } from "@/api/paths/TickerControllerController";
import { watchControllerController } from "@/api/paths/WatchControllerController";
import type { Player, SearchResult, SitemapEntry } from "@/domain/content";
import type { ScheduleItem } from "@/domain/schedule";
import type { Ticker } from "@/domain/ticker";
import { serverHttpClient } from "@/services/server/http";
import {
    mapPlayerDto,
    mapScheduleItemDto,
    mapSearchHitDto,
    mapSitemapEntryDto,
    mapTickerDto,
} from "@/services/server/mappers";

import type { ControllerError } from "../controller.errors";
import {
    type ControllerResult,
    mapGeneratedResult,
    toOptionalInteger,
} from "../controller.utils";

export type SearchInput = {
    readonly query: string;
    readonly type?: SearchResult["kind"];
    readonly limit?: number;
};

const scheduleGeneratedController = scheduleControllerController({
    httpClient: serverHttpClient,
});
const searchGeneratedController = searchControllerController({
    httpClient: serverHttpClient,
});
const sitemapGeneratedController = sitemapControllerController({
    httpClient: serverHttpClient,
});
const tickerGeneratedController = tickerControllerController({
    httpClient: serverHttpClient,
});
const watchGeneratedController = watchControllerController({
    httpClient: serverHttpClient,
});

export const getSchedule = (): ControllerResult<readonly ScheduleItem[]> => {
    return mapGeneratedResult(
        scheduleGeneratedController.list_14(),
        (dtos) => E.traverseArray(mapScheduleItemDto)(dtos),
    );
};

export const getTicker = (): ControllerResult<readonly Ticker[]> => {
    return mapGeneratedResult(
        tickerGeneratedController.list_12(),
        (dtos) => E.traverseArray(mapTickerDto)(dtos),
    );
};

export const getPlayerBySlug = (slug: string): ControllerResult<Player> => {
    return mapGeneratedResult(watchGeneratedController.watch(slug), mapPlayerDto);
};

const createSearchQuery = (
    input: SearchInput,
): E.Either<
    ControllerError,
    {
        readonly q: O.Option<string>;
        readonly type: O.Option<string>;
        readonly limit: O.Option<Int>;
    }
> => {
    return pipe(
        toOptionalInteger("limit", input.limit),
        E.map((limit) => ({
            q: O.some(input.query),
            type: O.fromNullable(input.type),
            limit,
        })),
    );
};

export const search = (input: SearchInput): ControllerResult<
    readonly SearchResult[]
> => {
    return pipe(
        createSearchQuery(input),
        TE.fromEither,
        TE.chain((query) =>
            mapGeneratedResult(
                searchGeneratedController.search({ query }),
                (dtos) => E.traverseArray(mapSearchHitDto)(dtos),
            ),
        ),
    );
};

export const getSitemapEntries = (): ControllerResult<
    readonly SitemapEntry[]
> => {
    return mapGeneratedResult(
        sitemapGeneratedController.entries(),
        (dtos) => E.traverseArray(mapSitemapEntryDto)(dtos),
    );
};
