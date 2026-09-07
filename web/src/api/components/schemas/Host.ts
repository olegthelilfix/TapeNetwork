import { Option } from 'fp-ts/lib/Option';
import { Int, string, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type Host = {
	id: Option<Int>;
	showId: Option<Int>;
	initials: Option<string>;
	name: Option<string>;
	role: Option<string>;
	sort: Option<Int>;
};
export const HostIO = type(
	{
		id: optionFromNullable(Int),
		showId: optionFromNullable(Int),
		initials: optionFromNullable(string),
		name: optionFromNullable(string),
		role: optionFromNullable(string),
		sort: optionFromNullable(Int),
	},
	'Host',
);
