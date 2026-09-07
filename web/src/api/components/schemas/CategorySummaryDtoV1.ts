import { Option } from 'fp-ts/lib/Option';
import { string, Int, array, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type CategorySummaryDtoV1 = {
	slug: Option<string>;
	name: Option<string>;
	blurb: Option<string>;
	imageUrl: Option<string>;
	subcategoryCount: Option<Int>;
	videoCount: Option<Int>;
	subNames: Option<Array<string>>;
};
export const CategorySummaryDtoV1IO = type(
	{
		slug: optionFromNullable(string),
		name: optionFromNullable(string),
		blurb: optionFromNullable(string),
		imageUrl: optionFromNullable(string),
		subcategoryCount: optionFromNullable(Int),
		videoCount: optionFromNullable(Int),
		subNames: optionFromNullable(array(string)),
	},
	'CategorySummaryDtoV1',
);
