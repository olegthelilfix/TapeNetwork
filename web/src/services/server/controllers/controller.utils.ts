import "server-only";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { Int } from "io-ts";

import type { DtoMappingError } from "@/services/server/mappers";

import {
    type ControllerError,
    createInvalidInputError,
    mapDtoMappingError,
    normalizeControllerError,
} from "./controller.errors";

export type ControllerResult<Value> = TE.TaskEither<ControllerError, Value>;

export const mapGeneratedResult = <Dto, Domain>(
    operation: TE.TaskEither<Error, Dto>,
    mapper: (dto: Dto) => E.Either<DtoMappingError, Domain>,
): ControllerResult<Domain> => {
    return pipe(
        operation,
        TE.mapLeft(normalizeControllerError),
        TE.chainEitherKW((dto) => pipe(mapper(dto), E.mapLeft(mapDtoMappingError))),
    );
};

export const toOptionalInteger = (
    field: string,
    value: number | undefined,
): E.Either<ControllerError, O.Option<Int>> => {
    if (value === undefined) {
        return E.right(O.none);
    }

    if (Int.is(value)) {
        return E.right(O.some(value));
    }

    return E.left(createInvalidInputError(field));
};
