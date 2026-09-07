import { Option } from 'fp-ts/lib/Option';
import { string, Int, array, type } from 'io-ts';
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type VideoDtoV1 = {
	slug: Option<string>;
	title: Option<string>;
	description: Option<string>;
	publishedAt: Option<Date>;
	durationSec: Option<Int>;
	durationLabel: Option<string>;
	showName: Option<string>;
	categoryName: Option<string>;
	tags: Option<Array<string>>;
	imageUrl: Option<string>;
};
export const VideoDtoV1IO = type(
	{
		slug: optionFromNullable(string),
		title: optionFromNullable(string),
		description: optionFromNullable(string),
		publishedAt: optionFromNullable(DateFromISOString),
		durationSec: optionFromNullable(Int),
		durationLabel: optionFromNullable(string),
		showName: optionFromNullable(string),
		categoryName: optionFromNullable(string),
		tags: optionFromNullable(array(string)),
		imageUrl: optionFromNullable(string),
	},
	'VideoDtoV1',
);
