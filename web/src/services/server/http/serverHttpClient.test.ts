import * as E from "fp-ts/Either";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => {
    return {};
});

import { isHttpError } from "./http.errors";
import { createServerHttpClient } from "./serverHttpClient";

const client = createServerHttpClient({
    baseUrl: "https://api.example.test",
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("serverHttpClient", () => {
    it("uses the generated request contract and returns a JSON transport value", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ id: "ticker" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }),
        );
        vi.stubGlobal("fetch", fetchMock);

        const result = await client.request({
            method: "GET",
            url: "/api/v1/ticker",
            query: "limit=3",
            responseType: "json",
            headers: { Accept: "application/json" },
        })();

        expect(E.isRight(result)).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith(
            "https://api.example.test/api/v1/ticker?limit=3",
            expect.objectContaining({
                cache: "no-store",
                method: "GET",
            }),
        );
    });

    it("classifies a failed HTTP status", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(
                new Response("Unavailable", {
                    status: 503,
                    statusText: "Service Unavailable",
                }),
            ),
        );

        const result = await client.request({
            method: "GET",
            url: "/api/v1/ticker",
            responseType: "json",
        })();

        expect(E.isLeft(result)).toBe(true);
        if (
            E.isLeft(result) &&
            isHttpError(result.left) &&
            result.left.type === "http-status"
        ) {
            expect(result.left.type).toBe("http-status");
            expect(result.left.status).toBe(503);
        }
    });

    it("classifies an unreachable backend", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

        const result = await client.request({
            method: "GET",
            url: "/api/v1/ticker",
            responseType: "json",
        })();

        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result) && isHttpError(result.left)) {
            expect(result.left.type).toBe("network");
        }
    });

    it("classifies an invalid JSON response", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(new Response("not JSON", { status: 200 })),
        );

        const result = await client.request({
            method: "GET",
            url: "/api/v1/ticker",
            responseType: "json",
        })();

        expect(E.isLeft(result)).toBe(true);
        if (
            E.isLeft(result) &&
            isHttpError(result.left) &&
            result.left.type === "response-parsing"
        ) {
            expect(result.left.type).toBe("response-parsing");
            expect(result.left.responseType).toBe("json");
        }
    });
});
