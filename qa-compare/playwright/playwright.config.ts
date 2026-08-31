import { defineConfig } from "@playwright/test";

// Same scenario as ../robot/smoke.robot — compare the tooling, not the test.
export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: process.env.BASE_URL ?? "http://34.13.255.70",
    headless: true,
    trace: "on",                  // full step-by-step trace every run (open with show-trace / report)
    video: "retain-on-failure",   // keep a screen recording when a test fails
    screenshot: "only-on-failure",
  },
  reporter: [["html", { open: "never" }], ["list"]],
});
