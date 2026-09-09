import { Option } from 'fp-ts/lib/Option';
import { string, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type SearchHit = {
	type: Option<string>;
	slug: Option<string>;
	title: Option<string>;
	subtitle: Option<string>;
	imageUrl: Option<string>;
	url: Option<string>;
};
export const SearchHitIO = type(
	{
		type: optionFromNullable(string),
		slug: optionFromNullable(string),
		title: optionFromNullable(string),
		subtitle: optionFromNullable(string),
		imageUrl: optionFromNullable(string),
		url: optionFromNullable(string),
	},
	'SearchHit',
);
