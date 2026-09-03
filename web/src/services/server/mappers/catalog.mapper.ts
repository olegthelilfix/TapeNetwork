import "server-only";

import type { CategoryDetailDtoV1 } from "@/api/components/schemas/CategoryDetailDtoV1";
import type { CategorySummaryDtoV1 } from "@/api/components/schemas/CategorySummaryDtoV1";
import type { SubcategoryDetailDtoV1 } from "@/api/components/schemas/SubcategoryDetailDtoV1";
import type { SubcategorySummaryDtoV1 } from "@/api/components/schemas/SubcategorySummaryDtoV1";
import type { VideoDtoV1 } from "@/api/components/schemas/VideoDtoV1";
import {
    createCategoryDetail,
    createCategorySummary,
    createSubcategoryDetail,
    createSubcategorySummary,
    createVideo,
    type CategoryDetail,
    type CategorySummary,
    type SubcategoryDetail,
    type SubcategorySummary,
    type Video,
} from "@/domain/catalog";
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

export const mapVideoDto = (
    dto: VideoDtoV1,
): E.Either<DtoMappingError, Video> => {
    return pipe(
        E.Do,
        E.bind("slug", () =>
            requireString("Video", "slug", optionToNullable(dto.slug)),
        ),
        E.bind("title", () =>
            requireString("Video", "title", optionToNullable(dto.title)),
        ),
        E.map(({ slug, title }) =>
            createVideo({
                slug,
                title,
                description: optionToNullable(dto.description),
                publishedAt: optionToIsoString(dto.publishedAt),
                durationSeconds: optionToNullable(dto.durationSec),
                durationLabel: optionToNullable(dto.durationLabel),
                showName: optionToNullable(dto.showName),
                categoryName: optionToNullable(dto.categoryName),
                tags: optionToArray(dto.tags),
                imageUrl: optionToMediaUrl(dto.imageUrl),
            }),
        ),
    );
};

export const mapSubcategorySummaryDto = (
    dto: SubcategorySummaryDtoV1,
): E.Either<DtoMappingError, SubcategorySummary> => {
    return pipe(
        E.Do,
        E.bind("slug", () =>
            requireString("Subcategory", "slug", optionToNullable(dto.slug)),
        ),
        E.bind("name", () =>
            requireString("Subcategory", "name", optionToNullable(dto.name)),
        ),
        E.map(({ slug, name }) =>
            createSubcategorySummary({
                slug,
                name,
                blurb: optionToNullable(dto.blurb),
                imageUrl: optionToMediaUrl(dto.imageUrl),
                videoCount: optionToNumber(dto.videoCount),
            }),
        ),
    );
};

export const mapCategorySummaryDto = (
    dto: CategorySummaryDtoV1,
): E.Either<DtoMappingError, CategorySummary> => {
    return pipe(
        E.Do,
        E.bind("slug", () =>
            requireString("Category", "slug", optionToNullable(dto.slug)),
        ),
        E.bind("name", () =>
            requireString("Category", "name", optionToNullable(dto.name)),
        ),
        E.map(({ slug, name }) =>
            createCategorySummary({
                slug,
                name,
                blurb: optionToNullable(dto.blurb),
                imageUrl: optionToMediaUrl(dto.imageUrl),
                subcategoryCount: optionToNumber(dto.subcategoryCount),
                videoCount: optionToNumber(dto.videoCount),
                subcategoryNames: optionToArray(dto.subNames),
            }),
        ),
    );
};

export const mapCategoryDetailDto = (
    dto: CategoryDetailDtoV1,
): E.Either<DtoMappingError, CategoryDetail> => {
    return pipe(
        E.Do,
        E.bind("slug", () =>
            requireString("Category", "slug", optionToNullable(dto.slug)),
        ),
        E.bind("name", () =>
            requireString("Category", "name", optionToNullable(dto.name)),
        ),
        E.bind("subcategories", () =>
            mapReadonlyArray(
                optionToArray(dto.subcategories),
                mapSubcategorySummaryDto,
            ),
        ),
        E.map(({ slug, name, subcategories }) =>
            createCategoryDetail({
                slug,
                name,
                subcategories,
                blurb: optionToNullable(dto.blurb),
            }),
        ),
    );
};

export const mapSubcategoryDetailDto = (
    dto: SubcategoryDetailDtoV1,
): E.Either<DtoMappingError, SubcategoryDetail> => {
    return pipe(
        E.Do,
        E.bind("slug", () =>
            requireString("Subcategory", "slug", optionToNullable(dto.slug)),
        ),
        E.bind("name", () =>
            requireString("Subcategory", "name", optionToNullable(dto.name)),
        ),
        E.bind("categorySlug", () =>
            requireString(
                "Subcategory",
                "categorySlug",
                optionToNullable(dto.categorySlug),
            ),
        ),
        E.bind("categoryName", () =>
            requireString(
                "Subcategory",
                "categoryName",
                optionToNullable(dto.categoryName),
            ),
        ),
        E.bind("videos", () => mapReadonlyArray(optionToArray(dto.videos), mapVideoDto)),
        E.map(({ slug, name, categorySlug, categoryName, videos }) =>
            createSubcategoryDetail({
                slug,
                name,
                categorySlug,
                categoryName,
                videos,
                blurb: optionToNullable(dto.blurb),
            }),
        ),
    );
};
