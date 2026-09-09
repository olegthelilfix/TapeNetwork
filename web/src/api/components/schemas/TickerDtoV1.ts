import { Option } from 'fp-ts/lib/Option';
import { string, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type TickerDtoV1 = {
	symbol: Option<string>;
	price: Option<string>;
	change: Option<string>;
	direction: Option<string>;
};
export const TickerDtoV1IO = type(
	{
		symbol: optionFromNullable(string),
		price: optionFromNullable(string),
		change: optionFromNullable(string),
		direction: optionFromNullable(string),
	},
	'TickerDtoV1',
);
