import { Episode, EpisodeIO } from '../../components/schemas/Episode';
import { Host, HostIO } from '../../components/schemas/Host';
import { Option } from 'fp-ts/lib/Option';
import { Int, string, boolean, array, type } from 'io-ts';
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type Show = {
	id: Option<Int>;
	slug: Option<string>;
	name: Option<string>;
	tagline: Option<string>;
	blurb: Option<string>;
	description: Option<string>;
	scheduleSlot: Option<string>;
	episodesCount: Option<Int>;
	hoursPerWeek: Option<string>;
	monthlyViews: Option<string>;
	coverMediaId: Option<Int>;
	imageUrl: Option<string>;
	sort: Option<Int>;
	published: Option<boolean>;
	createdAt: Option<Date>;
	updatedAt: Option<Date>;
	hosts: Option<Array<Host>>;
	episodes: Option<Array<Episode>>;
};
export const ShowIO = type(
	{
		id: optionFromNullable(Int),
		slug: optionFromNullable(string),
		name: optionFromNullable(string),
		tagline: optionFromNullable(string),
		blurb: optionFromNullable(string),
		description: optionFromNullable(string),
		scheduleSlot: optionFromNullable(string),
		episodesCount: optionFromNullable(Int),
		hoursPerWeek: optionFromNullable(string),
		monthlyViews: optionFromNullable(string),
		coverMediaId: optionFromNullable(Int),
		imageUrl: optionFromNullable(string),
		sort: optionFromNullable(Int),
		published: optionFromNullable(boolean),
		createdAt: optionFromNullable(DateFromISOString),
		updatedAt: optionFromNullable(DateFromISOString),
		hosts: optionFromNullable(array(HostIO)),
		episodes: optionFromNullable(array(EpisodeIO)),
	},
	'Show',
);
