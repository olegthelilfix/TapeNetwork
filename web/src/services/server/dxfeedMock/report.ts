import "server-only";

// Wire shape the Summer Fox AI widget expects from POST {reportPath}:
// ReportScheme = { symbol_summaries: ReportItemData[] }, each item carrying five
// free-text analysis sections. We synthesize believable AI-style copy per symbol
// so the widget renders a full report without a real LLM backend.
export type ReportItemDto = {
    readonly symbol: string;
    readonly instrument_overview: string;
    readonly technical_analysis: string;
    readonly news_impact_analysis: string;
    readonly market_sentiment_overview: string;
    readonly conclusion: string;
};

export type ReportResponseDto = {
    readonly symbol_summaries: readonly ReportItemDto[];
};

export type ReportProfile = "quick" | "detailed";

const COMPANY: Record<string, string> = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corp.",
    NVDA: "NVIDIA Corp.",
    AMZN: "Amazon.com Inc.",
    GOOGL: "Alphabet Inc.",
    TSLA: "Tesla Inc.",
    AVGO: "Broadcom Inc.",
};

const detail = (profile: ReportProfile, extra: string): string =>
    profile === "detailed" ? ` ${extra}` : "";

export const buildReport = (
    symbol: string,
    profile: ReportProfile = "quick",
): ReportResponseDto => {
    const name = COMPANY[symbol] ?? symbol;

    const item: ReportItemDto = {
        symbol,
        instrument_overview:
            `${name} (${symbol}) is a large-cap equity that has been among the most actively ` +
            `traded names on the tape this week. Liquidity is deep and the spread is tight ` +
            `throughout the regular session.` +
            detail(
                profile,
                `Average daily volume remains well above its 30-day baseline, and options ` +
                    `activity skews toward near-dated calls — a sign that positioning is still ` +
                    `tactically long into the event window.`,
            ),
        technical_analysis:
            `Price is trading above its rising 20- and 50-hour moving averages, with each ` +
            `pullback into the prior session's value area being bought. Momentum is positive ` +
            `but no longer accelerating.` +
            detail(
                profile,
                `RSI sits in the high-50s — constructive, not yet overbought — while the most ` +
                    `recent swing high was made on lighter volume than the July advance, a mild ` +
                    `non-confirmation worth watching if support near the 50-hour breaks.`,
            ),
        news_impact_analysis:
            `No single-stock headline is driving ${symbol} today; the move is macro-led, ` +
            `tracking the broader semiconductor and megacap-platform complex.` +
            detail(
                profile,
                `The dominant catalyst on the calendar is the upcoming policy decision; ` +
                    `desks are treating rate-path commentary, not company news, as the swing factor ` +
                    `for the next few sessions.`,
            ),
        market_sentiment_overview:
            `Sentiment is cautiously bullish. Breadth across the index is narrow, and ${symbol} ` +
            `is one of the names doing the heavy lifting, which cuts both ways.` +
            detail(
                profile,
                `Concentration this high means the stock is exposed to a broad-market unwind if ` +
                    `leadership rotates, even absent any company-specific deterioration.`,
            ),
        conclusion:
            `Trend intact, participation narrow. ${symbol} looks fine as long as index leadership ` +
            `holds, but the asymmetric risk into the Fed window argues for tighter risk management ` +
            `rather than fresh aggressive longs.`,
    };

    return { symbol_summaries: [item] };
};
