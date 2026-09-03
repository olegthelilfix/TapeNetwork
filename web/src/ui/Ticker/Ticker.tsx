import type { FC } from "react";

import type { Ticker as TickerItem } from "@/domain/ticker";

import styles from "./Ticker.module.css";

type TickerProps = {
  items: readonly TickerItem[];
};

export const Ticker: FC<TickerProps> = ({ items }) => {
  if (!items?.length) return null;
  // Duplicate the row so the marquee loops seamlessly.
  const row = [...items, ...items];
  return (
    <div className={styles.wrap} aria-label="Market ticker">
      <div className={styles.track}>
        {row.map((q, i) => (
          <span className={styles.quote} key={i}>
            <span className={styles.sym}>{q.symbol}</span>
            <span className={styles.px}>{q.price}</span>
            <span className={q.direction === "up" ? styles.up : styles.down}>{q.change}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
