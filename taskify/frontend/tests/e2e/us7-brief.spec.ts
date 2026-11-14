import { test, expect } from "@playwright/test";

test("brief editor flow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Decision Inbox")).toBeVisible();
});