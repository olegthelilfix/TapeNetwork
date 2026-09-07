import { Option } from 'fp-ts/lib/Option';
import { string, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type SitemapEntry = { loc: Option<string>; lastmod: Option<string> };
export const SitemapEntryIO = type(
	{ loc: optionFromNullable(string), lastmod: optionFromNullable(string) },
	'SitemapEntry',
);
