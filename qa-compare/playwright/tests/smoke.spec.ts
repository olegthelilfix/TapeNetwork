import { test, expect } from "@playwright/test";

// Scenario (identical to ../robot/smoke.robot):
//   1. open home
//   2. title contains "Tape"
//   3. click the "Shows" nav link
//   4. land on /shows with an <h1> "Shows"
test("home navigates to Shows", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Tape/i);

  await page.locator('a[href="/shows"]').first().click();

  await expect(page).toHaveURL(/\/shows$/);
  await expect(page.getByRole("heading", { level: 1, name: "Shows" })).toBeVisible();
});
