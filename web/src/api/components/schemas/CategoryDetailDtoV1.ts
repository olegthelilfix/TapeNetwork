import { SubcategorySummaryDtoV1, SubcategorySummaryDtoV1IO } from '../../components/schemas/SubcategorySummaryDtoV1';
import { Option } from 'fp-ts/lib/Option';
import { string, array, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type CategoryDetailDtoV1 = {
	slug: Option<string>;
	name: Option<string>;
	blurb: Option<string>;
	subcategories: Option<Array<SubcategorySummaryDtoV1>>;
};
export const CategoryDetailDtoV1IO = type(
	{
		slug: optionFromNullable(string),
		name: optionFromNullable(string),
		blurb: optionFromNullable(string),
		subcategories: optionFromNullable(array(SubcategorySummaryDtoV1IO)),
	},
	'CategoryDetailDtoV1',
);
