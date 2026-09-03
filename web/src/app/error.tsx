"use client";

import type { FC } from "react";
import styles from "./error.module.css";

type ErrorPageProps = {
    readonly error: Error & { readonly digest?: string };
    readonly reset: () => void;
};

const ErrorPage: FC<ErrorPageProps> = ({ reset }) => {
    const handleRetry = (): void => {
        reset();
    };

    return (
        <main className={styles.state}>
            <div className={styles.content}>
                <h1 className={styles.title}>Something went wrong</h1>
                <p className={styles.description}>
                    We could not load this page. Please try again.
                </p>
                <button className={styles.button} onClick={handleRetry} type="button">
                    Try again
                </button>
            </div>
        </main>
    );
};

export default ErrorPage;
