import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";

import styles from "./Card.module.css";

export type CardProps = {
  href: string;
  title: string;
  subtitle?: string | null;
  kicker?: string | null;
  duration?: string | null;
  imageUrl?: string | null;
  live?: boolean;
};

export const Card: FC<CardProps> = ({
  href,
  title,
  subtitle,
  kicker,
  duration,
  imageUrl,
  live,
}) => {
  const src = imageUrl ?? null;
  return (
    <Link href={href} className={styles.card}>
      <div className={styles.media}>
        {src && (
          <Image
            src={src}
            alt=""
            fill
            sizes="(max-width: 720px) 100vw, 360px"
            className={styles.img}
          />
        )}
        {kicker && <span className={styles.kicker}>{kicker}</span>}
        {live ? (
          <span className={styles.live}>LIVE</span>
        ) : (
          duration && <span className={styles.dur}>{duration}</span>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        {subtitle && <div className={styles.sub}>{subtitle}</div>}
      </div>
    </Link>
  );
};
