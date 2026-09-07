import type { MetadataRoute } from "next";

// The wildcard rule already disallows everyone. These named entries exist so
// nobody deletes it thinking the list alone covers crawlers (issue #57).
// Google-Extended and Applebot-Extended aren't crawlers: they're training-use
// opt-out tokens layered on an existing one.
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-Web",
  "CCBot",
  "Google-Extended",
  "PerplexityBot",
  "Bytespider",
  "Amazonbot",
  "Applebot-Extended",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", disallow: "/" },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
  };
}
