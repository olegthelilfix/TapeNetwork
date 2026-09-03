import "server-only";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import type { Int } from "io-ts";

import { articleControllerController } from "@/api/paths/ArticleControllerController";
import type { Article, ArticlePage } from "@/domain/article";
import { serverHttpClient } from "@/services/server/http";
import { mapArticleDto, mapArticlePageDto } from "@/services/server/mappers";

import type { ControllerError } from "../controller.errors";
import {
    type ControllerResult,
    mapGeneratedResult,
    toOptionalInteger,
} from "../controller.utils";

export type GetArticlesInput = {
    readonly category?: string;
    readonly page?: number;
    readonly size?: number;
};

const generatedController = articleControllerController({
    httpClient: serverHttpClient,
});

const createArticleQuery = (
    input: GetArticlesInput,
): E.Either<
    ControllerError,
    {
        readonly category: O.Option<string>;
        readonly page: O.Option<Int>;
        readonly size: O.Option<Int>;
    }
> => {
    return pipe(
        E.Do,
        E.bind("page", () => toOptionalInteger("page", input.page)),
        E.bind("size", () => toOptionalInteger("size", input.size)),
        E.map(({ page, size }) => ({
            category: O.fromNullable(input.category),
            page,
            size,
        })),
    );
};

export const getArticles = (
    input: GetArticlesInput = {},
): ControllerResult<ArticlePage> => {
    return pipe(
        createArticleQuery(input),
        TE.fromEither,
        TE.chain((query) =>
            mapGeneratedResult(
                generatedController.list_15({ query }),
                mapArticlePageDto,
            ),
        ),
    );
};

export const getArticleBySlug = (slug: string): ControllerResult<Article> => {
    return mapGeneratedResult(generatedController.bySlug_1(slug), mapArticleDto);
};
