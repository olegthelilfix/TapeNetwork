"use client";

import { useEffect, useRef } from "react";

import type { newHeatmapWidget } from "@dx-display/widgets-heatmap";
import type { FC } from "react";

import { DEFAULT_HEATMAP_SYMBOLS, heatmapDataProviders } from "@/domain/heatmap";

import styles from "./Heatmap.module.css";

export type HeatmapTheme = "dark" | "light";

export type HeatmapProps = {
    readonly symbols?: readonly string[];
    readonly theme?: HeatmapTheme;
    readonly height?: string;
};

type HeatmapWidgetHandle = ReturnType<typeof newHeatmapWidget>;

// @dx-display/widgets-heatmap reads `window` at module scope (its theme setup) and mounts
// itself via its own createRoot call, so it's loaded lazily inside the effect — never during
// SSR, and never more than once per mount even under React StrictMode's double-invoke, which
// would otherwise call createRoot twice on the same container before the first root's
// (microtask-deferred) unmount had actually run.
export const Heatmap: FC<HeatmapProps> = ({ symbols = DEFAULT_HEATMAP_SYMBOLS, theme = "dark", height = "600px" }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<HeatmapWidgetHandle | null>(null);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) {
            return;
        }

        let cancelled = false;

        import("@dx-display/widgets-heatmap").then(({ newHeatmapWidget }) => {
            if (cancelled) {
                return;
            }

            widgetRef.current = newHeatmapWidget({
                element,
                providers: heatmapDataProviders,
                state: { symbols: [...symbols] },
                theme,
            });
        });

        return () => {
            cancelled = true;
            widgetRef.current?.unmount();
            widgetRef.current = null;
        };
        // Mount once; symbol/theme changes are pushed to the live widget below
        // instead of tearing down and recreating its own React root.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        widgetRef.current?.setTheme(theme);
    }, [theme]);

    useEffect(() => {
        widgetRef.current?.updateState({ symbols: [...symbols] });
    }, [symbols]);

    return <div ref={containerRef} className={styles.wrap} style={{ height }} aria-label="Market heatmap" />;
};
