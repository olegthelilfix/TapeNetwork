import dayjs from "dayjs";
import { describe, expect, it } from "vitest";

import { serializeDateTimeFields, toIsoDateTime } from "./toIsoDateTime";

describe("toIsoDateTime", () => {
    it("serializes a Dayjs value to ISO-8601", () => {
        const date = dayjs("2025-03-04T05:06:07.000Z");

        expect(toIsoDateTime(date)).toBe("2025-03-04T05:06:07.000Z");
    });

    it("does not change values that are not dates", () => {
        expect(toIsoDateTime("already-serialized")).toBe("already-serialized");
    });
});

describe("serializeDateTimeFields", () => {
    it("changes only configured date fields", () => {
        const values = {
            publishedAt: dayjs("2025-03-04T05:06:07.000Z"),
            title: "Episode title",
        };

        expect(serializeDateTimeFields(values, ["publishedAt"])).toEqual({
            publishedAt: "2025-03-04T05:06:07.000Z",
            title: "Episode title",
        });
    });
});
