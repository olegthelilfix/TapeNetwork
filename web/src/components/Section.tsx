import Link from "next/link";
import styles from "./Section.module.css";

export function SectionHeader({
  title,
  href,
  action,
}: {
  title: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      {href && action && (
        <Link href={href} className={styles.action}>
          {action} →
        </Link>
      )}
    </div>
  );
}

export function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}
