"use client";

import { useEffect, useRef } from "react";

import type { newCorporateCardWidget } from "@dx-display/widgets-corporate-card";
import type { FC } from "react";

import { corporateCardDataProviders } from "@/domain/corporateCard";

import styles from "./CorporateCard.module.css";

export type CorporateCardTheme = "dark" | "light";

export type CorporateCardProps = {
    readonly symbol?: string;
    readonly theme?: CorporateCardTheme;
    readonly height?: string;
    /** Panels to show. Omit for ALL panels. */
    readonly panels?: readonly import("@dx-display/widgets-corporate-card").CorporateCardPanelId[];
};

type CorporateCardWidgetHandle = ReturnType<typeof newCorporateCardWidget>;

// All Corporate Card panels, used when `panels` is not provided.
const ALL_PANELS = [
    "keyFacts", "summary", "priceHistoryAndPerformance", "52WeeksAnalytics", "financials",
    "dividendSummary", "ownership", "industryLeadersValuation", "valuationRatiosComparison",
    "competitors", "stockPerformanceAnalysis", "indexBenchmarking", "evToEbitda", "pbRatio",
    "profitabilityRatios", "salesToProfit", "operationEfficiencyRatios", "liquidityRatios",
] as const;

// Same lazy-mount discipline as the other dx-display widgets. `panels` controls
// which Corporate Card panels are shown (default: all).
export const CorporateCard: FC<CorporateCardProps> = ({ symbol = "AAPL", theme = "dark", height = "520px", panels }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<CorporateCardWidgetHandle | null>(null);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) {
            return;
        }

        let cancelled = false;

        import("@dx-display/widgets-corporate-card").then(
            ({ newCorporateCardWidget, defaultCorporateCardWidgetConfig, defaultCorporateCardWidgetState }) => {
                if (cancelled) {
                    return;
                }

                const selected = (panels ?? ALL_PANELS) as import("@dx-display/widgets-corporate-card").CorporateCardPanelId[];
                widgetRef.current = newCorporateCardWidget({
                    element,
                    providers: corporateCardDataProviders,
                    config: {
                        ...defaultCorporateCardWidgetConfig,
                        availablePanels: selected,
                        panelMenuViewMode: "hidden",
                    },
                    state: {
                        ...defaultCorporateCardWidgetState,
                        symbol,
                        panels: selected,
                    },
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

    return <div ref={containerRef} className={styles.wrap} style={{ height }} aria-label="Price history and performance" />;
};
