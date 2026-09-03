import "server-only";

import type { ControllerResult } from "@/services/server/controllers";
import * as E from "fp-ts/Either";
import { notFound } from "next/navigation";

export const resolveControllerResult = async <Value>(
    result: ControllerResult<Value>,
): Promise<Value> => {
    const response = await result();

    if (E.isRight(response)) {
        return response.right;
    }

    if (response.left.type === "not-found") {
        notFound();
    }

    throw new Error(`Controller request failed: ${response.left.type}`);
};
