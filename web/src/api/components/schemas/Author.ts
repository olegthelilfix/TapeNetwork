import { Option } from 'fp-ts/lib/Option';
import { Int, string, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type Author = {
	id: Option<Int>;
	name: Option<string>;
	bio: Option<string>;
	avatarMediaId: Option<Int>;
	imageUrl: Option<string>;
};
export const AuthorIO = type(
	{
		id: optionFromNullable(Int),
		name: optionFromNullable(string),
		bio: optionFromNullable(string),
		avatarMediaId: optionFromNullable(Int),
		imageUrl: optionFromNullable(string),
	},
	'Author',
);
