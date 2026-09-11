"use client";

import { useEffect, useRef } from "react";

import type { newSimpleChartWidget } from "@dx-display/widgets-simple-chart";
import type { FC } from "react";

import { simpleChartDataProviders } from "@/domain/simpleChart";

import styles from "./SimpleChart.module.css";

export type SimpleChartTheme = "dark" | "light";

export type SimpleChartProps = {
    readonly symbol?: string;
    readonly theme?: SimpleChartTheme;
    readonly height?: string;
};

type SimpleChartWidgetHandle = ReturnType<typeof newSimpleChartWidget>;

export const SimpleChart: FC<SimpleChartProps> = ({ symbol = "AAPL", theme = "dark", height = "480px" }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<SimpleChartWidgetHandle | null>(null);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) {
            return;
        }

        let cancelled = false;

        import("@dx-display/widgets-simple-chart").then(
            ({ newSimpleChartWidget, defaultSimpleChartWidgetConfig, defaultSimpleChartWidgetState }) => {
                if (cancelled) {
                    return;
                }

                widgetRef.current = newSimpleChartWidget({
                    element,
                    providers: simpleChartDataProviders,
                    config: { ...defaultSimpleChartWidgetConfig },
                    state: { ...defaultSimpleChartWidgetState, symbol },
                    theme,
                });
            },
        );

        return () => {
            cancelled = true;
            widgetRef.current?.unmount();
            widgetRef.current = null;
        };
        // Mount once; theme/symbol pushed to the live widget below.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        widgetRef.current?.setTheme(theme);
    }, [theme]);

    useEffect(() => {
        widgetRef.current?.updateState({ symbol });
    }, [symbol]);

    return <div ref={containerRef} className={styles.wrap} style={{ height }} aria-label="Price chart" />;
};
