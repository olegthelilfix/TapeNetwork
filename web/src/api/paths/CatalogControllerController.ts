import { ResponseValidationError, HTTPClient, HTTPClient1, HTTPClient2 } from '../client/client';
import { CategoryDetailDtoV1, CategoryDetailDtoV1IO } from '../components/schemas/CategoryDetailDtoV1';
import { CategorySummaryDtoV1, CategorySummaryDtoV1IO } from '../components/schemas/CategorySummaryDtoV1';
import { SubcategoryDetailDtoV1, SubcategoryDetailDtoV1IO } from '../components/schemas/SubcategoryDetailDtoV1';
import { VideoDtoV1, VideoDtoV1IO } from '../components/schemas/VideoDtoV1';
import { getResponseTypeFromMediaType } from '../utils/utils';
import { either } from 'fp-ts';
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { pipe } from 'fp-ts/lib/pipeable';
import { string, array } from 'io-ts';

export interface CatalogControllerController<F> {
	readonly video: (slug: string) => HKT<F, VideoDtoV1>;

	readonly subcategory: (slug: string) => HKT<F, SubcategoryDetailDtoV1>;

	readonly categories: () => HKT<F, Array<CategorySummaryDtoV1>>;

	readonly category: (slug: string) => HKT<F, CategoryDetailDtoV1>;
}

export interface CatalogControllerController1<F extends URIS> {
	readonly video: (slug: string) => Kind<F, VideoDtoV1>;

	readonly subcategory: (slug: string) => Kind<F, SubcategoryDetailDtoV1>;

	readonly categories: () => Kind<F, Array<CategorySummaryDtoV1>>;

	readonly category: (slug: string) => Kind<F, CategoryDetailDtoV1>;
}

export interface CatalogControllerController2<F extends URIS2> {
	readonly video: (slug: string) => Kind2<F, Error, VideoDtoV1>;

	readonly subcategory: (slug: string) => Kind2<F, Error, SubcategoryDetailDtoV1>;

	readonly categories: () => Kind2<F, Error, Array<CategorySummaryDtoV1>>;

	readonly category: (slug: string) => Kind2<F, Error, CategoryDetailDtoV1>;
}

export function catalogControllerController<F extends URIS2>(e: {
	httpClient: HTTPClient2<F>;
}): CatalogControllerController2<F>;
export function catalogControllerController<F extends URIS>(e: {
	httpClient: HTTPClient1<F>;
}): CatalogControllerController1<F>;
export function catalogControllerController<F>(e: { httpClient: HTTPClient<F> }): CatalogControllerController<F>;
export function catalogControllerController<F>(e: { httpClient: HTTPClient<F> }): CatalogControllerController<F> {
	return {
		video: slug => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/v1/on-demand/videos/${encodeURIComponent(string.encode(slug).toString())}`,
					method: 'GET',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						VideoDtoV1IO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		subcategory: slug => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/v1/on-demand/subcategories/${encodeURIComponent(string.encode(slug).toString())}`,
					method: 'GET',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						SubcategoryDetailDtoV1IO.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		categories: () => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/v1/on-demand/categories`,
					method: 'GET',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						array(CategorySummaryDtoV1IO).decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		category: slug => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/v1/on-demand/categories/${encodeURIComponent(string.encode(slug).toString())}`,
					method: 'GET',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						CategoryDetailDtoV1IO.decode(value),
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
