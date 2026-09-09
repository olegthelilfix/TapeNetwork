import { ResponseValidationError, HTTPClient, HTTPClient1, HTTPClient2 } from '../client/client';
import { MediaAsset, MediaAssetIO } from '../components/schemas/MediaAsset';
import { getResponseTypeFromMediaType, BinaryFromStringIO, Binary } from '../utils/utils';
import { either } from 'fp-ts';
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { Option } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export interface MediaUploadControllerController<F> {
	readonly upload: (parameters: { body: Option<{ file: Binary }> }) => HKT<F, MediaAsset>;
}

export interface MediaUploadControllerController1<F extends URIS> {
	readonly upload: (parameters: { body: Option<{ file: Binary }> }) => Kind<F, MediaAsset>;
}

export interface MediaUploadControllerController2<F extends URIS2> {
	readonly upload: (parameters: { body: Option<{ file: Binary }> }) => Kind2<F, Error, MediaAsset>;
}

export function mediaUploadControllerController<F extends URIS2>(e: {
	httpClient: HTTPClient2<F>;
}): MediaUploadControllerController2<F>;
export function mediaUploadControllerController<F extends URIS>(e: {
	httpClient: HTTPClient1<F>;
}): MediaUploadControllerController1<F>;
export function mediaUploadControllerController<F>(e: {
	httpClient: HTTPClient<F>;
}): MediaUploadControllerController<F>;
export function mediaUploadControllerController<F>(e: {
	httpClient: HTTPClient<F>;
}): MediaUploadControllerController<F> {
	return {
		upload: parameters => {
			const body = optionFromNullable(type({ file: BinaryFromStringIO })).encode(parameters.body);

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
				'Content-type': 'application/json',
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/media/upload`,
					method: 'POST',
					responseType,

					body,
					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						MediaAssetIO.decode(value),
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
