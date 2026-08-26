import Link from "next/link";
import { Brand } from "./Brand";
import styles from "./Header.module.css";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shows", label: "Shows" },
  { href: "/articles", label: "Articles" },
  { href: "/on-demand", label: "On Demand" },
];

export function Header() {
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
}
