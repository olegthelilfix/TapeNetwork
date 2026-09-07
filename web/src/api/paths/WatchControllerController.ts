import { ResponseValidationError, HTTPClient, HTTPClient1, HTTPClient2 } from '../client/client';
import { PlayerDtoV1, PlayerDtoV1IO } from '../components/schemas/PlayerDtoV1';
import { getResponseTypeFromMediaType } from '../utils/utils';
import { either } from 'fp-ts';
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { pipe } from 'fp-ts/lib/pipeable';
import { string } from 'io-ts';

export interface WatchControllerController<F> {
	readonly watch: (slug: string) => HKT<F, PlayerDtoV1>;
}

export interface WatchControllerController1<F extends URIS> {
	readonly watch: (slug: string) => Kind<F, PlayerDtoV1>;
}

export interface WatchControllerController2<F extends URIS2> {
	readonly watch: (slug: string) => Kind2<F, Error, PlayerDtoV1>;
}

export function watchControllerController<F extends URIS2>(e: {
	httpClient: HTTPClient2<F>;
}): WatchControllerController2<F>;
export function watchControllerController<F extends URIS>(e: {
	httpClient: HTTPClient1<F>;
}): WatchControllerController1<F>;
export function watchControllerController<F>(e: { httpClient: HTTPClient<F> }): WatchControllerController<F>;
export function watchControllerController<F>(e: { httpClient: HTTPClient<F> }): WatchControllerController<F> {
	return {
		watch: slug => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/v1/watch/${encodeURIComponent(string.encode(slug).toString())}`,
					method: 'GET',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						PlayerDtoV1IO.decode(value),
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
