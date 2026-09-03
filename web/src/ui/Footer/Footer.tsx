import Link from "next/link";
import type { FC } from "react";
import { Brand } from "@/ui/Brand";
import styles from "./Footer.module.css";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Programming",
    links: [
      { label: "Live now", href: "/" },
      { label: "Full schedule", href: "/shows" },
      { label: "All shows", href: "/shows" },
      { label: "Clips", href: "/on-demand" },
      { label: "Podcast feed", href: "#" },
    ],
  },
  {
    title: "Read",
    links: [
      { label: "Latest articles", href: "/articles" },
      { label: "Macro & rates", href: "/articles?category=macro-rates" },
      { label: "Options & volatility", href: "/articles?category=options-volatility" },
      { label: "Technicals & flow", href: "/articles?category=technicals-flow" },
      { label: "Earnings", href: "/articles?category=earnings" },
    ],
  },
  {
    title: "Network",
    links: [
      { label: "About", href: "#" },
      { label: "The desk", href: "#" },
      { label: "Press", href: "#" },
      { label: "Advertise", href: "#" },
      { label: "Disclosures", href: "#" },
    ],
  },
];

export const Footer: FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <Brand />
          <p className={styles.blurb}>
            Market programming for people who trade. Live 24/5 from New York, London and
            Singapore. Free to watch, always.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} className={styles.col}>
            <div className={styles.colTitle}>{col.title}</div>
            {col.links.map((l) => (
              <Link key={l.label} href={l.href} className={styles.link}>
                {l.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className={styles.legal}>
        © 2026 Tape Network · Programming is for informational purposes only and is not a
        recommendation or investment advice. Quotes delayed 15 minutes.
      </div>
    </footer>
  );
};
