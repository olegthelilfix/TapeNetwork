import "server-only";

import { catalogControllerController } from "@/api/paths/CatalogControllerController";
import type {
    CategoryDetail,
    CategorySummary,
    SubcategoryDetail,
    Video,
} from "@/domain/catalog";
import { serverHttpClient } from "@/services/server/http";
import {
    mapCategoryDetailDto,
    mapCategorySummaryDto,
    mapSubcategoryDetailDto,
    mapVideoDto,
} from "@/services/server/mappers";
import * as E from "fp-ts/Either";
import { mapGeneratedResult, type ControllerResult } from "../controller.utils";

const generatedController = catalogControllerController({
    httpClient: serverHttpClient,
});

export const getCategories = (): ControllerResult<
    readonly CategorySummary[]
> => {
    return mapGeneratedResult(
        generatedController.categories(),
        (dtos) => E.traverseArray(mapCategorySummaryDto)(dtos),
    );
};

export const getCategoryBySlug = (
    slug: string,
): ControllerResult<CategoryDetail> => {
    return mapGeneratedResult(generatedController.category(slug), mapCategoryDetailDto);
};

export const getSubcategoryBySlug = (
    slug: string,
): ControllerResult<SubcategoryDetail> => {
    return mapGeneratedResult(
        generatedController.subcategory(slug),
        mapSubcategoryDetailDto,
    );
};

export const getVideoBySlug = (slug: string): ControllerResult<Video> => {
    return mapGeneratedResult(generatedController.video(slug), mapVideoDto);
};
