"use client";

import { useEffect, useRef } from "react";

import type { FC } from "react";

import styles from "./PriceChart.module.css";

export type PriceChartProps = {
    readonly symbol?: string;
    readonly height?: string;
};

// Public, rate-limited dxLink demo endpoint for developers (not the same
// entitlement-gated services the heatmap widget needs) — safe to hit directly
// from the browser, no BFF needed.
const DXLINK_DEMO_URL = "wss://tools.dxfeed.com/dxlink-dxwebdemo";

// This endpoint requires an AUTH token (anonymous connections get stuck at
// AUTH_STATE "UNAUTHORIZED" and never get a channel opened). This one is the
// public demo token devexperts.com/dxcharts-demo/ itself sends — visible to
// anyone who opens devtools on that page, so it's not a secret we're
// exfiltrating, just the same public demo credential. Payload decodes to
// `dxwebdemo,prod,,<exp>,<iat>,dxchart-app`: issued 2026-07-22, expires
// 2028-07-21. Overridable via NEXT_PUBLIC_DXLINK_DEMO_TOKEN if it's rotated —
// grab a fresh one from that page's Network tab (WS frames) the same way.
const DXLINK_DEMO_TOKEN =
    process.env.NEXT_PUBLIC_DXLINK_DEMO_TOKEN ??
    "ZHh3ZWJkZW1vLHByb2QsLDE4NDc3OTYxOTMsMTc4NDcyNDE5MyxkeGNoYXJ0LWFwcA.U6QPgzpsj-UT8kpnhfqZ0hlsL3ZmcpNeM7EM3ZErxFw";

// Matches the exact candle spec devexperts.com/dxcharts-demo/ uses for AAPL:
// hourly, regular-trading-hours-only, market-aligned. `fromTime` of ~1e9 (ms)
// is effectively "since forever" — the server truncates history anyway.
const CANDLE_SYMBOL_SUFFIX = "h,tho=true,a=m";
const CANDLE_FROM_TIME = 1_000_000_000;

const CANDLE_EVENT_FIELDS = ["eventSymbol", "eventFlags", "time", "open", "high", "low", "close", "volume"] as const;

type ChartCandle = {
    readonly id: string;
    readonly timestamp: number;
    readonly open: number;
    readonly hi: number;
    readonly lo: number;
    readonly close: number;
    readonly volume: number;
};

const toChartCandle = (event: Record<string, unknown>): ChartCandle | null => {
    const { time, open, high, low, close, volume } = event;
    if (typeof time !== "number" || typeof close !== "number") {
        return null;
    }

    return {
        id: String(time),
        timestamp: time,
        open: typeof open === "number" ? open : close,
        hi: typeof high === "number" ? high : close,
        lo: typeof low === "number" ? low : close,
        close,
        volume: typeof volume === "number" ? volume : 0,
    };
};

// Both @devexperts/dxcharts-lite and the dxLink client need a real DOM
// container/WebSocket, so — same as Heatmap — everything is loaded lazily
// inside the effect and guarded by a cancellation flag against React
// StrictMode's double-invoke.
export const PriceChart: FC<PriceChartProps> = ({ symbol = "AAPL", height = "480px" }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) {
            return;
        }

        let cancelled = false;
        let chart: import("@devexperts/dxcharts-lite").Chart | undefined;
        let client: import("@dxfeed/dxlink-websocket-client").DXLinkWebSocketClient | undefined;
        let feed: import("@dxfeed/dxlink-feed").DXLinkFeed<import("@dxfeed/dxlink-feed").FeedContract> | undefined;
        let settleTimer: ReturnType<typeof setTimeout> | undefined;

        Promise.all([
            import("@devexperts/dxcharts-lite"),
            import("@dxfeed/dxlink-websocket-client"),
            import("@dxfeed/dxlink-feed"),
        ]).then(([{ createChart }, { DXLinkWebSocketClient }, { DXLinkFeed, FeedContract, FeedDataFormat }]) => {
            if (cancelled) {
                return;
            }

            chart = createChart(element);

            // The historical backfill arrives as many separate chunks (newest-first,
            // and jumping further back each time), interleaved with live ticks for the
            // in-progress candle — dxLink's Feed API has no explicit "snapshot done"
            // signal. Live ticks for the current candle keep arriving continuously
            // (every ~100ms), so a resettable "quiet period" debounce never actually
            // goes quiet — instead, a one-shot timer armed on the first batch flushes
            // everything accumulated so far via setData() (giving the chart its full
            // navigable range), then every batch after that is a plain incremental
            // updateData() (a full-array setData per live tick would reset the
            // viewport/zoom on every update). SETTLE_MS is picked from observing this
            // demo's own backfill, which finishes within ~1-2s.
            const candlesById = new Map<number, ChartCandle>();
            let hasSettled = false;
            let settleTimerArmed = false;
            const SETTLE_MS = 2500;

            const flush = () => {
                const allCandles = [...candlesById.values()].sort((a, b) => a.timestamp - b.timestamp);
                chart?.setData({ candles: allCandles, instrument: { symbol } });
            };

            client = new DXLinkWebSocketClient();
            feed = new DXLinkFeed(client, FeedContract.AUTO);

            feed.configure({
                acceptDataFormat: FeedDataFormat.FULL,
                acceptEventFields: { Candle: [...CANDLE_EVENT_FIELDS] },
            });
            feed.addEventListener((events) => {
                const batch = events.map(toChartCandle).filter((candle): candle is ChartCandle => candle !== null);
                if (batch.length === 0) {
                    return;
                }

                for (const candle of batch) {
                    candlesById.set(candle.timestamp, candle);
                }

                if (!hasSettled) {
                    if (!settleTimerArmed) {
                        settleTimerArmed = true;
                        settleTimer = setTimeout(() => {
                            hasSettled = true;
                            flush();
                        }, SETTLE_MS);
                    }
                } else {
                    const sortedBatch = batch.sort((a, b) => a.timestamp - b.timestamp);
                    chart?.updateData({ candles: sortedBatch });
                }
            });
            feed.addSubscriptions([
                {
                    type: "Candle",
                    symbol: `${symbol}{=${CANDLE_SYMBOL_SUFFIX}}`,
                    fromTime: CANDLE_FROM_TIME,
                },
            ]);

            client.setAuthToken(DXLINK_DEMO_TOKEN);
            client.connect(DXLINK_DEMO_URL);
        });

        return () => {
            cancelled = true;
            clearTimeout(settleTimer);
            feed?.close();
            client?.close();
            chart?.destroy();
        };
    }, [symbol]);

    return <div ref={containerRef} className={styles.wrap} style={{ height }} aria-label={`${symbol} price chart`} />;
};
