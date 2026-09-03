import "server-only";

import type { ArticleDtoV1 } from "@/api/components/schemas/ArticleDtoV1";
import type { PagedResponseArticleDtoV1 } from "@/api/components/schemas/PagedResponseArticleDtoV1";
import {
    type Article,
    type ArticlePage,
    type ArticleSummary,
} from "@/domain/article";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import {
    mapReadonlyArray,
    optionToArray,
    optionToIsoString,
    optionToMediaUrl,
    optionToNullable,
    optionToNumber,
    requireString,
    type DtoMappingError,
} from "./dto.mapper";

export const mapArticleSummaryDto = (
    dto: ArticleDtoV1,
): E.Either<DtoMappingError, ArticleSummary> => {
    return pipe(
        E.Do,
        E.bind("slug", () =>
            requireString("Article", "slug", optionToNullable(dto.slug)),
        ),
        E.bind("title", () =>
            requireString("Article", "title", optionToNullable(dto.title)),
        ),
        E.map(({ slug, title }) =>
            ({
                slug,
                title,
                category: optionToNullable(dto.category),
                dek: optionToNullable(dto.dek),
                author: optionToNullable(dto.author),
                publishedAt: optionToIsoString(dto.publishedAt),
                readMinutes: optionToNullable(dto.readMinutes),
                imageUrl: optionToMediaUrl(dto.imageUrl),
            }),
        ),
    );
};

export const mapArticleDto = (
    dto: ArticleDtoV1,
): E.Either<DtoMappingError, Article> => {
    return pipe(
        mapArticleSummaryDto(dto),
        E.map((summary) =>
            ({
                ...summary,
                body: optionToArray(dto.body),
            }),
        ),
    );
};

export const mapArticlePageDto = (
    dto: PagedResponseArticleDtoV1,
): E.Either<DtoMappingError, ArticlePage> => {
    return pipe(
        mapReadonlyArray(optionToArray(dto.items), mapArticleSummaryDto),
        E.map((items) =>
            ({
                items,
                page: optionToNumber(dto.page),
                size: optionToNumber(dto.size),
                total: optionToNumber(dto.total),
                totalPages: optionToNumber(dto.totalPages),
            }),
        ),
    );
};
