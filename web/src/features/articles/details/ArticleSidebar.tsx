import Link from "next/link";
import type { ReactNode } from "react";

import type { Home } from "@/domain/content";
import { getHome, resolveControllerResult } from "@/services/server/controllers";
import { EconomicCalendar } from "@/ui/EconomicCalendar";
import { News } from "@/ui/News";

import styles from "@/features/home/HomeFeature.module.css";

// The set of widgets a page can place in the right sidebar. Pages pass an
// ordered list to pick their own combination.
export type SidebarWidgetId = "programming" | "economicCalendar" | "mostPopular" | "news";

// Default set (the homepage / article set). News is opt-in per page.
export const DEFAULT_SIDEBAR_WIDGETS: readonly SidebarWidgetId[] = [
    "programming",
    "economicCalendar",
    "mostPopular",
];

export type ArticleSidebarProps = {
    /** Ordered widgets to render. Defaults to programming + calendar + most popular. */
    readonly widgets?: readonly SidebarWidgetId[];
    /** Symbols passed to the News widget when present. */
    readonly newsSymbols?: readonly string[];
};

// Async server component. Home data (Programming / Most popular) is fetched only
// when one of those widgets is requested; a failed fetch just drops those panels.
// Economic calendar and News are self-contained (own mock BFF), so they render
// regardless.
export const ArticleSidebar = async ({
    widgets = DEFAULT_SIDEBAR_WIDGETS,
    newsSymbols = [],
}: ArticleSidebarProps = {}) => {
    const needsHome = widgets.includes("programming") || widgets.includes("mostPopular");

    let home: Home | null = null;
    if (needsHome) {
        try {
            home = await resolveControllerResult(getHome(), {
                onNotFound: () => {
                    throw new Error("home data unavailable");
                },
            });
        } catch {
            home = null;
        }
    }

    const renderWidget = (id: SidebarWidgetId): ReactNode => {
        switch (id) {
            case "programming":
                if (!home || home.schedule.length === 0) return null;
                return (
                    <section key={id} className={styles.panel}>
                        <div className={styles.panelHead}>
                            <span>Programming</span>
                            <span className={styles.panelHeadEt}>ET</span>
                        </div>
                        <ul className={styles.schedule}>
                            {home.schedule.map((s, i) => (
                                <li key={i} className={styles.slot}>
                                    <span className={styles.slotTime}>{s.timeEt}</span>
                                    <span className={styles.slotBody}>
                                        <span className={styles.slotName}>
                                            {s.showSlug ? <Link href={`/shows/${s.showSlug}`}>{s.showName}</Link> : s.showName}
                                            {s.isLive && <span className={styles.slotLive}>LIVE</span>}
                                        </span>
                                        {s.hostsLabel && <span className={styles.slotHost}>{s.hostsLabel}</span>}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                );
            case "economicCalendar":
                return (
                    <section key={id} className={styles.panel}>
                        <div className={styles.panelHead}><span>Economic calendar</span></div>
                        <EconomicCalendar />
                    </section>
                );
            case "news":
                return (
                    <section key={id} className={styles.panel}>
                        <div className={styles.panelHead}><span>News</span></div>
                        <News symbols={newsSymbols} />
                    </section>
                );
            case "mostPopular":
                if (!home || home.mostWatched.length === 0) return null;
                return (
                    <section key={id} className={styles.panel}>
                        <div className={styles.panelHead}><span>Most popular</span></div>
                        <ol className={styles.ranked}>
                            {home.mostWatched.map((c, i) => (
                                <li key={c.slug}>
                                    <Link href={`/watch/${c.slug}`} className={styles.rankRow}>
                                        <span className={styles.rankNo}>{String(i + 1).padStart(2, "0")}</span>
                                        <span className={styles.rankBody}>
                                            <span className={styles.rankTitle}>{c.title}</span>
                                            <span className={styles.rankMeta}>
                                                {[c.subtitle, c.viewsLabel ? `${c.viewsLabel} views` : null, c.durationLabel].filter(Boolean).join(" · ")}
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    </section>
                );
            default:
                return null;
        }
    };

    return <>{widgets.map(renderWidget)}</>;
};
