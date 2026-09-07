import { ResponseValidationError, HTTPClient, HTTPClient1, HTTPClient2 } from '../client/client';
import { LoginRequest, LoginRequestIO } from '../components/schemas/LoginRequest';
import { getResponseTypeFromMediaType } from '../utils/utils';
import { either } from 'fp-ts';
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { pipe } from 'fp-ts/lib/pipeable';
import { unknown } from 'io-ts';

export interface AuthControllerController<F> {
	readonly login: (parameters: { body: LoginRequest }) => HKT<F, unknown>;

	readonly me: () => HKT<F, unknown>;
}

export interface AuthControllerController1<F extends URIS> {
	readonly login: (parameters: { body: LoginRequest }) => Kind<F, unknown>;

	readonly me: () => Kind<F, unknown>;
}

export interface AuthControllerController2<F extends URIS2> {
	readonly login: (parameters: { body: LoginRequest }) => Kind2<F, Error, unknown>;

	readonly me: () => Kind2<F, Error, unknown>;
}

export function authControllerController<F extends URIS2>(e: {
	httpClient: HTTPClient2<F>;
}): AuthControllerController2<F>;
export function authControllerController<F extends URIS>(e: {
	httpClient: HTTPClient1<F>;
}): AuthControllerController1<F>;
export function authControllerController<F>(e: { httpClient: HTTPClient<F> }): AuthControllerController<F>;
export function authControllerController<F>(e: { httpClient: HTTPClient<F> }): AuthControllerController<F> {
	return {
		login: parameters => {
			const body = LoginRequestIO.encode(parameters.body);

			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
				'Content-type': 'application/json',
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/auth/login`,
					method: 'POST',
					responseType,

					body,
					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						unknown.decode(value),
						either.mapLeft(ResponseValidationError.create),
						either.fold(
							error => e.httpClient.throwError(error),
							decoded => e.httpClient.of(decoded),
						),
					),
			);
		},

		me: () => {
			const accept = '*/*';

			const responseType = getResponseTypeFromMediaType(accept);
			const requestHeaders = {
				Accept: accept,
			};

			return e.httpClient.chain(
				e.httpClient.request({
					url: `/api/admin/auth/me`,
					method: 'GET',
					responseType,

					headers: { ...requestHeaders },
				}),
				value =>
					pipe(
						unknown.decode(value),
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
