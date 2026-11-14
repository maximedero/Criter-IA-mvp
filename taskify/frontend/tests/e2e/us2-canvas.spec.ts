import { test, expect } from "@playwright/test";

test("render canvas with dimensions", async ({ page }) => {
  await page.goto("/canvas");
  await expect(page.getByText("Decision Canvas")).toBeVisible();
});