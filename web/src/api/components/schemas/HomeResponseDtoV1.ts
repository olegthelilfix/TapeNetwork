import { ArticleDtoV1, ArticleDtoV1IO } from '../../components/schemas/ArticleDtoV1';
import { HomeCardDtoV1, HomeCardDtoV1IO } from '../../components/schemas/HomeCardDtoV1';
import { ScheduleItemDtoV1, ScheduleItemDtoV1IO } from '../../components/schemas/ScheduleItemDtoV1';
import { TickerDtoV1, TickerDtoV1IO } from '../../components/schemas/TickerDtoV1';
import { Option } from 'fp-ts/lib/Option';
import { array, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type HomeResponseDtoV1 = {
	liveNow: Option<HomeCardDtoV1>;
	featured: Option<Array<HomeCardDtoV1>>;
	mostWatched: Option<Array<HomeCardDtoV1>>;
	upNext: Option<Array<HomeCardDtoV1>>;
	ticker: Option<Array<TickerDtoV1>>;
	schedule: Option<Array<ScheduleItemDtoV1>>;
	latestArticles: Option<Array<ArticleDtoV1>>;
};
export const HomeResponseDtoV1IO = type(
	{
		liveNow: optionFromNullable(HomeCardDtoV1IO),
		featured: optionFromNullable(array(HomeCardDtoV1IO)),
		mostWatched: optionFromNullable(array(HomeCardDtoV1IO)),
		upNext: optionFromNullable(array(HomeCardDtoV1IO)),
		ticker: optionFromNullable(array(TickerDtoV1IO)),
		schedule: optionFromNullable(array(ScheduleItemDtoV1IO)),
		latestArticles: optionFromNullable(array(ArticleDtoV1IO)),
	},
	'HomeResponseDtoV1',
);
