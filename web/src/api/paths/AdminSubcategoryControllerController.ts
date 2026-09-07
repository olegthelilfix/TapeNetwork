import { ResponseValidationError, HTTPClient, HTTPClient1, HTTPClient2 } from '../client/client';
import { JsonNode, JsonNodeIO } from '../components/schemas/JsonNode';
import { Subcategory, SubcategoryIO } from '../components/schemas/Subcategory';
import { serializePrimitiveParameter } from '../utils/openapi-3-utils';
import { getResponseTypeFromMediaType } from '../utils/utils';
import { either, option } from 'fp-ts';
import { compact } from 'fp-ts/lib/Array';
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { Option, fromEither } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { Int, array, string, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export interface AdminSubcategoryControllerController<F> {
	readonly getOne_2: (id: Int) => HKT<F, Subcategory>;

	readonly put_2: (id: Int, parameters: { body: JsonNode }) => HKT<F, Subcategory>;

	readonly delete_2: (id: Int) => HKT<F, Subcategory>;

	readonly update_2: (id: Int, parameters: { body: JsonNode }) => HKT<F, Subcategory>;

	readonly list_2: (parameters: {
		query: { _start: Option<Int>; _end: Option<Int>; _sort: Option<string>; _order: Option<string> };
	}) => HKT<F, Array<Subcategory>>;

	readonly create_2: (parameters: { body: JsonNode }) => HKT<F, Subcategory>;
}

export interface AdminSubcategoryControllerController1<F extends URIS> {
	readonly getOne_2: (id: Int) => Kind<F, Subcategory>;

	readonly put_2: (id: Int, parameters: { body: JsonNode }) => Kind<F, Subcategory>;

	readonly delete_2: (id: Int) => Kind<F, Subcategory>;

	readonly update_2: (id: Int, parameters: { body: JsonNode }) => Kind<F, Subcategory>;

	readonly list_2: (parameters: {
		query: { _start: Option<Int>; _end: Option<Int>; _sort: Option<string>; _order: Option<string> };
	}) => Kind<F, Array<Subcategory>>;

	readonly create_2: (parameters: { body: JsonNode }) => Kind<F, Subcategory>;
}

export interface AdminSubcategoryControllerController2<F extends URIS2> {
	readonly getOne_2: (id: Int) => Kind2<F, Error, Subcategory>;

	readonly put_2: (id: Int, parameters: { body: JsonNode }) => Kind2<F, Error, Subcategory>;

	readonly delete_2: (id: Int) => Kind2<F, Error, Subcategory>;

	readonly update_2: (id: Int, parameters: { body: JsonNode }) => Kind2<F, Error, Subcategory>;

	readonly list_2: (parameters: {
		query: { _start: Option<Int>; _end: Option<Int>; _sort: Option<string>; _order: Option<string> };
	}) => Kind2<F, Error, Array<Subcategory>>;

	readonly create_2: (parameters: { body: JsonNode }) => Kind2<F, Error, Subcategory>;
}

export function adminSubcategoryControllerController<F extends URIS2>(e: {
	httpClient: HTTPClient2<F>;
}): AdminSubcategoryControllerController2<F>;
export function adminSubcategoryControllerController<F extends URIS>(e: {
	httpClient: HTTPClient1<F>;
}): AdminSubcategoryControllerController1<F>;
export function adminSubcategoryControllerController<F>(e: {
	httpClient: HTTPClient<F>;
}): AdminSubcategoryControllerController<F>;
export function adminSubcategoryControllerController<F>(e: {
	httpClient: HTTPClient<F>;
}): AdminSubcategoryControllerController<F> {
	return {
		getOne_2: id => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/subcategories/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'GET',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						SubcategoryIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		put_2: (id, parameters) => {
			const body = JsonNodeIO.encode(parameters.body);

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
				'Content-type': 'application/json',
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/subcategories/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'PUT',
					responseType,

					body,
					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						SubcategoryIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		delete_2: id => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/subcategories/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'DELETE',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						SubcategoryIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		update_2: (id, parameters) => {
			const body = JsonNodeIO.encode(parameters.body);

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
				'Content-type': 'application/json',
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/subcategories/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'PATCH',
					responseType,

					body,
					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						SubcategoryIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		list_2: parameters => {
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
					url: `/api/admin/subcategories`,
					method: 'GET',
					responseType,
					query,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						array(SubcategoryIO).decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		create_2: parameters => {
			const body = JsonNodeIO.encode(parameters.body);

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
				'Content-type': 'application/json',
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/subcategories`,
					method: 'POST',
					responseType,

					body,
					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						SubcategoryIO.decode(value),
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
