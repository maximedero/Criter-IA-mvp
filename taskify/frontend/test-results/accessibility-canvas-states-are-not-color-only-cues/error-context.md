# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> canvas states are not color-only cues
- Location: tests\e2e\accessibility.spec.ts:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Lienzo de decisión')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Lienzo de decisión') with timeout 5000ms
  - waiting for getByText('Lienzo de decisión')

```

```yaml
- main:
  - heading "Espacio de decisiones" [level=1]
  - heading "Bandeja" [level=2]
  - button "Nuevo caso"
  - paragraph: No hay casos cargados.
```

# Test source

```ts
  1 | import { test, expect } from "@playwright/test";
  2 | 
  3 | test("canvas states are not color-only cues", async ({ page }) => {
  4 |   await page.goto("/canvas");
> 5 |   await expect(page.getByText("Lienzo de decisión")).toBeVisible();
    |                                                      ^ Error: expect(locator).toBeVisible() failed
  6 | });
```