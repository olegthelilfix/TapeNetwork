import { ResponseValidationError, HTTPClient, HTTPClient1, HTTPClient2 } from '../client/client';
import { JsonNode, JsonNodeIO } from '../components/schemas/JsonNode';
import { ScheduleSlot, ScheduleSlotIO } from '../components/schemas/ScheduleSlot';
import { serializePrimitiveParameter } from '../utils/openapi-3-utils';
import { getResponseTypeFromMediaType } from '../utils/utils';
import { either, option } from 'fp-ts';
import { compact } from 'fp-ts/lib/Array';
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { Option, fromEither } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { Int, array, string, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export interface AdminScheduleControllerController<F> {
	readonly getOne_4: (id: Int) => HKT<F, ScheduleSlot>;

	readonly put_4: (id: Int, parameters: { body: JsonNode }) => HKT<F, ScheduleSlot>;

	readonly delete_4: (id: Int) => HKT<F, ScheduleSlot>;

	readonly update_4: (id: Int, parameters: { body: JsonNode }) => HKT<F, ScheduleSlot>;

	readonly list_4: (parameters: {
		query: { _start: Option<Int>; _end: Option<Int>; _sort: Option<string>; _order: Option<string> };
	}) => HKT<F, Array<ScheduleSlot>>;

	readonly create_4: (parameters: { body: JsonNode }) => HKT<F, ScheduleSlot>;
}

export interface AdminScheduleControllerController1<F extends URIS> {
	readonly getOne_4: (id: Int) => Kind<F, ScheduleSlot>;

	readonly put_4: (id: Int, parameters: { body: JsonNode }) => Kind<F, ScheduleSlot>;

	readonly delete_4: (id: Int) => Kind<F, ScheduleSlot>;

	readonly update_4: (id: Int, parameters: { body: JsonNode }) => Kind<F, ScheduleSlot>;

	readonly list_4: (parameters: {
		query: { _start: Option<Int>; _end: Option<Int>; _sort: Option<string>; _order: Option<string> };
	}) => Kind<F, Array<ScheduleSlot>>;

	readonly create_4: (parameters: { body: JsonNode }) => Kind<F, ScheduleSlot>;
}

export interface AdminScheduleControllerController2<F extends URIS2> {
	readonly getOne_4: (id: Int) => Kind2<F, Error, ScheduleSlot>;

	readonly put_4: (id: Int, parameters: { body: JsonNode }) => Kind2<F, Error, ScheduleSlot>;

	readonly delete_4: (id: Int) => Kind2<F, Error, ScheduleSlot>;

	readonly update_4: (id: Int, parameters: { body: JsonNode }) => Kind2<F, Error, ScheduleSlot>;

	readonly list_4: (parameters: {
		query: { _start: Option<Int>; _end: Option<Int>; _sort: Option<string>; _order: Option<string> };
	}) => Kind2<F, Error, Array<ScheduleSlot>>;

	readonly create_4: (parameters: { body: JsonNode }) => Kind2<F, Error, ScheduleSlot>;
}

export function adminScheduleControllerController<F extends URIS2>(e: {
	httpClient: HTTPClient2<F>;
}): AdminScheduleControllerController2<F>;
export function adminScheduleControllerController<F extends URIS>(e: {
	httpClient: HTTPClient1<F>;
}): AdminScheduleControllerController1<F>;
export function adminScheduleControllerController<F>(e: {
	httpClient: HTTPClient<F>;
}): AdminScheduleControllerController<F>;
export function adminScheduleControllerController<F>(e: {
	httpClient: HTTPClient<F>;
}): AdminScheduleControllerController<F> {
	return {
		getOne_4: id => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/schedule/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'GET',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						ScheduleSlotIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		put_4: (id, parameters) => {
			const body = JsonNodeIO.encode(parameters.body);

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
				'Content-type': 'application/json',
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/schedule/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'PUT',
					responseType,

					body,
					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						ScheduleSlotIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		delete_4: id => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/schedule/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'DELETE',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						ScheduleSlotIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		update_4: (id, parameters) => {
			const body = JsonNodeIO.encode(parameters.body);

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
				'Content-type': 'application/json',
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/schedule/${encodeURIComponent(Int.encode(id).toString())}`,
					method: 'PATCH',
					responseType,

					body,
					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						ScheduleSlotIO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		list_4: parameters => {
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
					url: `/api/admin/schedule`,
					method: 'GET',
					responseType,
					query,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						array(ScheduleSlotIO).decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		create_4: parameters => {
			const body = JsonNodeIO.encode(parameters.body);

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
				'Content-type': 'application/json',
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/schedule`,
					method: 'POST',
					responseType,

					body,
					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						ScheduleSlotIO.decode(value),
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
