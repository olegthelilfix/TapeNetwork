import "server-only";

import * as E from "fp-ts/Either";
import type { ControllerResult } from "./controller.utils";

type ResolveControllerResultOptions = {
    readonly onNotFound: () => never;
};

export const resolveControllerResult = async <Value>(
    result: ControllerResult<Value>,
    { onNotFound }: ResolveControllerResultOptions,
): Promise<Value> => {
    const response = await result();

    if (E.isRight(response)) {
        return response.right;
    }

    if (response.left.type === "not-found") {
        return onNotFound();
    }

    throw new Error(`Controller request failed: ${response.left.type}`);
};
