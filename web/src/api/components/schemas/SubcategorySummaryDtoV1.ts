import { Option } from 'fp-ts/lib/Option';
import { string, Int, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type SubcategorySummaryDtoV1 = {
	slug: Option<string>;
	name: Option<string>;
	blurb: Option<string>;
	imageUrl: Option<string>;
	videoCount: Option<Int>;
};
export const SubcategorySummaryDtoV1IO = type(
	{
		slug: optionFromNullable(string),
		name: optionFromNullable(string),
		blurb: optionFromNullable(string),
		imageUrl: optionFromNullable(string),
		videoCount: optionFromNullable(Int),
	},
	'SubcategorySummaryDtoV1',
);
