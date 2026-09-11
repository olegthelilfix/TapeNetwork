import type { Metadata } from "next";
import Link from "next/link";

import { Heatmap } from "@/ui/Heatmap";
import { PriceChart } from "@/ui/PriceChart";

import { ArticleSidebar } from "@/features/articles/details/ArticleSidebar";
import articleStyles from "@/features/articles/details/ArticleDetailsFeature.module.css";
import figureStyles from "@/features/articles/details/WidgetDemoArticle.module.css";

// Hardcoded demo article — a static route that intentionally shadows the dynamic
// /articles/[slug] page for the "widget-demo" slug. Needs no backend; exercises
// the live PriceChart + Heatmap widgets inside the Schwab-style article layout.
export const metadata: Metadata = {
    title: "Chips lead a narrow tape as breadth thins into the Fed window",
    description: "Demo article illustrating live market widgets inside editorial copy.",
    robots: { index: false },
};

const TAGS = ["Market Structure", "Semiconductors", "Fed Watch"];

const WidgetDemoArticlePage = () => {
    return (
        <>
            <nav className={articleStyles.crumb} aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span className={articleStyles.crumbSep}>›</span>
                <Link href="/articles">Articles</Link>
                <span className={articleStyles.crumbSep}>›</span>
                <span className={articleStyles.crumbCurrent}>
                    Chips lead a narrow tape as breadth thins into the Fed window
                </span>
            </nav>

            <div className={articleStyles.layout}>
                {/* left rail */}
                <aside className={articleStyles.rail}>
                    <div className={articleStyles.authorCard}>
                        <span className={articleStyles.authorAvatar} aria-hidden>I</span>
                        <span className={articleStyles.authorMeta}>
                            <span className={articleStyles.authorName}>Ilya Grant</span>
                            <span className={articleStyles.authorRole}>Sr. Markets Correspondent</span>
                        </span>
                    </div>
                    <div className={articleStyles.share}>
                        <span className={articleStyles.shareLabel}>Share</span>
                        <span className={articleStyles.shareBtns} aria-hidden>
                            <span className={articleStyles.shareBtn}>𝕏</span>
                            <span className={articleStyles.shareBtn}>f</span>
                            <span className={articleStyles.shareBtn}>in</span>
                            <span className={articleStyles.shareBtn}>↗</span>
                        </span>
                    </div>
                    <ul className={articleStyles.tags}>
                        {TAGS.map((t) => (
                            <li key={t} className={articleStyles.tag}>{t}</li>
                        ))}
                    </ul>
                </aside>

                {/* center article */}
                <article className={articleStyles.main}>
                    <h1 className={articleStyles.h1}>
                        Chips lead a narrow tape as breadth thins into the Fed window
                    </h1>
                    <div className={articleStyles.meta}>
                        <span>
                            <span className={articleStyles.metaKey}>PUBLISHED</span> 10 SEP 2026
                        </span>
                        <span className={articleStyles.metaDot}>|</span>
                        <span>6 MIN READ</span>
                    </div>

                    {/* hero widget instead of a hero image */}
                    <figure className={figureStyles.figure}>
                        <div className={figureStyles.figureBody}>
                            <PriceChart symbol="AAPL" height="360px" />
                        </div>
                        <figcaption className={figureStyles.caption}>
                            <b>Fig. 1</b> — Hourly candles, regular trading hours. Live dxLink demo feed.
                        </figcaption>
                    </figure>

                    <p className={articleStyles.dek}>
                        A handful of megacap semiconductors are carrying the index again. Under the
                        surface, participation is the narrowest it has been since the summer.
                    </p>

                    <div className={articleStyles.body}>
                        <p>
                            The rally that carried equities off the August lows has quietly changed
                            character. Where June and July were broad — small caps, cyclicals and
                            financials all pulling their weight — the last three weeks have been a
                            story of concentration. On most up days this month, more than half of the
                            index&apos;s gain has come from fewer than ten names, nearly all of them
                            in semiconductors and the platforms that lease their compute.
                        </p>
                        <p>
                            Step back to the whole board and the concentration is impossible to miss.
                            The heatmap below sizes each name by market cap and colors it by the
                            session&apos;s move — the green is real, but it is clustered.
                        </p>

                        <figure className={figureStyles.figure}>
                            <div className={figureStyles.figureBody}>
                                <Heatmap height="480px" />
                            </div>
                            <figcaption className={figureStyles.caption}>
                                <b>Fig. 2</b> — Market heatmap, sized by market cap, colored by change on the session.
                            </figcaption>
                        </figure>

                        <p>
                            None of this is inherently bearish — narrow leadership can persist for
                            quarters — but it raises the stakes around Wednesday. With the policy
                            decision landing inside a market this top-heavy, the reaction function is
                            asymmetric: a dovish surprise broadens the tape, a hawkish hold pulls the
                            rug from exactly the crowded longs holding the index up.
                        </p>
                        <p>
                            For now the message from both the single name and the board is the same.
                            Leadership is intact, breadth is not, and the next real move belongs to
                            the rates market. Watch the front end into the print.
                        </p>
                    </div>
                </article>

                {/* right sidebar — same widgets as the homepage */}
                <aside className={articleStyles.side}>
                    <ArticleSidebar />
                </aside>
            </div>
        </>
    );
};

export default WidgetDemoArticlePage;
