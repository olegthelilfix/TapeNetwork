import "server-only";
import * as E from "fp-ts/Either";

import { showControllerController } from "@/api/paths/ShowControllerController";
import type { ShowDetail, ShowSummary } from "@/domain/show";
import { serverHttpClient } from "@/services/server/http";
import { mapShowDetailDto, mapShowSummaryDto } from "@/services/server/mappers";

import { type ControllerResult,mapGeneratedResult } from "../controller.utils";

const generatedController = showControllerController({
    httpClient: serverHttpClient,
});

export const getShows = (): ControllerResult<readonly ShowSummary[]> => {
    return mapGeneratedResult(
        generatedController.list_1(),
        (dtos) => E.traverseArray(mapShowSummaryDto)(dtos),
    );
};

export const getShowBySlug = (
    slug: string,
): ControllerResult<ShowDetail> => {
    return mapGeneratedResult(generatedController.bySlug(slug), mapShowDetailDto);
};
