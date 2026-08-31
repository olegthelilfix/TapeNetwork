import { defineConfig } from "@playwright/test";

// Same scenario as ../robot/smoke.robot — compare the tooling, not the test.
export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    headless: true,
    trace: "on-first-retry",
  },
  reporter: [["html", { open: "never" }], ["list"]],
});
