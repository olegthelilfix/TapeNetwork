import { EpisodeDtoV1, EpisodeDtoV1IO } from '../../components/schemas/EpisodeDtoV1';
import { HostDtoV1, HostDtoV1IO } from '../../components/schemas/HostDtoV1';
import { Option } from 'fp-ts/lib/Option';
import { string, Int, array, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type ShowDetailDtoV1 = {
	slug: Option<string>;
	name: Option<string>;
	tagline: Option<string>;
	blurb: Option<string>;
	description: Option<string>;
	scheduleSlot: Option<string>;
	episodesCount: Option<Int>;
	hoursPerWeek: Option<string>;
	monthlyViews: Option<string>;
	imageUrl: Option<string>;
	hosts: Option<Array<HostDtoV1>>;
	episodes: Option<Array<EpisodeDtoV1>>;
};
export const ShowDetailDtoV1IO = type(
	{
		slug: optionFromNullable(string),
		name: optionFromNullable(string),
		tagline: optionFromNullable(string),
		blurb: optionFromNullable(string),
		description: optionFromNullable(string),
		scheduleSlot: optionFromNullable(string),
		episodesCount: optionFromNullable(Int),
		hoursPerWeek: optionFromNullable(string),
		monthlyViews: optionFromNullable(string),
		imageUrl: optionFromNullable(string),
		hosts: optionFromNullable(array(HostDtoV1IO)),
		episodes: optionFromNullable(array(EpisodeDtoV1IO)),
	},
	'ShowDetailDtoV1',
);
