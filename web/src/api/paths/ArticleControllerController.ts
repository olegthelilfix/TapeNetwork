import { ResponseValidationError, HTTPClient, HTTPClient1, HTTPClient2 } from '../client/client';
import { ArticleDtoV1, ArticleDtoV1IO } from '../components/schemas/ArticleDtoV1';
import {
	PagedResponseArticleDtoV1,
	PagedResponseArticleDtoV1IO,
} from '../components/schemas/PagedResponseArticleDtoV1';
import { serializePrimitiveParameter } from '../utils/openapi-3-utils';
import { getResponseTypeFromMediaType } from '../utils/utils';
import { either, option } from 'fp-ts';
import { compact } from 'fp-ts/lib/Array';
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { Option, fromEither } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { string, Int, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export interface ArticleControllerController<F> {
	readonly list_3: (parameters: {
		query: { category: Option<string>; page: Option<Int>; size: Option<Int> };
	}) => HKT<F, PagedResponseArticleDtoV1>;

	readonly bySlug_1: (slug: string) => HKT<F, ArticleDtoV1>;
}

export interface ArticleControllerController1<F extends URIS> {
	readonly list_3: (parameters: {
		query: { category: Option<string>; page: Option<Int>; size: Option<Int> };
	}) => Kind<F, PagedResponseArticleDtoV1>;

	readonly bySlug_1: (slug: string) => Kind<F, ArticleDtoV1>;
}

export interface ArticleControllerController2<F extends URIS2> {
	readonly list_3: (parameters: {
		query: { category: Option<string>; page: Option<Int>; size: Option<Int> };
	}) => Kind2<F, Error, PagedResponseArticleDtoV1>;

	readonly bySlug_1: (slug: string) => Kind2<F, Error, ArticleDtoV1>;
}

export function articleControllerController<F extends URIS2>(e: {
	httpClient: HTTPClient2<F>;
}): ArticleControllerController2<F>;
export function articleControllerController<F extends URIS>(e: {
	httpClient: HTTPClient1<F>;
}): ArticleControllerController1<F>;
export function articleControllerController<F>(e: { httpClient: HTTPClient<F> }): ArticleControllerController<F>;
export function articleControllerController<F>(e: { httpClient: HTTPClient<F> }): ArticleControllerController<F> {
	return {
		list_3: parameters => {
			const query = compact([
				pipe(
					optionFromNullable(string).encode(parameters.query['category']),
					option.fromNullable,
					option.chain(value => fromEither(serializePrimitiveParameter('form', 'category', value))),
				),
				pipe(
					optionFromNullable(Int).encode(parameters.query['page']),
					option.fromNullable,
					option.chain(value => fromEither(serializePrimitiveParameter('form', 'page', value))),
				),
				pipe(
					optionFromNullable(Int).encode(parameters.query['size']),
					option.fromNullable,
					option.chain(value => fromEither(serializePrimitiveParameter('form', 'size', value))),
				),
			]).join('&');

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/v1/articles`,
					method: 'GET',
					responseType,
					query,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						PagedResponseArticleDtoV1IO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		bySlug_1: slug => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/v1/articles/${encodeURIComponent(string.encode(slug).toString())}`,
					method: 'GET',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						ArticleDtoV1IO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},
	};
}
