import { Option } from 'fp-ts/lib/Option';
import { string, boolean, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type HomeCardDtoV1 = {
	refType: Option<string>;
	slug: Option<string>;
	title: Option<string>;
	subtitle: Option<string>;
	durationLabel: Option<string>;
	imageUrl: Option<string>;
	live: Option<boolean>;
	views: Option<string>;
};
export const HomeCardDtoV1IO = type(
	{
		refType: optionFromNullable(string),
		slug: optionFromNullable(string),
		title: optionFromNullable(string),
		subtitle: optionFromNullable(string),
		durationLabel: optionFromNullable(string),
		imageUrl: optionFromNullable(string),
		live: optionFromNullable(boolean),
		views: optionFromNullable(string),
	},
	'HomeCardDtoV1',
);
