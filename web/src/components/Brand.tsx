import Link from "next/link";
import styles from "./Brand.module.css";

export function Brand() {
  return (
    <Link href="/" className={styles.brand} aria-label="Tape Network home">
      <span className={styles.bar} aria-hidden />
      <span className={styles.word}>TAPE</span>
      <span className={styles.network}>NETWORK</span>
    </Link>
  );
}
