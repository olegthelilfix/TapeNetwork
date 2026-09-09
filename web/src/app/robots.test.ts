import { describe, expect,it } from "vitest";

import robots from "./robots";

const AI_CRAWLER_NAMES = ["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot",
  "anthropic-ai", "Claude-Web", "CCBot", "Google-Extended", "PerplexityBot",
  "Bytespider", "Amazonbot", "Applebot-Extended", "meta-externalagent"];

function ruleList() {
  const { rules } = robots();
  return Array.isArray(rules) ? rules : [rules];
}

function disallowFor(userAgent: string) {
  return ruleList().find((r) => r.userAgent === userAgent)?.disallow;
}

describe("robots", () => {
  it("puts the wildcard rule first and disallows everything for it", () => {
    expect(ruleList()[0]?.userAgent).toBe("*");
    expect(disallowFor("*")).toBe("/");
  });

  it("disallows every named AI/LLM crawler, with no extras or duplicates", () => {
    expect(ruleList()).toHaveLength(1 + AI_CRAWLER_NAMES.length);
    const userAgents = ruleList().map((r) => r.userAgent);
    expect(new Set(userAgents).size).toBe(userAgents.length);
    const missing = AI_CRAWLER_NAMES.filter((bot) => disallowFor(bot) !== "/");
    expect(missing).toEqual([]);
  });

  it("never allows anything, for any rule", () => {
    expect(ruleList().every((r) => !("allow" in r))).toBe(true);
  });

  it("does not advertise a sitemap", () => {
    expect("sitemap" in robots()).toBe(false);
  });
});
