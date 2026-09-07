import { Option } from 'fp-ts/lib/Option';
import { Int, string, type } from 'io-ts';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';

export type TickerQuote = {
	id: Option<Int>;
	symbol: Option<string>;
	price: Option<string>;
	change: Option<string>;
	direction: Option<string>;
	sort: Option<Int>;
};
export const TickerQuoteIO = type(
	{
		id: optionFromNullable(Int),
		symbol: optionFromNullable(string),
		price: optionFromNullable(string),
		change: optionFromNullable(string),
		direction: optionFromNullable(string),
		sort: optionFromNullable(Int),
	},
	'TickerQuote',
);
