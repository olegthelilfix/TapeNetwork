import { Option } from 'fp-ts/lib/Option';
import { Int, string, boolean, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type ScheduleSlot = {
	id: Option<Int>;
	dayOfWeek: Option<Int>;
	timeEt: Option<string>;
	showId: Option<Int>;
	showName: Option<string>;
	showSlug: Option<string>;
	hostsLabel: Option<string>;
	live: Option<boolean>;
	sort: Option<Int>;
};
export const ScheduleSlotIO = type(
	{
		id: optionFromNullable(Int),
		dayOfWeek: optionFromNullable(Int),
		timeEt: optionFromNullable(string),
		showId: optionFromNullable(Int),
		showName: optionFromNullable(string),
		showSlug: optionFromNullable(string),
		hostsLabel: optionFromNullable(string),
		live: optionFromNullable(boolean),
		sort: optionFromNullable(Int),
	},
	'ScheduleSlot',
);
