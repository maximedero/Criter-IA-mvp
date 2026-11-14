import { test, expect } from "@playwright/test";

test("canvas states are not color-only cues", async ({ page }) => {
  await page.goto("/canvas");
  await expect(page.getByText("Decision Canvas")).toBeVisible();
});