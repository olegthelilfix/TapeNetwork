import { ResponseValidationError, HTTPClient, HTTPClient1, HTTPClient2 } from '../client/client';
import { ScheduleItemDtoV1, ScheduleItemDtoV1IO } from '../components/schemas/ScheduleItemDtoV1';
import { getResponseTypeFromMediaType } from '../utils/utils';
import { either } from 'fp-ts';
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { pipe } from 'fp-ts/lib/pipeable';
import { array } from 'io-ts';

export interface ScheduleControllerController<F> {
	readonly list_2: () => HKT<F, Array<ScheduleItemDtoV1>>;
}

export interface ScheduleControllerController1<F extends URIS> {
	readonly list_2: () => Kind<F, Array<ScheduleItemDtoV1>>;
}

export interface ScheduleControllerController2<F extends URIS2> {
	readonly list_2: () => Kind2<F, Error, Array<ScheduleItemDtoV1>>;
}

export function scheduleControllerController<F extends URIS2>(e: {
	httpClient: HTTPClient2<F>;
}): ScheduleControllerController2<F>;
export function scheduleControllerController<F extends URIS>(e: {
	httpClient: HTTPClient1<F>;
}): ScheduleControllerController1<F>;
export function scheduleControllerController<F>(e: { httpClient: HTTPClient<F> }): ScheduleControllerController<F>;
export function scheduleControllerController<F>(e: { httpClient: HTTPClient<F> }): ScheduleControllerController<F> {
	return {
		list_2: () => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/v1/schedule`,
					method: 'GET',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						array(ScheduleItemDtoV1IO).decode(value),
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
