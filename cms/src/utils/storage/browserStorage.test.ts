// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { getStoredJson, getStoredString, removeStoredValue, setStoredJson, setStoredString } from "./browserStorage";

type Session = {
    token: string;
};

const isSession = (value: unknown): value is Session => {
    return typeof value === "object"
        && value !== null
        && "token" in value
        && typeof value.token === "string";
};

describe("browserStorage", () => {
    it("stores and retrieves plain strings", () => {
        setStoredString("test-string", "value");

        expect(getStoredString("test-string")).toBe("value");

        removeStoredValue("test-string");
        expect(getStoredString("test-string")).toBeNull();
    });

    it("returns JSON only when the supplied guard accepts it", () => {
        setStoredJson("test-session", { token: "abc" });
        setStoredJson("test-invalid-session", { token: 1 });

        expect(getStoredJson("test-session", isSession)).toEqual({ token: "abc" });
        expect(getStoredJson("test-invalid-session", isSession)).toBeNull();
    });
});
