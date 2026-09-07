import { Option } from 'fp-ts/lib/Option';
import { Int, string, boolean, array, type } from 'io-ts';
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type Episode = {
	id: Option<Int>;
	showId: Option<Int>;
	showName: Option<string>;
	showSlug: Option<string>;
	slug: Option<string>;
	epNo: Option<string>;
	title: Option<string>;
	description: Option<string>;
	publishedAt: Option<Date>;
	durationSec: Option<Int>;
	views: Option<string>;
	videoUrl: Option<string>;
	thumbMediaId: Option<Int>;
	imageUrl: Option<string>;
	live: Option<boolean>;
	tags: Option<Array<string>>;
	published: Option<boolean>;
	createdAt: Option<Date>;
	updatedAt: Option<Date>;
};
export const EpisodeIO = type(
	{
		id: optionFromNullable(Int),
		showId: optionFromNullable(Int),
		showName: optionFromNullable(string),
		showSlug: optionFromNullable(string),
		slug: optionFromNullable(string),
		epNo: optionFromNullable(string),
		title: optionFromNullable(string),
		description: optionFromNullable(string),
		publishedAt: optionFromNullable(DateFromISOString),
		durationSec: optionFromNullable(Int),
		views: optionFromNullable(string),
		videoUrl: optionFromNullable(string),
		thumbMediaId: optionFromNullable(Int),
		imageUrl: optionFromNullable(string),
		live: optionFromNullable(boolean),
		tags: optionFromNullable(array(string)),
		published: optionFromNullable(boolean),
		createdAt: optionFromNullable(DateFromISOString),
		updatedAt: optionFromNullable(DateFromISOString),
	},
	'Episode',
);
