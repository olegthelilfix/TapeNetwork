import "server-only";

import { ResponseValidationError } from "@/api/client/client";
import { isHttpError } from "@/services/server/http";
import type { DtoMappingError } from "@/services/server/mappers";

export type ControllerError =
    | {
        readonly type: "not-found";
    }
    | {
        readonly type: "unauthorized";
    }
    | {
        readonly type: "forbidden";
    }
    | {
        readonly type: "backend-unavailable";
    }
    | {
        readonly type: "invalid-api-response";
        readonly entity: string;
        readonly field: string;
    }
    | {
        readonly type: "invalid-input";
        readonly field: string;
    }
    | {
        readonly type: "unexpected";
    };

export const normalizeControllerError = (
    error: unknown,
): ControllerError => {
    if (isHttpError(error)) {
        if (error.type === "network" || error.type === "response-parsing") {
            return { type: "backend-unavailable" };
        }

        switch (error.status) {
            case 401:
                return { type: "unauthorized" };
            case 403:
                return { type: "forbidden" };
            case 404:
                return { type: "not-found" };
            default:
                return { type: "backend-unavailable" };
        }
    }

    if (error instanceof ResponseValidationError) {
        return {
            type: "invalid-api-response",
            entity: "Generated API response",
            field: "response",
        };
    }

    return { type: "unexpected" };
};

export const mapDtoMappingError = (
    error: DtoMappingError,
): ControllerError => {
    return {
        type: "invalid-api-response",
        entity: error.entity,
        field: error.field,
    };
};

export const createInvalidInputError = (field: string): ControllerError => {
    return { type: "invalid-input", field };
};
