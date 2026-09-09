import { ResponseValidationError, HTTPClient, HTTPClient1, HTTPClient2 } from '../client/client';
import { SitemapEntry, SitemapEntryIO } from '../components/schemas/SitemapEntry';
import { getResponseTypeFromMediaType } from '../utils/utils';
import { either } from 'fp-ts';
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { pipe } from 'fp-ts/lib/pipeable';
import { array } from 'io-ts';

export interface SitemapControllerController<F> {
	readonly entries: () => HKT<F, Array<SitemapEntry>>;
}

export interface SitemapControllerController1<F extends URIS> {
	readonly entries: () => Kind<F, Array<SitemapEntry>>;
}

export interface SitemapControllerController2<F extends URIS2> {
	readonly entries: () => Kind2<F, Error, Array<SitemapEntry>>;
}

export function sitemapControllerController<F extends URIS2>(e: {
	httpClient: HTTPClient2<F>;
}): SitemapControllerController2<F>;
export function sitemapControllerController<F extends URIS>(e: {
	httpClient: HTTPClient1<F>;
}): SitemapControllerController1<F>;
export function sitemapControllerController<F>(e: { httpClient: HTTPClient<F> }): SitemapControllerController<F>;
export function sitemapControllerController<F>(e: { httpClient: HTTPClient<F> }): SitemapControllerController<F> {
	return {
		entries: () => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/v1/sitemap-data`,
					method: 'GET',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						array(SitemapEntryIO).decode(value),
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
