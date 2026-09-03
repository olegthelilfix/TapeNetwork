import Link from "next/link";
import type { FC } from "react";
import styles from "./error.module.css";

const NotFoundPage: FC = () => {
    return (
        <main className={styles.state}>
            <div className={styles.content}>
                <h1 className={styles.title}>Page not found</h1>
                <p className={styles.description}>
                    The page you requested is unavailable or has moved.
                </p>
                <Link className={styles.button} href="/">
                    Back to the homepage
                </Link>
            </div>
        </main>
    );
};

export default NotFoundPage;
