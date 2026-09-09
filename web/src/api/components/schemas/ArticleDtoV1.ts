import { Option } from 'fp-ts/lib/Option';
import { string, array, Int, type } from 'io-ts';
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type ArticleDtoV1 = {
	slug: Option<string>;
	category: Option<string>;
	title: Option<string>;
	dek: Option<string>;
	author: Option<string>;
	body: Option<Array<string>>;
	readMinutes: Option<Int>;
	imageUrl: Option<string>;
	publishedAt: Option<Date>;
};
export const ArticleDtoV1IO = type(
	{
		slug: optionFromNullable(string),
		category: optionFromNullable(string),
		title: optionFromNullable(string),
		dek: optionFromNullable(string),
		author: optionFromNullable(string),
		body: optionFromNullable(array(string)),
		readMinutes: optionFromNullable(Int),
		imageUrl: optionFromNullable(string),
		publishedAt: optionFromNullable(DateFromISOString),
	},
	'ArticleDtoV1',
);
