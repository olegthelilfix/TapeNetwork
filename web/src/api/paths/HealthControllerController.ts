import { ResponseValidationError, HTTPClient, HTTPClient1, HTTPClient2 } from '../client/client';
import { getResponseTypeFromMediaType } from '../utils/utils';
import { either } from 'fp-ts';
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { pipe } from 'fp-ts/lib/pipeable';
import { unknown, record, string } from 'io-ts';

export interface HealthControllerController<F> {
	readonly health: () => HKT<F, { [key: string]: unknown }>;
}

export interface HealthControllerController1<F extends URIS> {
	readonly health: () => Kind<F, { [key: string]: unknown }>;
}

export interface HealthControllerController2<F extends URIS2> {
	readonly health: () => Kind2<F, Error, { [key: string]: unknown }>;
}

export function healthControllerController<F extends URIS2>(e: {
	httpClient: HTTPClient2<F>;
}): HealthControllerController2<F>;
export function healthControllerController<F extends URIS>(e: {
	httpClient: HTTPClient1<F>;
}): HealthControllerController1<F>;
export function healthControllerController<F>(e: { httpClient: HTTPClient<F> }): HealthControllerController<F>;
export function healthControllerController<F>(e: { httpClient: HTTPClient<F> }): HealthControllerController<F> {
	return {
		health: () => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/v1/health`,
					method: 'GET',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						record(string, unknown).decode(value),
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
