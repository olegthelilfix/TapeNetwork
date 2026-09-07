import { Option } from 'fp-ts/lib/Option';
import { Int, string, array, boolean, type } from 'io-ts';
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type Video = {
	id: Option<Int>;
	subcategoryId: Option<Int>;
	showId: Option<Int>;
	showName: Option<string>;
	showSlug: Option<string>;
	categoryName: Option<string>;
	slug: Option<string>;
	title: Option<string>;
	description: Option<string>;
	publishedAt: Option<Date>;
	durationSec: Option<Int>;
	views: Option<string>;
	videoUrl: Option<string>;
	thumbMediaId: Option<Int>;
	imageUrl: Option<string>;
	tags: Option<Array<string>>;
	published: Option<boolean>;
	createdAt: Option<Date>;
	updatedAt: Option<Date>;
};
export const VideoIO = type(
	{
		id: optionFromNullable(Int),
		subcategoryId: optionFromNullable(Int),
		showId: optionFromNullable(Int),
		showName: optionFromNullable(string),
		showSlug: optionFromNullable(string),
		categoryName: optionFromNullable(string),
		slug: optionFromNullable(string),
		title: optionFromNullable(string),
		description: optionFromNullable(string),
		publishedAt: optionFromNullable(DateFromISOString),
		durationSec: optionFromNullable(Int),
		views: optionFromNullable(string),
		videoUrl: optionFromNullable(string),
		thumbMediaId: optionFromNullable(Int),
		imageUrl: optionFromNullable(string),
		tags: optionFromNullable(array(string)),
		published: optionFromNullable(boolean),
		createdAt: optionFromNullable(DateFromISOString),
		updatedAt: optionFromNullable(DateFromISOString),
	},
	'Video',
);
