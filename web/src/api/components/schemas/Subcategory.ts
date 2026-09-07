import { Video, VideoIO } from '../../components/schemas/Video';
import { Option } from 'fp-ts/lib/Option';
import { Int, string, array, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type Subcategory = {
	id: Option<Int>;
	categoryId: Option<Int>;
	categoryName: Option<string>;
	categorySlug: Option<string>;
	slug: Option<string>;
	name: Option<string>;
	blurb: Option<string>;
	imageUrl: Option<string>;
	sort: Option<Int>;
	videoCount: Option<Int>;
	videos: Option<Array<Video>>;
};
export const SubcategoryIO = type(
	{
		id: optionFromNullable(Int),
		categoryId: optionFromNullable(Int),
		categoryName: optionFromNullable(string),
		categorySlug: optionFromNullable(string),
		slug: optionFromNullable(string),
		name: optionFromNullable(string),
		blurb: optionFromNullable(string),
		imageUrl: optionFromNullable(string),
		sort: optionFromNullable(Int),
		videoCount: optionFromNullable(Int),
		videos: optionFromNullable(array(VideoIO)),
	},
	'Subcategory',
);
