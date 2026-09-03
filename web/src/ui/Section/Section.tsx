import Link from "next/link";
import type { FC, ReactNode } from "react";
import styles from "./Section.module.css";

type SectionHeaderProps = {
  title: string;
  href?: string;
  action?: string;
};

type CardGridProps = {
  children: ReactNode;
};

export const SectionHeader: FC<SectionHeaderProps> = ({
  title,
  href,
  action,
}) => {
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
};

export const CardGrid: FC<CardGridProps> = ({ children }) => {
  return <div className={styles.grid}>{children}</div>;
};
