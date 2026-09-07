import { ArticleDtoV1, ArticleDtoV1IO } from '../../components/schemas/ArticleDtoV1';
import { Option } from 'fp-ts/lib/Option';
import { array, Int, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type PagedResponseArticleDtoV1 = {
	items: Option<Array<ArticleDtoV1>>;
	page: Option<Int>;
	size: Option<Int>;
	total: Option<Int>;
	totalPages: Option<Int>;
};
export const PagedResponseArticleDtoV1IO = type(
	{
		items: optionFromNullable(array(ArticleDtoV1IO)),
		page: optionFromNullable(Int),
		size: optionFromNullable(Int),
		total: optionFromNullable(Int),
		totalPages: optionFromNullable(Int),
	},
	'PagedResponseArticleDtoV1',
);
