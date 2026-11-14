import { test, expect } from "@playwright/test";

test("create case from inbox", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Decision Inbox")).toBeVisible();
});