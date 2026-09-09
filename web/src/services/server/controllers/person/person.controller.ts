import "server-only";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import type { ArticleSummary } from "@/domain/article";
import type { Person, PersonSummary, PersonVideo, PersonVideoRole } from "@/domain/person";
import { serverHttpClient } from "@/services/server/http";

import { normalizeControllerError } from "../controller.errors";
import type { ControllerResult } from "../controller.utils";

/**
 * The generated OpenAPI client is NOT regenerated here (that needs a running
 * backend). Instead this controller reuses `serverHttpClient` to reach the
 * public `GET /api/v1/people/{slug}` endpoint and hand-maps the raw JSON into
 * the `Person` domain type, mirroring the DTO->domain style of the generated
 * controllers. When the backend endpoint is added to the OpenAPI client this
 * can be swapped for the generated `personController` + a mappers-based mapper.
 */

type RawPersonVideo = {
    readonly slug?: unknown;
    readonly title?: unknown;
    readonly showName?: unknown;
    readonly durationLabel?: unknown;
    readonly imageUrl?: unknown;
    readonly role?: unknown;
};

type RawArticle = {
    readonly slug?: unknown;
    readonly category?: unknown;
    readonly title?: unknown;
    readonly dek?: unknown;
    readonly author?: unknown;
    readonly readMinutes?: unknown;
    readonly imageUrl?: unknown;
    readonly publishedAt?: unknown;
};

type RawPerson = {
    readonly slug?: unknown;
    readonly name?: unknown;
    readonly initials?: unknown;
    readonly bio?: unknown;
    readonly imageUrl?: unknown;
    readonly videos?: unknown;
    readonly articles?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null;
};

const asString = (value: unknown): string | null => {
    return typeof value === "string" && value.trim() !== "" ? value : null;
};

const asNumber = (value: unknown): number | null => {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
};

/** Relative upload paths are served on the web origin; absolute URLs pass through. */
const asMediaUrl = (value: unknown): string | null => {
    const raw = asString(value);

    if (raw === null) {
        return null;
    }

    if (/^https?:\/\//.test(raw)) {
        return raw;
    }

    return `/${raw.replace(/^\/+/, "")}`;
};

const asRole = (value: unknown): PersonVideoRole | null => {
    return value === "host" || value === "guest" ? value : null;
};

const mapVideo = (raw: RawPersonVideo): PersonVideo | null => {
    const slug = asString(raw.slug);
    const title = asString(raw.title);

    if (slug === null || title === null) {
        return null;
    }

    return {
        slug,
        title,
        showName: asString(raw.showName),
        durationLabel: asString(raw.durationLabel),
        imageUrl: asMediaUrl(raw.imageUrl),
        role: asRole(raw.role),
    };
};

const mapArticle = (raw: RawArticle): ArticleSummary | null => {
    const slug = asString(raw.slug);
    const title = asString(raw.title);

    if (slug === null || title === null) {
        return null;
    }

    return {
        slug,
        title,
        category: asString(raw.category),
        dek: asString(raw.dek),
        author: asString(raw.author),
        publishedAt: asString(raw.publishedAt),
        readMinutes: asNumber(raw.readMinutes),
        imageUrl: asMediaUrl(raw.imageUrl),
    };
};

const mapArray = <Input, Output>(
    value: unknown,
    mapper: (item: Input) => Output | null,
): readonly Output[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter(isRecord)
        .map((item) => mapper(item as Input))
        .filter((item): item is Output => item !== null);
};

const mapPerson = (payload: unknown): E.Either<Error, Person> => {
    if (!isRecord(payload)) {
        return E.left(new Error("Person response was not an object."));
    }

    const raw = payload as RawPerson;
    const slug = asString(raw.slug);
    const name = asString(raw.name);

    if (slug === null || name === null) {
        return E.left(new Error("Person response is missing slug or name."));
    }

    return E.right({
        slug,
        name,
        initials: asString(raw.initials),
        bio: asString(raw.bio),
        imageUrl: asMediaUrl(raw.imageUrl),
        videos: mapArray<RawPersonVideo, PersonVideo>(raw.videos, mapVideo),
        articles: mapArray<RawArticle, ArticleSummary>(raw.articles, mapArticle),
    });
};

export const getPersonBySlug = (slug: string): ControllerResult<Person> => {
    const request = serverHttpClient.request({
        method: "GET",
        url: `/api/v1/people/${encodeURIComponent(slug)}`,
        responseType: "json",
    });

    return pipe(
        request,
        TE.mapLeft(normalizeControllerError),
        TE.chainEitherKW((payload) =>
            pipe(
                mapPerson(payload),
                E.mapLeft(() => ({ type: "invalid-api-response" as const, entity: "Person", field: "response" })),
            ),
        ),
    );
};

const mapPersonSummary = (raw: Record<string, unknown>): PersonSummary | null => {
    const slug = asString(raw.slug);
    const name = asString(raw.name);

    if (slug === null || name === null) {
        return null;
    }

    return { slug, name, initials: asString(raw.initials) };
};

/** GET /api/v1/people — compact list for the header menu. */
export const getPeople = (): ControllerResult<readonly PersonSummary[]> => {
    const request = serverHttpClient.request({
        method: "GET",
        url: "/api/v1/people",
        responseType: "json",
    });

    return pipe(
        request,
        TE.mapLeft(normalizeControllerError),
        TE.map((payload) => mapArray<Record<string, unknown>, PersonSummary>(payload, mapPersonSummary)),
    );
};
