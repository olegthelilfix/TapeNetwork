import Link from "next/link";
import type { FC } from "react";

import { Brand } from "@/ui/Brand";

import styles from "./Header.module.css";

const NAV = [
  { href: "/shows", label: "Shows" },
  { href: "/articles", label: "Articles" },
  { href: "/on-demand", label: "On Demand" },
];

export const Header: FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Brand />
        <nav className={styles.nav}>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={styles.link}>
              {n.label}
            </Link>
          ))}
        </nav>
        <form className={styles.search} action="/search" method="GET" role="search">
          <button className={styles.searchBtn} type="submit" aria-label="Search">⌕</button>
          <input
            className={styles.searchInput}
            type="search"
            name="q"
            placeholder="Search shows, tickers, hosts"
            aria-label="Search"
          />
        </form>
      </div>
    </header>
  );
};
