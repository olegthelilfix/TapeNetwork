import { Option } from 'fp-ts/lib/Option';
import { string, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type HostDtoV1 = { initials: Option<string>; name: Option<string>; role: Option<string> };
export const HostDtoV1IO = type(
	{ initials: optionFromNullable(string), name: optionFromNullable(string), role: optionFromNullable(string) },
	'HostDtoV1',
);
