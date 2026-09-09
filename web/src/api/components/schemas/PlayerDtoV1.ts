import { Option } from 'fp-ts/lib/Option';
import { string, boolean, array, type } from 'io-ts';
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type PlayerDtoV1 = {
	kind: Option<string>;
	slug: Option<string>;
	title: Option<string>;
	description: Option<string>;
	showName: Option<string>;
	showSlug: Option<string>;
	durationLabel: Option<string>;
	imageUrl: Option<string>;
	live: Option<boolean>;
	tags: Option<Array<string>>;
	publishedAt: Option<Date>;
	videoUrl: Option<string>;
};
export const PlayerDtoV1IO = type(
	{
		kind: optionFromNullable(string),
		slug: optionFromNullable(string),
		title: optionFromNullable(string),
		description: optionFromNullable(string),
		showName: optionFromNullable(string),
		showSlug: optionFromNullable(string),
		durationLabel: optionFromNullable(string),
		imageUrl: optionFromNullable(string),
		live: optionFromNullable(boolean),
		tags: optionFromNullable(array(string)),
		publishedAt: optionFromNullable(DateFromISOString),
		videoUrl: optionFromNullable(string),
	},
	'PlayerDtoV1',
);
