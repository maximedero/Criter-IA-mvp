import { test, expect } from "@playwright/test";

test("blind comparison page available", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Decision Inbox")).toBeVisible();
});