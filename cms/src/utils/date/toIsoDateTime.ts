import dayjs from "dayjs";

export const toIsoDateTime = (value: unknown): unknown => {
    return dayjs.isDayjs(value) ? value.toISOString() : value;
};

export const serializeDateTimeFields = (
    values: Record<string, unknown>,
    fieldNames: readonly string[],
): Record<string, unknown> => {
    return fieldNames.reduce<Record<string, unknown>>((result, fieldName) => ({
        ...result,
        [fieldName]: toIsoDateTime(values[fieldName]),
    }), values);
};
