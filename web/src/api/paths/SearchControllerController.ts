import { ResponseValidationError, HTTPClient, HTTPClient1, HTTPClient2 } from '../client/client';
import { SearchHit, SearchHitIO } from '../components/schemas/SearchHit';
import { serializePrimitiveParameter } from '../utils/openapi-3-utils';
import { getResponseTypeFromMediaType } from '../utils/utils';
import { either, option } from 'fp-ts';
import { compact } from 'fp-ts/lib/Array';
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { Option, fromEither } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { array, string, Int, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export interface SearchControllerController<F> {
	readonly search: (parameters: {
		query: { q: Option<string>; type: Option<string>; limit: Option<Int> };
	}) => HKT<F, Array<SearchHit>>;
}

export interface SearchControllerController1<F extends URIS> {
	readonly search: (parameters: {
		query: { q: Option<string>; type: Option<string>; limit: Option<Int> };
	}) => Kind<F, Array<SearchHit>>;
}

export interface SearchControllerController2<F extends URIS2> {
	readonly search: (parameters: {
		query: { q: Option<string>; type: Option<string>; limit: Option<Int> };
	}) => Kind2<F, Error, Array<SearchHit>>;
}

export function searchControllerController<F extends URIS2>(e: {
	httpClient: HTTPClient2<F>;
}): SearchControllerController2<F>;
export function searchControllerController<F extends URIS>(e: {
	httpClient: HTTPClient1<F>;
}): SearchControllerController1<F>;
export function searchControllerController<F>(e: { httpClient: HTTPClient<F> }): SearchControllerController<F>;
export function searchControllerController<F>(e: { httpClient: HTTPClient<F> }): SearchControllerController<F> {
	return {
		search: parameters => {
			const query = compact([
				pipe(
					optionFromNullable(string).encode(parameters.query['q']),
					option.fromNullable,
					option.chain(value => fromEither(serializePrimitiveParameter('form', 'q', value))),
				),
				pipe(
					optionFromNullable(string).encode(parameters.query['type']),
					option.fromNullable,
					option.chain(value => fromEither(serializePrimitiveParameter('form', 'type', value))),
				),
				pipe(
					optionFromNullable(Int).encode(parameters.query['limit']),
					option.fromNullable,
					option.chain(value => fromEither(serializePrimitiveParameter('form', 'limit', value))),
				),
			]).join('&');

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/v1/search`,
					method: 'GET',
					responseType,
					query,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						array(SearchHitIO).decode(value),
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
