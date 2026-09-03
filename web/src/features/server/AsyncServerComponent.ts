import type { ReactElement } from "react";

/**
 * React 18's FC type returns ReactNode and cannot represent an async Server
 * Component. This type retains explicit props while preserving Next.js SSR.
 */
export type AsyncServerComponent<Props> = (
    props: Props,
) => Promise<ReactElement>;
