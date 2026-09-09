import { ResponseValidationError, HTTPClient, HTTPClient1, HTTPClient2 } from '../client/client';
import { JsonNode, JsonNodeIO } from '../components/schemas/JsonNode';
import { TickerQuote, TickerQuoteIO } from '../components/schemas/TickerQuote';
import { serializePrimitiveParameter } from '../utils/openapi-3-utils';
import { getResponseTypeFromMediaType } from '../utils/utils';
import { either, option } from 'fp-ts';
import { compact } from 'fp-ts/lib/Array';
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { Option, fromEither } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { Int, array, string, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export interface AdminTickerControllerController<F> {
	readonly getOne_1: (id: Int) => HKT<F, TickerQuote>;

	readonly put_1: (id: Int, parameters: { body: JsonNode }) => HKT<F, TickerQuote>;

	readonly delete_1: (id: Int) => HKT<F, TickerQuote>;

	readonly update_1: (id: Int, parameters: { body: JsonNode }) => HKT<F, TickerQuote>;

	readonly list_1: (parameters: {
		query: { _start: Option<Int>; _end: Option<Int>; _sort: Option<string>; _order: Option<string> };
	}) => HKT<F, Array<TickerQuote>>;

	readonly create_1: (parameters: { body: JsonNode }) => HKT<F, TickerQuote>;
}

export interface AdminTickerControllerController1<F extends URIS> {
	readonly getOne_1: (id: Int) => Kind<F, TickerQuote>;

	readonly put_1: (id: Int, parameters: { body: JsonNode }) => Kind<F, TickerQuote>;

	readonly delete_1: (id: Int) => Kind<F, TickerQuote>;

	readonly update_1: (id: Int, parameters: { body: JsonNode }) => Kind<F, TickerQuote>;

	readonly list_1: (parameters: {
		query: { _start: Option<Int>; _end: Option<Int>; _sort: Option<string>; _order: Option<string> };
	}) => Kind<F, Array<TickerQuote>>;

	readonly create_1: (parameters: { body: JsonNode }) => Kind<F, TickerQuote>;
}

export interface AdminTickerControllerController2<F extends URIS2> {
	readonly getOne_1: (id: Int) => Kind2<F, Error, TickerQuote>;

	readonly put_1: (id: Int, parameters: { body: JsonNode }) => Kind2<F, Error, TickerQuote>;

	readonly delete_1: (id: Int) => Kind2<F, Error, TickerQuote>;

	readonly update_1: (id: Int, parameters: { body: JsonNode }) => Kind2<F, Error, TickerQuote>;

	readonly list_1: (parameters: {
		query: { _start: Option<Int>; _end: Option<Int>; _sort: Option<string>; _order: Option<string> };
	}) => Kind2<F, Error, Array<TickerQuote>>;

	readonly create_1: (parameters: { body: JsonNode }) => Kind2<F, Error, TickerQuote>;
}

export function adminTickerControllerController<F extends URIS2>(e: {
	httpClient: HTTPClient2<F>;
}): AdminTickerControllerController2<F>;
export function adminTickerControllerController<F extends URIS>(e: {
	httpClient: HTTPClient1<F>;
}): AdminTickerControllerController1<F>;
export function adminTickerControllerController<F>(e: {
	httpClient: HTTPClient<F>;
}): AdminTickerControllerController<F>;
export function adminTickerControllerController<F>(e: {
	httpClient: HTTPClient<F>;
}): AdminTickerControllerController<F> {
	return {
		getOne_1: id => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/ticker/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'GET',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						TickerQuoteIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		put_1: (id, parameters) => {
			const body = JsonNodeIO.encode(parameters.body);

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
				'Content-type': 'application/json',
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/ticker/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'PUT',
					responseType,

					body,
					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						TickerQuoteIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		delete_1: id => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/ticker/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'DELETE',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						TickerQuoteIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		update_1: (id, parameters) => {
			const body = JsonNodeIO.encode(parameters.body);

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
				'Content-type': 'application/json',
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/ticker/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'PATCH',
					responseType,

					body,
					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						TickerQuoteIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		list_1: parameters => {
			const query = compact([
				pipe(
					optionFromNullable(Int).encode(parameters.query['_start']),
					option.fromNullable,
					option.chain(value => fromEither(serializePrimitiveParameter('form', '_start', value))),
				),
				pipe(
					optionFromNullable(Int).encode(parameters.query['_end']),
					option.fromNullable,
					option.chain(value => fromEither(serializePrimitiveParameter('form', '_end', value))),
				),
				pipe(
					optionFromNullable(string).encode(parameters.query['_sort']),
					option.fromNullable,
					option.chain(value => fromEither(serializePrimitiveParameter('form', '_sort', value))),
				),
				pipe(
					optionFromNullable(string).encode(parameters.query['_order']),
					option.fromNullable,
					option.chain(value => fromEither(serializePrimitiveParameter('form', '_order', value))),
				),
			]).join('&');

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/ticker`,
					method: 'GET',
					responseType,
					query,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						array(TickerQuoteIO).decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		create_1: parameters => {
			const body = JsonNodeIO.encode(parameters.body);

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
				'Content-type': 'application/json',
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/ticker`,
					method: 'POST',
					responseType,

					body,
					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						TickerQuoteIO.decode(value),
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
