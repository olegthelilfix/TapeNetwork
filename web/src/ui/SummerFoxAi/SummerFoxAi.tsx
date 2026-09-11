"use client";

import { useEffect, useRef } from "react";

import type { newSummerFoxAiWidget } from "@dx-display/widgets-summer-fox-ai";
import type { FC } from "react";

import { summerFoxAiDataProviders } from "@/domain/summerFoxAi";

import styles from "./SummerFoxAi.module.css";

export type SummerFoxAiTheme = "dark" | "light";

export type SummerFoxAiProps = {
    readonly symbol?: string;
    readonly theme?: SummerFoxAiTheme;
    readonly height?: string;
};

type SummerFoxAiWidgetHandle = ReturnType<typeof newSummerFoxAiWidget>;

// Same lazy-mount discipline as the other dx-display widgets: the package reads
// `window` at module scope and mounts via its own createRoot, so it is imported
// inside the effect (never during SSR) and guarded against React StrictMode's
// double-invoke with a cancellation flag.
export const SummerFoxAi: FC<SummerFoxAiProps> = ({ symbol = "AAPL", theme = "dark", height = "560px" }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<SummerFoxAiWidgetHandle | null>(null);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) {
            return;
        }

        let cancelled = false;

        import("@dx-display/widgets-summer-fox-ai").then(
            ({ newSummerFoxAiWidget, defaultSummerFoxAIWidgetConfig, defaultSummerFoxAIWidgetState }) => {
                if (cancelled) {
                    return;
                }

                widgetRef.current = newSummerFoxAiWidget({
                    element,
                    providers: summerFoxAiDataProviders,
                    config: { ...defaultSummerFoxAIWidgetConfig },
                    state: { ...defaultSummerFoxAIWidgetState, symbol, reportType: "quick" },
                    theme,
                });
            },
        );

        return () => {
            cancelled = true;
            widgetRef.current?.unmount();
            widgetRef.current = null;
        };
        // Mount once; theme/symbol changes pushed to the live widget below.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        widgetRef.current?.setTheme(theme);
    }, [theme]);

    useEffect(() => {
        widgetRef.current?.updateState({ symbol });
    }, [symbol]);

    return <div ref={containerRef} className={styles.wrap} style={{ height }} aria-label="Summer Fox AI report" />;
};
