import { ResponseValidationError, HTTPClient, HTTPClient1, HTTPClient2 } from '../client/client';
import { Host, HostIO } from '../components/schemas/Host';
import { JsonNode, JsonNodeIO } from '../components/schemas/JsonNode';
import { serializePrimitiveParameter } from '../utils/openapi-3-utils';
import { getResponseTypeFromMediaType } from '../utils/utils';
import { either, option } from 'fp-ts';
import { compact } from 'fp-ts/lib/Array';
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { Option, fromEither } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { Int, array, string, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export interface AdminHostControllerController<F> {
	readonly getOne_6: (id: Int) => HKT<F, Host>;

	readonly put_6: (id: Int, parameters: { body: JsonNode }) => HKT<F, Host>;

	readonly delete_6: (id: Int) => HKT<F, Host>;

	readonly update_6: (id: Int, parameters: { body: JsonNode }) => HKT<F, Host>;

	readonly list_6: (parameters: {
		query: { _start: Option<Int>; _end: Option<Int>; _sort: Option<string>; _order: Option<string> };
	}) => HKT<F, Array<Host>>;

	readonly create_6: (parameters: { body: JsonNode }) => HKT<F, Host>;
}

export interface AdminHostControllerController1<F extends URIS> {
	readonly getOne_6: (id: Int) => Kind<F, Host>;

	readonly put_6: (id: Int, parameters: { body: JsonNode }) => Kind<F, Host>;

	readonly delete_6: (id: Int) => Kind<F, Host>;

	readonly update_6: (id: Int, parameters: { body: JsonNode }) => Kind<F, Host>;

	readonly list_6: (parameters: {
		query: { _start: Option<Int>; _end: Option<Int>; _sort: Option<string>; _order: Option<string> };
	}) => Kind<F, Array<Host>>;

	readonly create_6: (parameters: { body: JsonNode }) => Kind<F, Host>;
}

export interface AdminHostControllerController2<F extends URIS2> {
	readonly getOne_6: (id: Int) => Kind2<F, Error, Host>;

	readonly put_6: (id: Int, parameters: { body: JsonNode }) => Kind2<F, Error, Host>;

	readonly delete_6: (id: Int) => Kind2<F, Error, Host>;

	readonly update_6: (id: Int, parameters: { body: JsonNode }) => Kind2<F, Error, Host>;

	readonly list_6: (parameters: {
		query: { _start: Option<Int>; _end: Option<Int>; _sort: Option<string>; _order: Option<string> };
	}) => Kind2<F, Error, Array<Host>>;

	readonly create_6: (parameters: { body: JsonNode }) => Kind2<F, Error, Host>;
}

export function adminHostControllerController<F extends URIS2>(e: {
	httpClient: HTTPClient2<F>;
}): AdminHostControllerController2<F>;
export function adminHostControllerController<F extends URIS>(e: {
	httpClient: HTTPClient1<F>;
}): AdminHostControllerController1<F>;
export function adminHostControllerController<F>(e: { httpClient: HTTPClient<F> }): AdminHostControllerController<F>;
export function adminHostControllerController<F>(e: { httpClient: HTTPClient<F> }): AdminHostControllerController<F> {
	return {
		getOne_6: id => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/hosts/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'GET',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						HostIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		put_6: (id, parameters) => {
			const body = JsonNodeIO.encode(parameters.body);

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
				'Content-type': 'application/json',
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/hosts/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'PUT',
					responseType,

					body,
					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						HostIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		delete_6: id => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/hosts/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'DELETE',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						HostIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		update_6: (id, parameters) => {
			const body = JsonNodeIO.encode(parameters.body);

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
				'Content-type': 'application/json',
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/hosts/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'PATCH',
					responseType,

					body,
					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						HostIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		list_6: parameters => {
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
					url: `/api/admin/hosts`,
					method: 'GET',
					responseType,
					query,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						array(HostIO).decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		create_6: parameters => {
			const body = JsonNodeIO.encode(parameters.body);

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
				'Content-type': 'application/json',
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/hosts`,
					method: 'POST',
					responseType,

					body,
					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						HostIO.decode(value),
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
