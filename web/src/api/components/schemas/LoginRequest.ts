import { string, type } from 'io-ts';

export type LoginRequest = { email: string; password: string };
export const LoginRequestIO = type({ email: string, password: string }, 'LoginRequest');
