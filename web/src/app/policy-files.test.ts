import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "public");

describe("AI/LLM usage policy files", () => {
  it("states a prohibition and is identical at both llms.txt and ai.txt", () => {
    const llms = readFileSync(join(publicDir, "llms.txt"), "utf8");
    expect(llms).toMatch(/does not permit|may not|prohibit/i);
    expect(readFileSync(join(publicDir, "ai.txt"), "utf8")).toBe(llms);
  });
});
