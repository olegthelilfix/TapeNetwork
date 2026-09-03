import "server-only";

import { homeControllerController } from "@/api/paths/HomeControllerController";
import type { Home } from "@/domain/content";
import { serverHttpClient } from "@/services/server/http";
import { mapHomeDto } from "@/services/server/mappers";
import { mapGeneratedResult, type ControllerResult } from "../controller.utils";

const generatedController = homeControllerController({
    httpClient: serverHttpClient,
});

export const getHome = (): ControllerResult<Home> => {
    return mapGeneratedResult(generatedController.home(), mapHomeDto);
};
