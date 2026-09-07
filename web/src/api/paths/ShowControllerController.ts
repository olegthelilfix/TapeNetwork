import { ResponseValidationError, HTTPClient, HTTPClient1, HTTPClient2 } from '../client/client';
import { ShowDetailDtoV1, ShowDetailDtoV1IO } from '../components/schemas/ShowDetailDtoV1';
import { ShowSummaryDtoV1, ShowSummaryDtoV1IO } from '../components/schemas/ShowSummaryDtoV1';
import { getResponseTypeFromMediaType } from '../utils/utils';
import { either } from 'fp-ts';
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { pipe } from 'fp-ts/lib/pipeable';
import { array, string } from 'io-ts';

export interface ShowControllerController<F> {
	readonly list_1: () => HKT<F, Array<ShowSummaryDtoV1>>;

	readonly bySlug: (slug: string) => HKT<F, ShowDetailDtoV1>;
}

export interface ShowControllerController1<F extends URIS> {
	readonly list_1: () => Kind<F, Array<ShowSummaryDtoV1>>;

	readonly bySlug: (slug: string) => Kind<F, ShowDetailDtoV1>;
}

export interface ShowControllerController2<F extends URIS2> {
	readonly list_1: () => Kind2<F, Error, Array<ShowSummaryDtoV1>>;

	readonly bySlug: (slug: string) => Kind2<F, Error, ShowDetailDtoV1>;
}

export function showControllerController<F extends URIS2>(e: {
	httpClient: HTTPClient2<F>;
}): ShowControllerController2<F>;
export function showControllerController<F extends URIS>(e: {
	httpClient: HTTPClient1<F>;
}): ShowControllerController1<F>;
export function showControllerController<F>(e: { httpClient: HTTPClient<F> }): ShowControllerController<F>;
export function showControllerController<F>(e: { httpClient: HTTPClient<F> }): ShowControllerController<F> {
	return {
		list_1: () => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/v1/shows`,
					method: 'GET',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						array(ShowSummaryDtoV1IO).decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		bySlug: slug => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/v1/shows/${encodeURIComponent(string.encode(slug).toString())}`,
					method: 'GET',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						ShowDetailDtoV1IO.decode(value),
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
