"use client";

import { useEffect, useRef } from "react";

import type { newNewsWidget } from "@dx-display/widgets-news";
import type { FC } from "react";

import { newsDataProviders } from "@/domain/news";

import styles from "./News.module.css";

export type NewsTheme = "dark" | "light";

export type NewsProps = {
    readonly symbols?: readonly string[];
    readonly theme?: NewsTheme;
    readonly height?: string;
};

type NewsWidgetHandle = ReturnType<typeof newNewsWidget>;

// Same lazy-mount discipline as the other dx-display widgets.
export const News: FC<NewsProps> = ({ symbols = [], theme = "dark", height = "440px" }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<NewsWidgetHandle | null>(null);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) {
            return;
        }

        let cancelled = false;

        import("@dx-display/widgets-news").then(
            ({ newNewsWidget, defaultNewsWidgetConfig, defaultNewsWidgetState }) => {
                if (cancelled) {
                    return;
                }

                widgetRef.current = newNewsWidget({
                    element,
                    providers: newsDataProviders,
                    config: { ...defaultNewsWidgetConfig, refreshButtonEnabled: false },
                    state: { ...defaultNewsWidgetState, symbols: [...symbols] },
                    theme,
                });
            },
        );

        return () => {
            cancelled = true;
            widgetRef.current?.unmount();
            widgetRef.current = null;
        };
        // Mount once; theme/symbols pushed to the live widget below.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        widgetRef.current?.setTheme(theme);
    }, [theme]);

    useEffect(() => {
        widgetRef.current?.updateState({ symbols: [...symbols] });
    }, [symbols]);

    return <div ref={containerRef} className={styles.wrap} style={{ height }} aria-label="Market news" />;
};
