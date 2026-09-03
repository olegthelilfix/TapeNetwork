import type { FC } from "react";
import styles from "./error.module.css";

const LoadingPage: FC = () => {
    return (
        <div aria-live="polite" className={styles.state}>
            <p className={styles.description}>Loading Tape Network…</p>
        </div>
    );
};

export default LoadingPage;
