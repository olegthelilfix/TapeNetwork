import type { TickerItem } from "@/lib/api/types";
import styles from "./Ticker.module.css";

export function Ticker({ items }: { items: TickerItem[] }) {
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
}
