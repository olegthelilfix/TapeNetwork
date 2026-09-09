import { Option } from 'fp-ts/lib/Option';
import { string, Int, boolean, array, type } from 'io-ts';
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type EpisodeDtoV1 = {
	slug: Option<string>;
	epNo: Option<string>;
	title: Option<string>;
	description: Option<string>;
	publishedAt: Option<Date>;
	durationSec: Option<Int>;
	durationLabel: Option<string>;
	views: Option<string>;
	live: Option<boolean>;
	tags: Option<Array<string>>;
	imageUrl: Option<string>;
};
export const EpisodeDtoV1IO = type(
	{
		slug: optionFromNullable(string),
		epNo: optionFromNullable(string),
		title: optionFromNullable(string),
		description: optionFromNullable(string),
		publishedAt: optionFromNullable(DateFromISOString),
		durationSec: optionFromNullable(Int),
		durationLabel: optionFromNullable(string),
		views: optionFromNullable(string),
		live: optionFromNullable(boolean),
		tags: optionFromNullable(array(string)),
		imageUrl: optionFromNullable(string),
	},
	'EpisodeDtoV1',
);
