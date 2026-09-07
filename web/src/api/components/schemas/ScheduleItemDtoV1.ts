import { Option } from 'fp-ts/lib/Option';
import { string, boolean, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type ScheduleItemDtoV1 = {
	timeEt: Option<string>;
	showName: Option<string>;
	showSlug: Option<string>;
	hostsLabel: Option<string>;
	live: Option<boolean>;
};
export const ScheduleItemDtoV1IO = type(
	{
		timeEt: optionFromNullable(string),
		showName: optionFromNullable(string),
		showSlug: optionFromNullable(string),
		hostsLabel: optionFromNullable(string),
		live: optionFromNullable(boolean),
	},
	'ScheduleItemDtoV1',
);
