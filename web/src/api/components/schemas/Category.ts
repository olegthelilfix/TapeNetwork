import { Subcategory, SubcategoryIO } from '../../components/schemas/Subcategory';
import { Option } from 'fp-ts/lib/Option';
import { Int, string, boolean, array, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type Category = {
	id: Option<Int>;
	slug: Option<string>;
	name: Option<string>;
	blurb: Option<string>;
	coverMediaId: Option<Int>;
	imageUrl: Option<string>;
	sort: Option<Int>;
	published: Option<boolean>;
	subcategoryCount: Option<Int>;
	videoCount: Option<Int>;
	subNames: Option<Array<string>>;
	subcategories: Option<Array<Subcategory>>;
};
export const CategoryIO = type(
	{
		id: optionFromNullable(Int),
		slug: optionFromNullable(string),
		name: optionFromNullable(string),
		blurb: optionFromNullable(string),
		coverMediaId: optionFromNullable(Int),
		imageUrl: optionFromNullable(string),
		sort: optionFromNullable(Int),
		published: optionFromNullable(boolean),
		subcategoryCount: optionFromNullable(Int),
		videoCount: optionFromNullable(Int),
		subNames: optionFromNullable(array(string)),
		subcategories: optionFromNullable(array(SubcategoryIO)),
	},
	'Category',
);
