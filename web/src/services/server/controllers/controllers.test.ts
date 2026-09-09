import * as E from "fp-ts/Either";
import { describe, expect, it, vi } from "vitest";

import { createHttpNetworkError, createHttpStatusError } from "@/services/server/http";

import { getArticles } from "./article";
import { search } from "./content";
import { normalizeControllerError } from "./controller.errors";

vi.mock("server-only", () => {
    return {};
});

describe("server application controllers", () => {
    it("rejects non-integer pagination before it reaches the generated API", async () => {
        const result = await getArticles({ page: 1.5 })();

        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
            expect(result.left).toEqual({ type: "invalid-input", field: "page" });
        }
    });

    it("rejects a non-integer search limit", async () => {
        const result = await search({ query: "markets", limit: 1.5 })();

        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
            expect(result.left).toEqual({ type: "invalid-input", field: "limit" });
        }
    });

    it("normalizes expected transport failures", () => {
        expect(normalizeControllerError(createHttpNetworkError(new Error("offline")))).toEqual({
            type: "backend-unavailable",
        });
        expect(
            normalizeControllerError(
                createHttpStatusError(new Response(null, { status: 404 })),
            ),
        ).toEqual({ type: "not-found" });
    });
});
