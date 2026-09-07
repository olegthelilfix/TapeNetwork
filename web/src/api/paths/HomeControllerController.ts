import { ResponseValidationError, HTTPClient, HTTPClient1, HTTPClient2 } from '../client/client';
import { HomeResponseDtoV1, HomeResponseDtoV1IO } from '../components/schemas/HomeResponseDtoV1';
import { getResponseTypeFromMediaType } from '../utils/utils';
import { either } from 'fp-ts';
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { pipe } from 'fp-ts/lib/pipeable';

export interface HomeControllerController<F> {
	readonly home: () => HKT<F, HomeResponseDtoV1>;
}

export interface HomeControllerController1<F extends URIS> {
	readonly home: () => Kind<F, HomeResponseDtoV1>;
}

export interface HomeControllerController2<F extends URIS2> {
	readonly home: () => Kind2<F, Error, HomeResponseDtoV1>;
}

export function homeControllerController<F extends URIS2>(e: {
	httpClient: HTTPClient2<F>;
}): HomeControllerController2<F>;
export function homeControllerController<F extends URIS>(e: {
	httpClient: HTTPClient1<F>;
}): HomeControllerController1<F>;
export function homeControllerController<F>(e: { httpClient: HTTPClient<F> }): HomeControllerController<F>;
export function homeControllerController<F>(e: { httpClient: HTTPClient<F> }): HomeControllerController<F> {
	return {
		home: () => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/v1/home`,
					method: 'GET',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						HomeResponseDtoV1IO.decode(value),
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
