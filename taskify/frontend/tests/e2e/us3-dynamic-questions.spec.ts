import { test, expect } from "@playwright/test";

test("dynamic question panel shows asked count", async ({ page }) => {
  await page.goto("/canvas");
  await expect(page.getByText("Preguntas dinámicas")).toBeVisible();
});