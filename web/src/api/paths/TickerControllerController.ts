import { ResponseValidationError, HTTPClient, HTTPClient1, HTTPClient2 } from '../client/client';
import { TickerDtoV1, TickerDtoV1IO } from '../components/schemas/TickerDtoV1';
import { getResponseTypeFromMediaType } from '../utils/utils';
import { either } from 'fp-ts';
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { pipe } from 'fp-ts/lib/pipeable';
import { array } from 'io-ts';

export interface TickerControllerController<F> {
	readonly list: () => HKT<F, Array<TickerDtoV1>>;
}

export interface TickerControllerController1<F extends URIS> {
	readonly list: () => Kind<F, Array<TickerDtoV1>>;
}

export interface TickerControllerController2<F extends URIS2> {
	readonly list: () => Kind2<F, Error, Array<TickerDtoV1>>;
}

export function tickerControllerController<F extends URIS2>(e: {
	httpClient: HTTPClient2<F>;
}): TickerControllerController2<F>;
export function tickerControllerController<F extends URIS>(e: {
	httpClient: HTTPClient1<F>;
}): TickerControllerController1<F>;
export function tickerControllerController<F>(e: { httpClient: HTTPClient<F> }): TickerControllerController<F>;
export function tickerControllerController<F>(e: { httpClient: HTTPClient<F> }): TickerControllerController<F> {
	return {
		list: () => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/v1/ticker`,
					method: 'GET',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						array(TickerDtoV1IO).decode(value),
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
