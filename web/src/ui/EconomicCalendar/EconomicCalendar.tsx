"use client";

import { useEffect, useRef } from "react";

import type { newEconomicCalendarWidget } from "@dx-display/widgets-economic-calendar";
import type { FC } from "react";

import { economicCalendarDataProviders } from "@/domain/economicCalendar";

import styles from "./EconomicCalendar.module.css";

export type EconomicCalendarTheme = "dark" | "light";

export type EconomicCalendarProps = {
    readonly theme?: EconomicCalendarTheme;
    readonly height?: string;
};

type EconomicCalendarWidgetHandle = ReturnType<typeof newEconomicCalendarWidget>;

// Same constraints as Heatmap: @dx-display/widgets-economic-calendar reads `window`
// at module scope and mounts via its own createRoot, so it is imported lazily inside
// the effect (never during SSR) and guarded with a cancellation flag against React
// StrictMode's double-invoke.
//
// "Limited" version = the full widget constrained through its documented config/state
// knobs for a compact sidebar placement: a short default period, the toolbar
// selectors/refresh button hidden, and column set/period left at the widget's own
// defaults (we only spread the package defaults and narrow the safe options, rather
// than hand-picking column ids that could drift between package versions).
export const EconomicCalendar: FC<EconomicCalendarProps> = ({ theme = "dark", height = "420px" }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<EconomicCalendarWidgetHandle | null>(null);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) {
            return;
        }

        let cancelled = false;

        import("@dx-display/widgets-economic-calendar").then(
            ({ newEconomicCalendarWidget, defaultEconomicCalendarWidgetConfig, defaultEconomicCalendarWidgetState }) => {
                if (cancelled) {
                    return;
                }

                widgetRef.current = newEconomicCalendarWidget({
                    element,
                    providers: economicCalendarDataProviders,
                    // Compact config for a narrow sidebar: strip every interactive
                    // affordance (toolbar, refresh, sort/filter/resize/reorder, the
                    // column-select menu) so it reads as a dense, static list.
                    config: {
                        ...defaultEconomicCalendarWidgetConfig,
                        refreshButtonEnabled: false,
                        datePickerViewMode: "hidden",
                        periodSelectorViewMode: "hidden",
                        columnSelectMenuEnabled: false,
                        sortable: false,
                        filterable: false,
                        resizable: false,
                        reorderable: false,
                        // Most compact date/time the widget's own formatter can produce:
                        // en-GB is day-first + 24h (no AM/PM), noticeably shorter than the
                        // default US locale. The widget renders srcTime as DateTime and
                        // exposes no time-only / custom-pattern option, so this is the only
                        // API-level lever short of a custom cell renderer.
                        locale: { ...defaultEconomicCalendarWidgetConfig.locale, dateLocale: "en-GB" },
                    },
                    // Column order requested: importance, event, date/time, country,
                    // then the rest (actual, consensus, previous). Natural widths (no
                    // columnSizes) so nothing is clipped; the table scrolls horizontally
                    // in the narrow sidebar if the full set doesn't fit.
                    state: {
                        ...defaultEconomicCalendarWidgetState,
                        columns: ["importance", "subType", "srcTime", "countryCode", "actual", "consensus", "previous"],
                        // Importance is just an icon — pin it as narrow as the widget
                        // allows. Its header label is blanked via CSS (module) since the
                        // widget exposes no per-column title/hide-header option.
                        columnSizes: { importance: 28 },
                        period: "7days",
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
        // Mount once; theme change is pushed to the live widget below.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        widgetRef.current?.setTheme(theme);
    }, [theme]);

    return <div ref={containerRef} className={styles.wrap} style={{ height }} aria-label="Economic calendar" />;
};
