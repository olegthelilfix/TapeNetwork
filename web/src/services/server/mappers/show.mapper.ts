import "server-only";

import type { EpisodeDtoV1 } from "@/api/components/schemas/EpisodeDtoV1";
import type { HostDtoV1 } from "@/api/components/schemas/HostDtoV1";
import type { ShowDetailDtoV1 } from "@/api/components/schemas/ShowDetailDtoV1";
import type { ShowSummaryDtoV1 } from "@/api/components/schemas/ShowSummaryDtoV1";
import {
    type Episode,
    type Host,
    type ShowDetail,
    type ShowSummary,
} from "@/domain/show";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import {
    mapReadonlyArray,
    optionToArray,
    optionToBoolean,
    optionToIsoString,
    optionToMediaUrl,
    optionToNullable,
    optionToNumber,
    requireString,
    type DtoMappingError,
} from "./dto.mapper";

export const mapHostDto = (
    dto: HostDtoV1,
): E.Either<DtoMappingError, Host> => {
    return pipe(
        requireString("Host", "name", optionToNullable(dto.name)),
        E.map((name) =>
            ({
                name,
                initials: optionToNullable(dto.initials),
                role: optionToNullable(dto.role),
            }),
        ),
    );
};

export const mapEpisodeDto = (
    dto: EpisodeDtoV1,
): E.Either<DtoMappingError, Episode> => {
    return pipe(
        E.Do,
        E.bind("slug", () =>
            requireString("Episode", "slug", optionToNullable(dto.slug)),
        ),
        E.bind("title", () =>
            requireString("Episode", "title", optionToNullable(dto.title)),
        ),
        E.map(({ slug, title }) =>
            ({
                slug,
                title,
                episodeNumber: optionToNullable(dto.epNo),
                description: optionToNullable(dto.description),
                publishedAt: optionToIsoString(dto.publishedAt),
                durationSeconds: optionToNullable(dto.durationSec),
                durationLabel: optionToNullable(dto.durationLabel),
                viewsLabel: optionToNullable(dto.views),
                isLive: optionToBoolean(dto.live),
                tags: optionToArray(dto.tags),
                imageUrl: optionToMediaUrl(dto.imageUrl),
            }),
        ),
    );
};

export const mapShowSummaryDto = (
    dto: ShowSummaryDtoV1,
): E.Either<DtoMappingError, ShowSummary> => {
    return pipe(
        E.Do,
        E.bind("slug", () =>
            requireString("Show", "slug", optionToNullable(dto.slug)),
        ),
        E.bind("name", () =>
            requireString("Show", "name", optionToNullable(dto.name)),
        ),
        E.map(({ slug, name }) =>
            ({
                slug,
                name,
                tagline: optionToNullable(dto.tagline),
                blurb: optionToNullable(dto.blurb),
                scheduleSlot: optionToNullable(dto.scheduleSlot),
                imageUrl: optionToMediaUrl(dto.imageUrl),
            }),
        ),
    );
};

export const mapShowDetailDto = (
    dto: ShowDetailDtoV1,
): E.Either<DtoMappingError, ShowDetail> => {
    return pipe(
        E.Do,
        E.bind("summary", () => mapShowSummaryDto(dto)),
        E.bind("hosts", () => mapReadonlyArray(optionToArray(dto.hosts), mapHostDto)),
        E.bind("episodes", () =>
            mapReadonlyArray(optionToArray(dto.episodes), mapEpisodeDto),
        ),
        E.map(({ summary, hosts, episodes }) =>
            ({
                ...summary,
                hosts,
                episodes,
                description: optionToNullable(dto.description),
                episodeCount: optionToNumber(dto.episodesCount),
                hoursPerWeek: optionToNullable(dto.hoursPerWeek),
                monthlyViews: optionToNullable(dto.monthlyViews),
            }),
        ),
    );
};
