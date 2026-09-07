import { Option } from 'fp-ts/lib/Option';
import { Int, string, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type HomeBlock = {
	id: Option<Int>;
	type: Option<string>;
	refType: Option<string>;
	refId: Option<Int>;
	label: Option<string>;
	sort: Option<Int>;
};
export const HomeBlockIO = type(
	{
		id: optionFromNullable(Int),
		type: optionFromNullable(string),
		refType: optionFromNullable(string),
		refId: optionFromNullable(Int),
		label: optionFromNullable(string),
		sort: optionFromNullable(Int),
	},
	'HomeBlock',
);
