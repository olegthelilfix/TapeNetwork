import type { Metadata } from "next";
import Link from "next/link";

import { ArticleSidebar } from "@/features/articles/details/ArticleSidebar";
import { Card } from "@/ui/Card";
import { CorporateCard } from "@/ui/CorporateCard";
import { SimpleChart } from "@/ui/SimpleChart";
import { SummerFoxAi } from "@/ui/SummerFoxAi";

import styles from "@/features/instrument/InstrumentPage.module.css";

export const metadata: Metadata = {
    title: "AAPL — Apple Inc.",
    description: "Instrument page demo: live Corporate Card price chart + Summer Fox AI company overview.",
    robots: { index: false },
};

// Hardcoded instrument (equity) page demo. Static route shadowing any dynamic
// slug for "AAPL". Header/On-Tape are demo content; the price chart is the live
// Corporate Card widget (priceHistoryAndPerformance panel) and the company
// overview is the Summer Fox AI widget. Right rail is the standard ArticleSidebar.
const SYMBOL = "AAPL";

// Same preview image prod serves for videos (dev hits the prod API/origin).
const VIDEO_PREVIEW = "https://tapenetwork.de/uploads/Gemini_Generated_Image_jik0zpjik0zpjik0.png";

const ON_TAPE = [
    { slug: "opening-bell-services-mix", title: "Apple's services mix is doing the heavy lifting again", subtitle: "The Opening Bell · 2h ago", kicker: "EARNINGS", duration: "18:24" },
    { slug: "vol-desk-aapl-straddle", title: "The AAPL straddle is pricing a 4.1% move — is that enough?", subtitle: "The Vol Desk · Yesterday", kicker: "OPTIONS", duration: "26:40" },
    { slug: "chart-session-aapl-229", title: "AAPL at 229: the level that has rejected four times", subtitle: "Chart Session · Yesterday", kicker: "CHART", duration: "12:08" },
    { slug: "macro-hour-megacap-beta", title: "Mega-cap concentration and what it does to your beta", subtitle: "Macro Hour · Sep 8", kicker: "MACRO", duration: "44:31" },
    { slug: "long-position-supply-chain", title: "A supply-chain analyst on the replacement cycle", subtitle: "The Long Position · Sep 4", kicker: "INTERVIEW", duration: "51:16" },
    { slug: "opening-bell-buyback", title: "Why the buyback still matters more than the dividend", subtitle: "The Opening Bell · Sep 2", kicker: "CLIP", duration: "7:52" },
];

const InstrumentPage = () => {
    return (
        <>
            <div className={styles.crumb}>Markets / Equities / NASDAQ</div>

            {/* ---------- header band ---------- */}
            <header className={styles.head}>
                <div className={styles.headId}>
                    <div className={styles.tickerRow}>
                        <span className={styles.ticker}>{SYMBOL}</span>
                        <span className={styles.company}>Apple Inc.</span>
                    </div>
                    <div className={styles.badges}>
                        <span className={styles.badge}>NASDAQ</span>
                        <span className={styles.badge}>Technology · Consumer Hardware</span>
                        <span className={styles.badge}>USD</span>
                    </div>
                </div>

                <div className={styles.priceBlock}>
                    <div>
                        <span className={styles.price}>228.05</span>
                        <span className={`${styles.change} ${styles.down}`}>−0.73 (−0.32%)</span>
                    </div>
                    <div className={styles.asof}>AS OF 16:00 ET · SEP 11, 2026 · AFTER HOURS 228.41 +0.16%</div>
                </div>

                <div className={styles.headActions}>
                    <button type="button" className={styles.btnPrimary}>● Coverage live now</button>
                    <button type="button" className={styles.btnGhost}>+ Watchlist</button>
                </div>
            </header>

            {/* ---------- layout ---------- */}
            <div className={styles.layout}>
                <div className={styles.main}>
                    {/* price chart = Simple chart */}
                    <div className={styles.blockHead}><span>Price</span></div>
                    <div className={styles.chartCard}>
                        <SimpleChart symbol={SYMBOL} height="480px" />
                    </div>

                    {/* on tape */}
                    <div className={styles.blockHead}>
                        <span>On Tape: {SYMBOL}</span>
                        <Link href="/articles">Full archive →</Link>
                    </div>
                    <div className={styles.tapeGrid}>
                        {ON_TAPE.map((c) => (
                            <Card
                                key={c.slug}
                                href={`/watch/${c.slug}`}
                                title={c.title}
                                subtitle={c.subtitle}
                                kicker={c.kicker}
                                duration={c.duration}
                                imageUrl={VIDEO_PREVIEW}
                            />
                        ))}
                    </div>

                    {/* about the company = Summer Fox AI */}
                    <div className={styles.blockHead}><span>About the company</span></div>
                    <SummerFoxAi symbol={SYMBOL} height="640px" />

                    {/* full Corporate Card (all panels) at the bottom */}
                    <div className={styles.blockHead}><span>Corporate card</span></div>
                    <div className={styles.chartCard}>
                        <CorporateCard symbol={SYMBOL} height="900px" />
                    </div>
                </div>

                {/* right rail: News + Economic calendar (no programming / most popular) */}
                <aside className={styles.side}>
                    <ArticleSidebar
                        widgets={["news", "economicCalendar"]}
                        newsSymbols={[SYMBOL]}
                    />
                </aside>
            </div>
        </>
    );
};

export default InstrumentPage;
