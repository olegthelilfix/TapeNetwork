export type HttpNetworkError = Error & {
    readonly type: "network";
    readonly cause: unknown;
};

export type HttpStatusError = Error & {
    readonly type: "http-status";
    readonly status: number;
    readonly statusText: string;
    readonly url: string;
};

export type HttpResponseParsingError = Error & {
    readonly type: "response-parsing";
    readonly cause: unknown;
    readonly responseType: "json" | "blob" | "text";
};

export type HttpError =
    | HttpNetworkError
    | HttpStatusError
    | HttpResponseParsingError;

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null;
};

export const isHttpError = (value: unknown): value is HttpError => {
    if (!(value instanceof Error) || !isRecord(value)) {
        return false;
    }

    switch (value.type) {
        case "network":
            return "cause" in value;
        case "http-status":
            return (
                typeof value.status === "number" &&
                typeof value.statusText === "string" &&
                typeof value.url === "string"
            );
        case "response-parsing":
            return (
                "cause" in value &&
                (value.responseType === "json" ||
                    value.responseType === "blob" ||
                    value.responseType === "text")
            );
        default:
            return false;
    }
};

export const createHttpNetworkError = (
    cause: unknown,
): HttpNetworkError => {
    const details: {
        readonly type: "network";
        readonly cause: unknown;
    } = {
        type: "network",
        cause,
    };

    return Object.assign(
        new Error("The backend could not be reached."),
        details,
    );
};

export const createHttpStatusError = (
    response: Response,
): HttpStatusError => {
    const details: {
        readonly type: "http-status";
        readonly status: number;
        readonly statusText: string;
        readonly url: string;
    } = {
        type: "http-status",
        status: response.status,
        statusText: response.statusText,
        url: response.url,
    };

    return Object.assign(
        new Error(`The backend returned HTTP ${response.status}.`),
        details,
    );
};

export const createHttpResponseParsingError = (
    cause: unknown,
    responseType: HttpResponseParsingError["responseType"],
): HttpResponseParsingError => {
    const details: {
        readonly type: "response-parsing";
        readonly cause: unknown;
        readonly responseType: HttpResponseParsingError["responseType"];
    } = {
        type: "response-parsing",
        cause,
        responseType,
    };

    return Object.assign(
        new Error("The backend response could not be parsed."),
        details,
    );
};
