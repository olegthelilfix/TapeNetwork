import { ResponseValidationError, HTTPClient, HTTPClient1, HTTPClient2 } from '../client/client';
import { JsonNode, JsonNodeIO } from '../components/schemas/JsonNode';
import { MediaAsset, MediaAssetIO } from '../components/schemas/MediaAsset';
import { serializePrimitiveParameter } from '../utils/openapi-3-utils';
import { getResponseTypeFromMediaType } from '../utils/utils';
import { either, option } from 'fp-ts';
import { compact } from 'fp-ts/lib/Array';
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { Option, fromEither } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { Int, array, string, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export interface AdminMediaControllerController<F> {
	readonly getOne_5: (id: Int) => HKT<F, MediaAsset>;

	readonly put_5: (id: Int, parameters: { body: JsonNode }) => HKT<F, MediaAsset>;

	readonly delete_5: (id: Int) => HKT<F, MediaAsset>;

	readonly update_5: (id: Int, parameters: { body: JsonNode }) => HKT<F, MediaAsset>;

	readonly list_5: (parameters: {
		query: { _start: Option<Int>; _end: Option<Int>; _sort: Option<string>; _order: Option<string> };
	}) => HKT<F, Array<MediaAsset>>;

	readonly create_5: (parameters: { body: JsonNode }) => HKT<F, MediaAsset>;
}

export interface AdminMediaControllerController1<F extends URIS> {
	readonly getOne_5: (id: Int) => Kind<F, MediaAsset>;

	readonly put_5: (id: Int, parameters: { body: JsonNode }) => Kind<F, MediaAsset>;

	readonly delete_5: (id: Int) => Kind<F, MediaAsset>;

	readonly update_5: (id: Int, parameters: { body: JsonNode }) => Kind<F, MediaAsset>;

	readonly list_5: (parameters: {
		query: { _start: Option<Int>; _end: Option<Int>; _sort: Option<string>; _order: Option<string> };
	}) => Kind<F, Array<MediaAsset>>;

	readonly create_5: (parameters: { body: JsonNode }) => Kind<F, MediaAsset>;
}

export interface AdminMediaControllerController2<F extends URIS2> {
	readonly getOne_5: (id: Int) => Kind2<F, Error, MediaAsset>;

	readonly put_5: (id: Int, parameters: { body: JsonNode }) => Kind2<F, Error, MediaAsset>;

	readonly delete_5: (id: Int) => Kind2<F, Error, MediaAsset>;

	readonly update_5: (id: Int, parameters: { body: JsonNode }) => Kind2<F, Error, MediaAsset>;

	readonly list_5: (parameters: {
		query: { _start: Option<Int>; _end: Option<Int>; _sort: Option<string>; _order: Option<string> };
	}) => Kind2<F, Error, Array<MediaAsset>>;

	readonly create_5: (parameters: { body: JsonNode }) => Kind2<F, Error, MediaAsset>;
}

export function adminMediaControllerController<F extends URIS2>(e: {
	httpClient: HTTPClient2<F>;
}): AdminMediaControllerController2<F>;
export function adminMediaControllerController<F extends URIS>(e: {
	httpClient: HTTPClient1<F>;
}): AdminMediaControllerController1<F>;
export function adminMediaControllerController<F>(e: { httpClient: HTTPClient<F> }): AdminMediaControllerController<F>;
export function adminMediaControllerController<F>(e: { httpClient: HTTPClient<F> }): AdminMediaControllerController<F> {
	return {
		getOne_5: id => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/media/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'GET',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						MediaAssetIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		put_5: (id, parameters) => {
			const body = JsonNodeIO.encode(parameters.body);

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
				'Content-type': 'application/json',
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/media/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'PUT',
					responseType,

					body,
					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						MediaAssetIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		delete_5: id => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/media/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'DELETE',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						MediaAssetIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		update_5: (id, parameters) => {
			const body = JsonNodeIO.encode(parameters.body);

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
				'Content-type': 'application/json',
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/media/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'PATCH',
					responseType,

					body,
					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						MediaAssetIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		list_5: parameters => {
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
					url: `/api/admin/media`,
					method: 'GET',
					responseType,
					query,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						array(MediaAssetIO).decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		create_5: parameters => {
			const body = JsonNodeIO.encode(parameters.body);

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
				'Content-type': 'application/json',
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/media`,
					method: 'POST',
					responseType,

					body,
					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						MediaAssetIO.decode(value),
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
