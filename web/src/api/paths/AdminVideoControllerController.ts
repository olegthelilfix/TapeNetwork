import { ResponseValidationError, HTTPClient, HTTPClient1, HTTPClient2 } from '../client/client';
import { JsonNode, JsonNodeIO } from '../components/schemas/JsonNode';
import { Video, VideoIO } from '../components/schemas/Video';
import { serializePrimitiveParameter } from '../utils/openapi-3-utils';
import { getResponseTypeFromMediaType } from '../utils/utils';
import { either, option } from 'fp-ts';
import { compact } from 'fp-ts/lib/Array';
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { Option, fromEither } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { Int, array, string, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export interface AdminVideoControllerController<F> {
	readonly getOne: (id: Int) => HKT<F, Video>;

	readonly put: (id: Int, parameters: { body: JsonNode }) => HKT<F, Video>;

	readonly delete: (id: Int) => HKT<F, Video>;

	readonly update: (id: Int, parameters: { body: JsonNode }) => HKT<F, Video>;

	readonly list: (parameters: {
		query: { _start: Option<Int>; _end: Option<Int>; _sort: Option<string>; _order: Option<string> };
	}) => HKT<F, Array<Video>>;

	readonly create: (parameters: { body: JsonNode }) => HKT<F, Video>;
}

export interface AdminVideoControllerController1<F extends URIS> {
	readonly getOne: (id: Int) => Kind<F, Video>;

	readonly put: (id: Int, parameters: { body: JsonNode }) => Kind<F, Video>;

	readonly delete: (id: Int) => Kind<F, Video>;

	readonly update: (id: Int, parameters: { body: JsonNode }) => Kind<F, Video>;

	readonly list: (parameters: {
		query: { _start: Option<Int>; _end: Option<Int>; _sort: Option<string>; _order: Option<string> };
	}) => Kind<F, Array<Video>>;

	readonly create: (parameters: { body: JsonNode }) => Kind<F, Video>;
}

export interface AdminVideoControllerController2<F extends URIS2> {
	readonly getOne: (id: Int) => Kind2<F, Error, Video>;

	readonly put: (id: Int, parameters: { body: JsonNode }) => Kind2<F, Error, Video>;

	readonly delete: (id: Int) => Kind2<F, Error, Video>;

	readonly update: (id: Int, parameters: { body: JsonNode }) => Kind2<F, Error, Video>;

	readonly list: (parameters: {
		query: { _start: Option<Int>; _end: Option<Int>; _sort: Option<string>; _order: Option<string> };
	}) => Kind2<F, Error, Array<Video>>;

	readonly create: (parameters: { body: JsonNode }) => Kind2<F, Error, Video>;
}

export function adminVideoControllerController<F extends URIS2>(e: {
	httpClient: HTTPClient2<F>;
}): AdminVideoControllerController2<F>;
export function adminVideoControllerController<F extends URIS>(e: {
	httpClient: HTTPClient1<F>;
}): AdminVideoControllerController1<F>;
export function adminVideoControllerController<F>(e: { httpClient: HTTPClient<F> }): AdminVideoControllerController<F>;
export function adminVideoControllerController<F>(e: { httpClient: HTTPClient<F> }): AdminVideoControllerController<F> {
	return {
		getOne: id => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/videos/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'GET',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						VideoIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		put: (id, parameters) => {
			const body = JsonNodeIO.encode(parameters.body);

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
				'Content-type': 'application/json',
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/videos/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'PUT',
					responseType,

					body,
					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						VideoIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		delete: id => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/videos/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'DELETE',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						VideoIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		update: (id, parameters) => {
			const body = JsonNodeIO.encode(parameters.body);

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
				'Content-type': 'application/json',
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/videos/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'PATCH',
					responseType,

					body,
					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						VideoIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		list: parameters => {
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
					url: `/api/admin/videos`,
					method: 'GET',
					responseType,
					query,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						array(VideoIO).decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		create: parameters => {
			const body = JsonNodeIO.encode(parameters.body);

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
				'Content-type': 'application/json',
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/videos`,
					method: 'POST',
					responseType,

					body,
					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						VideoIO.decode(value),
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
