import { VideoDtoV1, VideoDtoV1IO } from '../../components/schemas/VideoDtoV1';
import { Option } from 'fp-ts/lib/Option';
import { string, array, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type SubcategoryDetailDtoV1 = {
	slug: Option<string>;
	name: Option<string>;
	blurb: Option<string>;
	categorySlug: Option<string>;
	categoryName: Option<string>;
	videos: Option<Array<VideoDtoV1>>;
};
export const SubcategoryDetailDtoV1IO = type(
	{
		slug: optionFromNullable(string),
		name: optionFromNullable(string),
		blurb: optionFromNullable(string),
		categorySlug: optionFromNullable(string),
		categoryName: optionFromNullable(string),
		videos: optionFromNullable(array(VideoDtoV1IO)),
	},
	'SubcategoryDetailDtoV1',
);
