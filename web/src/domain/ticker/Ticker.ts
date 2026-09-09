export type TickerDirection = "up" | "down";

export type Ticker = {
    readonly symbol: string;
    readonly price: string;
    readonly change: string;
    readonly direction: TickerDirection;
};
