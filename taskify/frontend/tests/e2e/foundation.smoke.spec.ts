import { test, expect } from "@playwright/test";

test("foundation app starts", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Decision Workspace" })).toBeVisible();
});
