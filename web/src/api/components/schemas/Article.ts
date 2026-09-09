import { Option } from 'fp-ts/lib/Option';
import { Int, string, array, boolean, type } from 'io-ts';
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type Article = {
	id: Option<Int>;
	slug: Option<string>;
	categoryId: Option<Int>;
	categoryName: Option<string>;
	categorySlug: Option<string>;
	authorId: Option<Int>;
	authorName: Option<string>;
	title: Option<string>;
	dek: Option<string>;
	body: Option<Array<string>>;
	readMinutes: Option<Int>;
	heroMediaId: Option<Int>;
	imageUrl: Option<string>;
	publishedAt: Option<Date>;
	published: Option<boolean>;
	featured: Option<boolean>;
	createdAt: Option<Date>;
	updatedAt: Option<Date>;
};
export const ArticleIO = type(
	{
		id: optionFromNullable(Int),
		slug: optionFromNullable(string),
		categoryId: optionFromNullable(Int),
		categoryName: optionFromNullable(string),
		categorySlug: optionFromNullable(string),
		authorId: optionFromNullable(Int),
		authorName: optionFromNullable(string),
		title: optionFromNullable(string),
		dek: optionFromNullable(string),
		body: optionFromNullable(array(string)),
		readMinutes: optionFromNullable(Int),
		heroMediaId: optionFromNullable(Int),
		imageUrl: optionFromNullable(string),
		publishedAt: optionFromNullable(DateFromISOString),
		published: optionFromNullable(boolean),
		featured: optionFromNullable(boolean),
		createdAt: optionFromNullable(DateFromISOString),
		updatedAt: optionFromNullable(DateFromISOString),
	},
	'Article',
);
