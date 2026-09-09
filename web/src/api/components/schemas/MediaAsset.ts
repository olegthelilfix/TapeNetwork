import { Option } from 'fp-ts/lib/Option';
import { Int, string, type } from 'io-ts';
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type MediaAsset = {
	id: Option<Int>;
	filename: Option<string>;
	url: Option<string>;
	mime: Option<string>;
	kind: Option<string>;
	width: Option<Int>;
	height: Option<Int>;
	createdAt: Option<Date>;
};
export const MediaAssetIO = type(
	{
		id: optionFromNullable(Int),
		filename: optionFromNullable(string),
		url: optionFromNullable(string),
		mime: optionFromNullable(string),
		kind: optionFromNullable(string),
		width: optionFromNullable(Int),
		height: optionFromNullable(Int),
		createdAt: optionFromNullable(DateFromISOString),
	},
	'MediaAsset',
);
