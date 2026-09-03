"use client";

import type { FC } from "react";
import styles from "./error.module.css";

type GlobalErrorPageProps = {
    readonly error: Error & { readonly digest?: string };
    readonly reset: () => void;
};

const GlobalErrorPage: FC<GlobalErrorPageProps> = ({ reset }) => {
    const handleRetry = (): void => {
        reset();
    };

    return (
        <html lang="en">
            <body>
                <main className={styles.state}>
                    <div className={styles.content}>
                        <h1 className={styles.title}>Tape Network is unavailable</h1>
                        <p className={styles.description}>
                            Please try loading the site again.
                        </p>
                        <button className={styles.button} onClick={handleRetry} type="button">
                            Try again
                        </button>
                    </div>
                </main>
            </body>
        </html>
    );
};

export default GlobalErrorPage;
