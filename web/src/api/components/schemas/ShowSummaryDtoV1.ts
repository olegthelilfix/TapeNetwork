import { Option } from 'fp-ts/lib/Option';
import { string, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type ShowSummaryDtoV1 = {
	slug: Option<string>;
	name: Option<string>;
	tagline: Option<string>;
	blurb: Option<string>;
	scheduleSlot: Option<string>;
	imageUrl: Option<string>;
};
export const ShowSummaryDtoV1IO = type(
	{
		slug: optionFromNullable(string),
		name: optionFromNullable(string),
		tagline: optionFromNullable(string),
		blurb: optionFromNullable(string),
		scheduleSlot: optionFromNullable(string),
		imageUrl: optionFromNullable(string),
	},
	'ShowSummaryDtoV1',
);
