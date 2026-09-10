import * as E from "fp-ts/Either";
import Link from "next/link";

import type { PersonSummary } from "@/domain/person";
import { getPeople } from "@/services/server/controllers";
import { Brand } from "@/ui/Brand";

import styles from "./Header.module.css";

const NAV = [
  { href: "/shows", label: "Shows" },
  { href: "/articles", label: "Articles" },
  { href: "/on-demand", label: "On Demand" },
];

// Best-effort: the header must render even if the people endpoint is unavailable.
const loadHosts = async (): Promise<readonly PersonSummary[]> => {
  try {
    const result = await getPeople()();
    return E.isRight(result) ? result.right : [];
  } catch {
    return [];
  }
};

export const Header = async () => {
  const hosts = await loadHosts();

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
          {hosts.length > 0 && (
            <div className={styles.dropdown}>
              <button type="button" className={styles.dropdownTrigger} aria-haspopup="true">
                Hosts
                <span aria-hidden="true" className={styles.caret}>▾</span>
              </button>
              <div className={styles.menu} role="menu">
                {hosts.map((h) => (
                  <Link key={h.slug} href={`/person/${h.slug}`} className={styles.menuItem} role="menuitem">
                    {h.initials && <span className={styles.menuInitials} aria-hidden="true">{h.initials}</span>}
                    <span>{h.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
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
