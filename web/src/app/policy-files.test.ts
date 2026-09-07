import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

describe("AI/LLM usage policy files", () => {
  it("states a prohibition and is identical at both llms.txt and ai.txt", () => {
    const llms = readFileSync("public/llms.txt", "utf8");
    expect(llms).toMatch(/does not permit|may not|prohibit/i);
    expect(readFileSync("public/ai.txt", "utf8")).toBe(llms);
  });
});
