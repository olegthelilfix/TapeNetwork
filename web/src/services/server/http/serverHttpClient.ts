import "server-only";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import type { HTTPClient2, Request } from "@/api/client/client";

import {
    createHttpNetworkError,
    createHttpResponseParsingError,
    createHttpStatusError,
} from "./http.errors";

type ServerHttpClientOptions = {
    readonly baseUrl?: string;
};

const getBaseUrl = (baseUrl: string | undefined): string => {
    return baseUrl ?? process.env.API_BASE_URL ?? "http://localhost:8080";
};

const createHeaders = (
    headers: Request["headers"],
): Headers => {
    const result = new Headers();

    Object.entries(headers ?? {}).forEach(([name, value]) => {
        if (value !== undefined && value !== null) {
            result.set(name, String(value));
        }
    });

    return result;
};

const getResponseBody = async (
    response: Response,
    responseType: Request["responseType"],
): Promise<unknown> => {
    switch (responseType) {
        case "blob":
            return response.blob();
        case "text":
            return response.text();
        case "json":
            return response.json();
    }
};

const createRequestUrl = (
    baseUrl: string,
    request: Request,
): string => {
    const url = new URL(request.url, baseUrl);

    if (request.query !== undefined && request.query !== "") {
        url.search = request.query;
    }

    return url.toString();
};

const serializeRequestBody = (body: Request["body"]): string | undefined => {
    if (body === undefined) {
        return undefined;
    }

    return JSON.stringify(body);
};

export const createServerHttpClient = (
    options: ServerHttpClientOptions = {},
): HTTPClient2<typeof TE.URI> => {
    const baseUrl = getBaseUrl(options.baseUrl);

    return {
        ...TE.taskEither,
        request: (request: Request) => {
            return pipe(
                TE.tryCatch(
                    async () => {
                        const url = createRequestUrl(baseUrl, request);
                        const headers = createHeaders(request.headers);

                        if (request.body !== undefined && !headers.has("Content-Type")) {
                            headers.set("Content-Type", "application/json");
                        }

                        return fetch(url, {
                            method: request.method,
                            headers,
                            body: serializeRequestBody(request.body),
                            cache: "no-store",
                        });
                    },
                    createHttpNetworkError,
                ),
                TE.chainW(
                    (
                        response,
                    ): TE.TaskEither<
                        ReturnType<typeof createHttpStatusError> |
                            ReturnType<typeof createHttpResponseParsingError>,
                        unknown
                    > => {
                    if (!response.ok) {
                        return TE.left(createHttpStatusError(response));
                    }

                    return TE.tryCatch(
                        () => getResponseBody(response, request.responseType),
                        (cause) =>
                            createHttpResponseParsingError(
                                cause,
                                request.responseType,
                            ),
                    );
                    },
                ),
            );
        },
    };
};

export const serverHttpClient = createServerHttpClient();
