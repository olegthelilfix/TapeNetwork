import "server-only";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";

export type DtoMappingError = {
    readonly type: "invalid-api-response";
    readonly entity: string;
    readonly field: string;
    readonly received: unknown;
};

export const optionToNullable = <Value>(
    value: O.Option<Value>,
): Value | null => {
    return O.toNullable(value);
};

const normalizeMediaUrl = (value: string): string => {
    if (/^https?:\/\//.test(value)) {
        return value;
    }

    return `/${value.replace(/^\/+/, "")}`;
};

export const optionToMediaUrl = (
    value: O.Option<string>,
): string | null => {
    return O.toNullable(O.map(normalizeMediaUrl)(value));
};

export const optionToArray = <Value>(
    value: O.Option<readonly Value[]>,
): readonly Value[] => {
    return O.getOrElse<readonly Value[]>(() => [])(value);
};

export const optionToBoolean = (value: O.Option<boolean>): boolean => {
    return O.getOrElse(() => false)(value);
};

export const optionToNumber = (value: O.Option<number>): number => {
    return O.getOrElse(() => 0)(value);
};

export const optionToIsoString = (
    value: O.Option<Date>,
): string | null => {
    return O.toNullable(
        O.map((date: Date) => date.toISOString())(value),
    );
};

export const requireString = (
    entity: string,
    field: string,
    value: string | null,
): E.Either<DtoMappingError, string> => {
    if (value === null || value.trim() === "") {
        return E.left({
            type: "invalid-api-response",
            entity,
            field,
            received: value,
        });
    }

    return E.right(value);
};

export const requireOneOf = <Value extends string>(
    entity: string,
    field: string,
    value: string | null,
    allowed: readonly Value[],
): E.Either<DtoMappingError, Value> => {
    const matched = allowed.find((candidate) => candidate === value);

    if (matched !== undefined) {
        return E.right(matched);
    }

    return E.left({
        type: "invalid-api-response",
        entity,
        field,
        received: value,
    });
};

export const mapReadonlyArray = <Input, Output>(
    values: readonly Input[],
    mapper: (value: Input) => E.Either<DtoMappingError, Output>,
): E.Either<DtoMappingError, readonly Output[]> => {
    return E.traverseArray(mapper)(values);
};
